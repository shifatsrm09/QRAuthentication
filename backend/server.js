// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");  
const connectDB = require("./config/db");
const QRSession = require("./models/QRSession"); // for index sync

// Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // Set to your frontend URL in production
  credentials: true
}));

// ✅ Connect to MongoDB and sync indexes
connectDB().then(async () => {
  try {
    await QRSession.syncIndexes(); // remove old unique indexes not in schema
    console.log("✅ QRSession indexes synced");
  } catch (err) {
    console.error("❌ Failed to sync indexes:", err.message);
  }
}).catch(err => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
});

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/qr", require("./routes/qrRoutes"));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// ✅ Start server (Render-ready)
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
