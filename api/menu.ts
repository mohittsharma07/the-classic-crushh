
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

function getDb() {
  const existingApp = getApps().find(
    (app) => app.name === "[DEFAULT]"
  );

  if (existingApp) {
    return getFirestore(existingApp);
  }

  const serviceAccountJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

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

const COLLECTION = "menuItems";
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
      callback(
        new Error("Only JPG, PNG, WebP, and AVIF images are allowed."),
      );
    }
  },
});

function uploadMenuImage(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: "the-classic-crush/menu",
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
      },
    ).end(buffer);
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (
  req.method === "POST" &&
  req.query?.action === "upload_product_image"
) {
  const token = extractAuthToken(req);
  const auth = verifyToken(token);

  if (!auth.valid) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: valid admin token required.",
    });
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return res.status(500).json({
      success: false,
      error: "Cloudinary configuration is missing.",
    });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return upload.single("file")(req, res, async (uploadError: any) => {
    if (uploadError) {
      return res.status(400).json({
        success: false,
        error: uploadError.message || "Image upload failed.",
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Please select an image.",
        });
      }

      const result = await uploadMenuImage(req.file.buffer);

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Menu image upload error:", error);

      return res.status(500).json({
        success: false,
        error: "Could not upload menu image.",
      });
    }
  });
}

  try {
    const db = getDb();
    const menuCollection = db.collection(COLLECTION);

    // Public: load menu items from Firestore
    if (req.method === "GET") {
      const snapshot = await menuCollection.get();

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

    // Admin authentication required for changes
    const token = extractAuthToken(req);
    const auth = verifyToken(token);

    if (!auth.valid) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Admin authorization token required.",
      });
    }

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    // Add one item or save a batch of items
    if (req.method === "POST") {
      if (Array.isArray(body.items)) {
        const batch = db.batch();

        for (const item of body.items) {
          if (!item?.id) {
            return res.status(400).json({
              success: false,
              error: "Every menu item must have an ID.",
            });
          }

          batch.set(menuCollection.doc(String(item.id)), item);
        }

        await batch.commit();

        return res.status(200).json({
          success: true,
          count: body.items.length,
        });
      }

      if (!body.item || typeof body.item !== "object") {
        return res.status(400).json({
          success: false,
          error: "Missing item data.",
        });
      }

      const item = body.item;
      const id = String(item.id || `item-${Date.now()}`);
      const savedItem = { ...item, id };

      await menuCollection.doc(id).set(savedItem);

      return res.status(201).json({
        success: true,
        item: savedItem,
      });
    }

    // Update an existing item
    if (req.method === "PUT") {
      const updatedItem = body.item || body;

      if (!updatedItem?.id) {
        return res.status(400).json({
          success: false,
          error: "Item ID required.",
        });
      }

      const id = String(updatedItem.id);
      const ref = menuCollection.doc(id);
      const existing = await ref.get();

      if (!existing.exists) {
        return res.status(404).json({
          success: false,
          error: "Menu item not found.",
        });
      }

      const savedItem = {
        ...existing.data(),
        ...updatedItem,
        id,
      };

      await ref.set(savedItem);

      return res.status(200).json({
        success: true,
        item: savedItem,
      });
    }

    // Delete an item
    if (req.method === "DELETE") {
      const rawId = req.query?.id || body?.id;

      if (!rawId) {
        return res.status(400).json({
          success: false,
          error: "Item ID required.",
        });
      }

      const id = String(rawId);
      const ref = menuCollection.doc(id);
      const existing = await ref.get();

      if (!existing.exists) {
        return res.status(404).json({
          success: false,
          error: "Menu item not found.",
        });
      }

      await ref.delete();

      return res.status(200).json({
        success: true,
        deletedId: id,
      });
    }

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  } catch (error: any) {
    console.error("Menu API error:", error);

    return res.status(500).json({
      success: false,
      error: "Menu request failed. Check the server terminal for details.",
    });
  }
}
