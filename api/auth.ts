import { getAdminCredentials, createToken, verifyToken, extractAuthToken } from "./_lib/authHelper.ts";

export default async function handler(req: any, res: any) {
  // CORS & Security headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Verify existing session token
  if (req.method === "GET") {
    const token = extractAuthToken(req);
    const verification = verifyToken(token);

    if (verification.valid) {
      return res.status(200).json({
        authenticated: true,
        email: verification.email,
        message: "Session is valid",
      });
    }

    return res.status(401).json({
      authenticated: false,
      error: "Unauthorized: Invalid or expired session token",
    });
  }

  // POST: Login endpoint
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { email, password, action } = body;

      // Handle token verification via POST
      if (action === "verify") {
        const token = body.token || extractAuthToken(req);
        const verification = verifyToken(token);
        if (verification.valid) {
          return res.status(200).json({ authenticated: true, email: verification.email });
        }
        return res.status(401).json({ authenticated: false, error: "Invalid token" });
      }

      // Handle Login
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "Email and password are required.",
        });
      }

      const { email: adminEmail, password: adminPassword } = getAdminCredentials();
      const inputEmail = String(email).trim().toLowerCase();

      if (inputEmail === adminEmail && String(password) === adminPassword) {
        const token = createToken(inputEmail);
        return res.status(200).json({
          success: true,
          token,
          user: {
            email: inputEmail,
            role: "admin",
          },
          expiresIn: 7 * 24 * 3600,
        });
      }

      // Invalid credentials
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: "Internal server error during authentication: " + (err?.message || "Unknown error"),
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
