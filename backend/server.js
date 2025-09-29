const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");  
const connectDB = require("./config/db");
const QRSession = require("./models/QRSession"); // for index sync

dotenv.config();

const app = express();

// ✅ Connect to DB
connectDB().then(async () => {
  try {
    await QRSession.syncIndexes(); // remove old unique indexes not in schema
    console.log("✅ QRSession indexes synced");
  } catch (err) {
    console.error("❌ Failed to sync indexes:", err.message);
  }
});

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: "*", // or your React frontend URL
  credentials: true
}));

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/qr", require("./routes/qrRoutes"));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
