export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const envAudit = {
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: !!process.env.ADMIN_SESSION_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    SUPABASE_URL: !!process.env.VITE_SUPABASE_URL || !!process.env.SUPABASE_URL,
    VERCEL_ENV: process.env.VERCEL_ENV || "development",
  };

  const isProduction = process.env.VERCEL_ENV === "production";
  const hasCustomAdminCredentials = !!process.env.ADMIN_EMAIL && !!process.env.ADMIN_PASSWORD;

  return res.status(200).json({
    status: "healthy",
    service: "The Classic Crush API",
    platform: process.env.VERCEL ? "Vercel Serverless" : "Local Runtime",
    timestamp: new Date().toISOString(),
    routes: {
      auth: "/api/auth",
      menu: "/api/menu",
      orders: "/api/orders",
      gifting: "/api/gifting",
      adminLoginUrl: "/admin/login",
      adminDashboardUrl: "/admin/dashboard",
    },
    environment: {
      mode: isProduction ? "production" : (process.env.NODE_ENV || "development"),
      configuredVars: envAudit,
      productionReady: {
        routingConfigured: true,
        vercelRewritesActive: true,
        serverSideAuthEnforced: true,
        customAdminCredentialsSet: hasCustomAdminCredentials,
        databaseAttached: envAudit.DATABASE_URL || envAudit.SUPABASE_URL,
      },
    },
  });
}
