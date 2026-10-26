import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "node:http";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import dotenv from "dotenv";

const root = process.cwd();

// Load local environment variables before importing API handlers.
dotenv.config({ path: path.resolve(root, ".env.local") });

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

async function configureFirebaseForLocalDevelopment() {
  if (process.env.NODE_ENV === "production") return;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) return;

  const secretsDir = path.resolve(root, "secrets");

  try {
    const files = await readdir(secretsDir);
    const serviceAccountFile = files.find((file) => file.endsWith(".json"));

    if (!serviceAccountFile) {
      console.warn(
        "Firebase credentials not found in secrets/*.json. Firebase-backed requests may fail.",
      );
      return;
    }

    const filePath = path.join(secretsDir, serviceAccountFile);
    const credentials = await readFile(filePath, "utf8");

    // Validate the JSON before making it available to the API handlers.
    const parsed = JSON.parse(credentials);

    if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
      throw new Error("The service-account JSON is missing required fields.");
    }

    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify(parsed);
    console.log(
      "Firebase service-account credentials loaded for local development.",
    );
  } catch (error) {
    console.error("Could not load local Firebase credentials:", error);
    throw error;
  }
}

async function main() {
  await configureFirebaseForLocalDevelopment();

  const routes = [
    "auth",
    "menu",
    "orders",
    "gifting",
    "reservations",
    "health",
    "gallery",
  ];

  for (const route of routes) {
    const modulePath = path.resolve(root, "api", `${route}.ts`);
    const moduleUrl = pathToFileURL(modulePath).href;
    const routeModule = await import(moduleUrl);
    const handler = routeModule.default;

    app.all(`/api/${route}`, async (req, res, next) => {
      try {
        await handler(req, res);
      } catch (error) {
        next(error);
      }
    });
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: path.resolve(root, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(root, "dist");

    app.use(express.static(distDir));

    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api/")) {
        res.sendFile(path.join(distDir, "index.html"), (error) => {
          if (error && !res.headersSent) next(error);
        });
      } else {
        next();
      }
    });
  }

  app.use((error: any, _req: any, res: any, _next: any) => {
    console.error("Server error:", error);

    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  createHttpServer(app).listen(port, "127.0.0.1", () => {
    console.log(`The Classic Crush running at http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
  });
}

main().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
