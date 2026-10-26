import { randomUUID } from "node:crypto";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

function getDb() {
  const existingApp = getApps().find((app) => app.name === "[DEFAULT]");

  if (existingApp) {
    return getFirestore(existingApp);
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error("Firebase credentials are not configured.");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  return getFirestore(app);
}

const GIFTS_COLLECTION = "giftProducts";
const ORDERS_COLLECTION = "giftingOrders";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Only JPG, PNG, WebP, and AVIF images are allowed."));
    }
  },
});

function uploadGiftImage(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "the-classic-crush/gifts",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error("Image upload failed."));
          }
        }
      )
      .end(buffer);
  });
}

function parseBody(req: any) {
  if (typeof req.body === "string") {
    return JSON.parse(req.body);
  }

  return req.body || {};
}

function isAdmin(req: any) {
  return verifyToken(extractAuthToken(req)).valid;
}

function sendError(res: any, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const db = getDb();
    const gifts = db.collection(GIFTS_COLLECTION);
    const orders = db.collection(ORDERS_COLLECTION);

    const body = parseBody(req);
    const type = String(req.query?.type || body.type || "");
    // Admin: upload a gift product image.
if (req.method === "POST" && req.query?.action === "upload_product_image") {
  if (!isAdmin(req)) {
    return sendError(res, 401, "Unauthorized: valid admin token required.");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return sendError(res, 500, "Cloudinary configuration is missing.");
  }

  return upload.single("file")(req, res, async (uploadError: any) => {
    if (uploadError) {
      return sendError(res, 400, uploadError.message || "Image upload failed.");
    }

    try {
      if (!req.file) {
        return sendError(res, 400, "Please select an image.");
      }

      const result = await uploadGiftImage(req.file.buffer);

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Gift image upload error:", error);
      return sendError(res, 500, "Could not upload gift image.");
    }
  });
}

    // Public: read the gift catalogue.
    if (req.method === "GET" && type !== "orders") {
      const snapshot = await gifts.get();

      const items = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      return res.status(200).json({
        success: true,
        items,
        source: "firestore",
      });
    }

    // Customers can place an order without an admin token.
    // All other order access requires admin authentication.
    if (
      req.method === "POST" &&
      body.action === "place_gift_order"
    ) {
      const input = body.order;

      if (!input || typeof input !== "object") {
        return sendError(res, 400, "Gift order details are required.");
      }

      const orderId = `G-${randomUUID()}`;
      const now = new Date();

      const order = {
        ...input,
        id: orderId,
        createdAt: now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAtISO: now.toISOString(),
      };

      await orders.doc(orderId).set(order);

      return res.status(201).json({
        success: true,
        order,
      });
    }

    // All remaining operations require an admin token.
    if (!isAdmin(req)) {
      return sendError(
        res,
        401,
        "Unauthorized: valid admin token required."
      );
    }

    // Admin: list gift orders.
    if (req.method === "GET" && type === "orders") {
      const snapshot = await orders.get();

      const orderList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      orderList.sort((a: any, b: any) =>
        String(b.createdAtISO || "").localeCompare(
          String(a.createdAtISO || "")
        )
      );

      return res.status(200).json({
        success: true,
        orders: orderList,
        source: "firestore",
      });
    }

    // Admin: add one gift or batch-save catalogue items.
    if (req.method === "POST") {
      if (Array.isArray(body.items)) {
        if (body.items.some((item: any) => !item?.id)) {
          return sendError(
            res,
            400,
            "Every gift product must have an ID."
          );
        }

        // Firestore batches support at most 500 writes.
        for (let i = 0; i < body.items.length; i += 500) {
          const batch = db.batch();

          for (const item of body.items.slice(i, i + 500)) {
            batch.set(gifts.doc(String(item.id)), {
              ...item,
              id: String(item.id),
            });
          }

          await batch.commit();
        }

        return res.status(200).json({
          success: true,
          count: body.items.length,
        });
      }

      if (!body.item || typeof body.item !== "object") {
        return sendError(res, 400, "Gift product data is required.");
      }

      const id = String(body.item.id || `gift-${randomUUID()}`);
      const item = { ...body.item, id };

      await gifts.doc(id).set(item);

      return res.status(201).json({
        success: true,
        item,
      });
    }

    // Admin: update a gift product.
    if (req.method === "PUT") {
      const updated = body.item || body;

      if (!updated?.id) {
        return sendError(res, 400, "Gift product ID is required.");
      }

      const id = String(updated.id);
      const ref = gifts.doc(id);
      const existing = await ref.get();

      if (!existing.exists) {
        return sendError(res, 404, "Gift product not found.");
      }

      const item = {
        ...existing.data(),
        ...updated,
        id,
      };

      await ref.set(item);

      return res.status(200).json({
        success: true,
        item,
      });
    }

    // Admin: update gift order status.
    if (req.method === "PATCH") {
      const id = String(body.id || body.orderId || "");
      const status = String(body.status || "");

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled",
      ];

      if (!id || !allowedStatuses.includes(status)) {
        return sendError(
          res,
          400,
          "A valid order ID and status are required."
        );
      }

      const ref = orders.doc(id);
      const existing = await ref.get();

      if (!existing.exists) {
        return sendError(res, 404, "Gift order not found.");
      }

      await ref.update({ status });

      return res.status(200).json({
        success: true,
        order: { ...existing.data(), id, status },
      });
    }

    // Admin: delete a gift product or gift order.
    if (req.method === "DELETE") {
      const id = String(req.query?.id || body.id || "");
      const target = type === "orders" ? orders : gifts;

      if (!id) {
        return sendError(res, 400, "ID is required.");
      }

      const ref = target.doc(id);
      const existing = await ref.get();

      if (!existing.exists) {
        return sendError(
          res,
          404,
          type === "orders"
            ? "Gift order not found."
            : "Gift product not found."
        );
      }

      await ref.delete();

      return res.status(200).json({
        success: true,
        deletedId: id,
      });
    }

    return sendError(res, 405, "Method not allowed.");
  } catch (error: any) {
    console.error("Gifting API error:", error);

    return sendError(
      res,
      500,
      "Gifting request failed. Check the server terminal for details."
    );
  }
}

