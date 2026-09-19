const express = require("express");
const cors = require("cors");
const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.FRONTEND_URL || false }));
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "16kb" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", (req, res, next) => {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    return res.status(503).json({ message: "Server configuration is missing MONGO_URI or JWT_SECRET" });
  }
  next();
});
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/qr", require("./routes/qrRoutes"));
app.use((req, res) => res.status(404).json({ message: "API route not found" }));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: status === 400 ? "Invalid JSON body" : "Request failed" });
});
module.exports = app;
