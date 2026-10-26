import { randomUUID } from "node:crypto";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";

function getDb() {
  const existingApp = getApps().find((app) => app.name === "[DEFAULT]");

  if (existingApp) return getFirestore(existingApp);

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("Firebase credentials are not configured.");

  const serviceAccount = JSON.parse(json);
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  return getFirestore(app);
}

function isAdmin(req: any) {
  return verifyToken(extractAuthToken(req)).valid;
}

function errorResponse(res: any, status: number, error: string) {
  return res.status(status).json({ success: false, error });
}

function parseBody(req: any) {
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body || {};
}

const allowedStatuses = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db = getDb();
    const reservations = db.collection("reservations");
    const body = parseBody(req);

    // Customer can create a reservation.
    // Existing reservations are only visible to an authenticated admin.
    if (req.method === "POST") {
      const input = body.reservation || body;

      if (
        typeof input.name !== "string" ||
        !input.name.trim() ||
        typeof input.phone !== "string" ||
        !input.phone.trim() ||
        !input.date ||
        !input.time ||
        !Number.isInteger(Number(input.guests)) ||
        Number(input.guests) < 1
      ) {
        return errorResponse(res, 400, "Valid reservation details are required.");
      }

      const id = `R-${randomUUID()}`;
      const record = {
        id,
        name: input.name.trim(),
        phone: input.phone.trim(),
        guests: Number(input.guests),
        date: String(input.date),
        time: String(input.time),
        note: typeof input.note === "string" ? input.note.trim() : "",
        status: "Pending",
        createdAtISO: new Date().toISOString(),
      };

      await reservations.doc(id).create(record);

      return res.status(201).json({ success: true, reservation: record });
    }

    if (!isAdmin(req)) {
      return errorResponse(res, 401, "Valid admin login required.");
    }

    if (req.method === "GET") {
      const snapshot = await reservations.get();
      const items = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      items.sort((a: any, b: any) =>
        String(b.createdAtISO || "").localeCompare(
          String(a.createdAtISO || "")
        )
      );

      return res.status(200).json({
        success: true,
        reservations: items,
        source: "firestore",
      });
    }

    if (req.method === "PATCH") {
      const id = String(body.id || "");
      const status = String(body.status || "");

      if (!id || !allowedStatuses.includes(status)) {
        return errorResponse(res, 400, "Valid reservation ID and status required.");
      }

      const ref = reservations.doc(id);
      const snapshot = await ref.get();

      if (!snapshot.exists) {
        return errorResponse(res, 404, "Reservation not found.");
      }

      await ref.update({ status });

      return res.status(200).json({
        success: true,
        reservation: { ...snapshot.data(), id, status },
      });
    }

    if (req.method === "DELETE") {
      const id = String(req.query?.id || body.id || "");

      if (!id) return errorResponse(res, 400, "Reservation ID required.");

      const ref = reservations.doc(id);
      const snapshot = await ref.get();

      if (!snapshot.exists) {
        return errorResponse(res, 404, "Reservation not found.");
      }

      await ref.delete();

      return res.status(200).json({ success: true, deletedId: id });
    }

    return errorResponse(res, 405, "Method not allowed.");
  } catch (error) {
    console.error("Reservations API error:", error);
    return errorResponse(res, 500, "Reservation request failed.");
  }
}
