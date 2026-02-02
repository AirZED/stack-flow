/**
 * Health check endpoint for uptime monitoring.
 * Used by external monitors (e.g. UptimeRobot) to demonstrate ≥80% 7-day uptime.
 * GET /api/health returns 200 + JSON; non-GET returns 405.
 */
module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    status: "ok",
    service: "StackFlow",
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION || "0.4.0-premium",
  });
};
