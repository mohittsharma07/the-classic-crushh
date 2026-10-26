import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import crypto from "node:crypto";
import { verifyToken, extractAuthToken } from "./_lib/authHelper.ts";

function getDb() {
  const existingApp = getApps().find((app) => app.name === "[DEFAULT]");

  if (existingApp) return getFirestore(existingApp);

  const serviceAccountJson = process.env.FFIREBASE_SERVICE_ACCOUNT_JSON;

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

const COLLECTION = "galleryItems";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      callback(
        new Error("Only JPEG, PNG, WebP and AVIF images are allowed."),
      );
      return;
    }

    callback(null, true);
  },
});

function uploadToCloudinary(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "the-classic-crush/gallery",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            const cloudinaryError = error as any;

            console.error("Cloudinary upload diagnostics:", {
              message: cloudinaryError.message,
              http_code: cloudinaryError.http_code,
              name: cloudinaryError.name,
              error: cloudinaryError.error,
              requestId: cloudinaryError.request_id,
            });

            reject(error);
          } else if (!result) {
            reject(new Error("Cloudinary returned no result."));
          } else {
            resolve(result);
          }
        },
      )
      .end(buffer);
  });
}

function isAdmin(req: any) {
  return verifyToken(extractAuthToken(req)).valid;
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const db = getDb();
    const collection = db.collection(COLLECTION);

    // Public gallery read
    if (req.method === "GET") {
      const snapshot = await collection.get();

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

    // All gallery changes require admin authentication
    if (!isAdmin(req)) {
      return res.status(401).json({
        success: false,
        error: "Admin authorization required.",
      });
    }

    // Upload an image and save its metadata
    if (req.method === "POST") {
      return upload.single("file")(req, res, async (uploadError: any) => {
        try {
          if (uploadError) {
            const status =
              uploadError instanceof multer.MulterError
                ? uploadError.code === "LIMIT_FILE_SIZE"
                  ? 413
                  : 400
                : 400;

            return res.status(status).json({
              success: false,
              error: uploadError.message || "Image upload failed.",
            });
          }

          if (!req.file) {
            return res.status(400).json({
              success: false,
              error: "Please select an image file.",
            });
          }

          const caption = cleanText(req.body?.caption, 160);
          const category = cleanText(req.body?.category, 60);
          const aspect = req.body?.aspect;
          const isVisible = req.body?.isVisible !== "false";

          if (!caption || !category) {
            return res.status(400).json({
              success: false,
              error: "Caption and category are required.",
            });
          }

          if (aspect !== "landscape" && aspect !== "portrait") {
            return res.status(400).json({
              success: false,
              error: "Invalid image aspect.",
            });
          }

          const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
          const apiKey = process.env.CLOUDINARY_API_KEY;
          const apiSecret = process.env.CLOUDINARY_API_SECRET;

          if (!cloudName || !apiKey || !apiSecret) {
            return res.status(500).json({
              success: false,
              error: "Cloudinary is not configured in .env.local.",
            });
          }

          cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
          });

          const image = await uploadToCloudinary(req.file.buffer);

          if (!image.secure_url || !image.public_id) {
            throw new Error(
              "Cloudinary upload did not return the image URL and ID.",
            );
          }

          const id = crypto.randomUUID();

          const item = {
            id,
            url: image.secure_url,
            publicId: image.public_id,
            caption,
            category,
            aspect,
            isVisible,
            createdAt: new Date().toISOString(),
          };

          try {
            await collection.doc(id).set(item);
          } catch (error) {
            // Remove the uploaded image if saving metadata fails.
            await cloudinary.uploader
              .destroy(image.public_id)
              .catch(() => undefined);

            throw error;
          }

          return res.status(201).json({
            success: true,
            item,
          });
        } catch (error: any) {
          console.error("Gallery upload error details:", {
            message: error?.message,
            http_code: error?.http_code,
            name: error?.name,
            cloudinaryMessage: error?.error?.message,
          });

          return res.status(500).json({
            success: false,
            error:
              error?.error?.message ||
              error?.message ||
              "Could not upload and save the gallery image.",
          });
        }
      });
    }

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // Update caption, category, aspect and visibility
    if (req.method === "PUT" || req.method === "PATCH") {
      const item = body.item || body;
      const id = cleanText(item.id, 150);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Gallery item ID is required.",
        });
      }

      const ref = collection.doc(id);
      const existing = await ref.get();

      if (!existing.exists) {
        return res.status(404).json({
          success: false,
          error: "Gallery item not found.",
        });
      }

      const changes: Record<string, any> = {};

      if (item.caption !== undefined) {
        const caption = cleanText(item.caption, 160);

        if (!caption) {
          return res.status(400).json({
            success: false,
            error: "Caption is required.",
          });
        }

        changes.caption = caption;
      }

      if (item.category !== undefined) {
        const category = cleanText(item.category, 60);

        if (!category) {
          return res.status(400).json({
            success: false,
            error: "Category is required.",
          });
        }

        changes.category = category;
      }

      if (item.aspect !== undefined) {
        if (!["landscape", "portrait"].includes(item.aspect)) {
          return res.status(400).json({
            success: false,
            error: "Invalid image aspect.",
          });
        }

        changes.aspect = item.aspect;
      }

      if (item.isVisible !== undefined) {
        if (typeof item.isVisible !== "boolean") {
          return res.status(400).json({
            success: false,
            error: "Visibility must be true or false.",
          });
        }

        changes.isVisible = item.isVisible;
      }

      if (Object.keys(changes).length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid changes were provided.",
        });
      }

      await ref.update(changes);

      const updated = await ref.get();

      return res.status(200).json({
        success: true,
        item: { ...updated.data(), id },
      });
    }

    // Delete Firestore record and its Cloudinary image
    if (req.method === "DELETE") {
      const id = cleanText(req.query?.id || body.id, 150);

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Gallery item ID is required.",
        });
      }

      const ref = collection.doc(id);
      const existing = await ref.get();

      if (!existing.exists) {
        return res.status(404).json({
          success: false,
          error: "Gallery item not found.",
        });
      }

      const item = existing.data();

      // Delete the database record first, as in the existing behavior.
      await ref.delete();

      if (item?.publicId) {
        try {
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
          const apiKey = process.env.CLOUDINARY_API_KEY;
          const apiSecret = process.env.CLOUDINARY_API_SECRET;

          if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
              cloud_name: cloudName,
              api_key: apiKey,
              api_secret: apiSecret,
            });

            await cloudinary.uploader.destroy(item.publicId);
          }
        } catch (error) {
          console.error("Cloudinary image cleanup failed:", error);
        }
      }

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
    console.error("Gallery API error:", error);

    return res.status(500).json({
      success: false,
      error: "Gallery request failed. Check the server terminal.",
    });
  }
}
