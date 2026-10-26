import { randomUUID } from "node:crypto";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";

const ALLOWED_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];

function getDb() {
  if (!getApps().length) {
    const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!rawCredentials) {
      throw new Error(
        "Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON."
      );
    }

    const credentials = JSON.parse(rawCredentials);

    initializeApp({
      credential: cert(credentials),
      projectId: credentials.project_id,
    });
  }

  return getFirestore();
}

function parseBody(req: any) {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }
  return req.body || {};
}

function validPhone(phone: string) {
  return /^\d{10}$/.test(phone.replace(/\D/g, ""));
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const db = getDb();
    const orders = db.collection("orders");

    // Customer checkout
    if (req.method === "POST") {
      const body = parseBody(req);

      const customerName = String(body.customerName || "").trim();
      const customerPhone = String(body.customerPhone || "").replace(/\D/g, "");
      const items = body.items;

      if (
        !customerName ||
        customerName.length > 100 ||
        !validPhone(customerPhone) ||
        !Array.isArray(items) ||
        items.length === 0 ||
        items.length > 50
      ) {
        return res.status(400).json({
          success: false,
          error: "Please provide a valid name, 10-digit phone number, and order items.",
        });
      }

      const cleanItems = [];

      for (const item of items) {
        const name = String(item?.name || "").trim();
        const quantity = Number(item?.quantity);
        const price = Number(item?.price);
        const id = String(item?.id || "").trim();

        if (
          !name ||
          name.length > 150 ||
          !Number.isSafeInteger(quantity) ||
          quantity < 1 ||
          quantity > 100 ||
          !Number.isFinite(price) ||
          price < 0 ||
          price > 100000
        ) {
          return res.status(400).json({
            success: false,
            error: "One or more order items are invalid.",
          });
        }

        cleanItems.push({
          id: id || name,
          name,
          quantity,
          price,
        });
      }

      // Note: prices still need to be checked against a trusted server-side
      // menu before this endpoint is suitable for production payments.
      const totalAmount = cleanItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (!Number.isFinite(totalAmount) || totalAmount > 1000000) {
        return res.status(400).json({
          success: false,
          error: "Invalid order total.",
        });
      }

      const orderId = randomUUID();
      const now = new Date();

      const newOrder = {
        id: orderId,
        customerName,
        customerPhone,
        items: cleanItems,
        totalAmount,
        status: "Pending" as OrderStatus,
        orderType: ["Dine-in", "Takeaway", "Delivery"].includes(body.orderType)
          ? body.orderType
          : "Takeaway",
        note: typeof body.note === "string" ? body.note.slice(0, 1000) : "",
        createdAt: now.toISOString(),
        timestamp: now.getTime(),
      };

      await orders.doc(orderId).create(newOrder);

      return res.status(201).json({
        success: true,
        order: newOrder,
      });
    }

    // All order-management operations require admin authentication.
    const token = extractAuthToken(req);
    const auth = verifyToken(token);

    if (!auth.valid) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Admin authorization required.",
      });
    }

    // Admin: list orders
    if (req.method === "GET") {
      const snapshot = await orders.orderBy("timestamp", "desc").get();
      const result = snapshot.docs.map((doc) => doc.data());

      return res.status(200).json({
        success: true,
        orders: result,
        totalCount: result.length,
      });
    }

    // Admin: update status only
    if (req.method === "PATCH" || req.method === "PUT") {
      const body = parseBody(req);
      const orderId = String(body.id || req.query?.id || "").trim();
      const status = body.status as OrderStatus;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: "Order ID is required.",
        });
      }

      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid order status.",
        });
      }

      const ref = orders.doc(orderId);
      const snapshot = await ref.get();

      if (!snapshot.exists) {
        return res.status(404).json({
          success: false,
          error: "Order not found.",
        });
      }

      await ref.update({
        status,
        updatedAt: new Date().toISOString(),
      });

      const updated = await ref.get();

      return res.status(200).json({
        success: true,
        order: updated.data(),
      });
    }

    // Admin: delete order
    if (req.method === "DELETE") {
      const body = parseBody(req);
      const orderId = String(req.query?.id || body.id || "").trim();

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: "Order ID is required.",
        });
      }

      const ref = orders.doc(orderId);
      const snapshot = await ref.get();

      if (!snapshot.exists) {
        return res.status(404).json({
          success: false,
          error: "Order not found.",
        });
      }

      await ref.delete();

      return res.status(200).json({
        success: true,
        deletedId: orderId,
      });
    }

    res.setHeader("Allow", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  } catch (error: any) {
    console.error("Orders API error:", error);

    return res.status(500).json({
      success: false,
      error: "Order service failed. Check server configuration and logs.",
    });
  }
}
