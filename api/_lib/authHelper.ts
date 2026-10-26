import crypto from "node:crypto";

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!email || !password || !secret) {
    throw new Error(
      "Missing ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_SESSION_SECRET environment variable."
    );
  }

  if (secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  }

  return { email, password, secret };
}

export function createToken(email: string): string {
  const { secret } = getAdminCredentials();
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      role: "admin",
      iat: now,
      exp: now + 7 * 24 * 60 * 60,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(
  token: string | undefined | null
): { valid: boolean; email?: string } {
  if (!token) return { valid: false };

  try {
    const cleanToken = token.startsWith("Bearer ")
      ? token.slice(7).trim()
      : token.trim();

    const parts = cleanToken.split(".");
    if (parts.length !== 3) return { valid: false };

    const [headerPart, payloadPart, signature] = parts;
    const { secret } = getAdminCredentials();

    const header = JSON.parse(
      Buffer.from(headerPart, "base64url").toString("utf8")
    );

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return { valid: false };
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${headerPart}.${payloadPart}`)
      .digest();

    const received = Buffer.from(signature, "base64url");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return { valid: false };
    }

    const data = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8")
    );

    const now = Math.floor(Date.now() / 1000);

    if (
      data.role !== "admin" ||
      typeof data.email !== "string" ||
      !Number.isFinite(data.exp) ||
      data.exp <= now
    ) {
      return { valid: false };
    }

    return {
      valid: true,
      email: data.email,
    };
  } catch {
    return { valid: false };
  }
}

export function extractAuthToken(req: any): string | null {
  const authHeader =
    req.headers?.authorization || req.headers?.Authorization;

  if (
    typeof authHeader === "string" &&
    authHeader.startsWith("Bearer ")
  ) {
    return authHeader.slice(7).trim();
  }

  if (typeof req.query?.token === "string") {
    return req.query.token.trim();
  }

  return null;
}

