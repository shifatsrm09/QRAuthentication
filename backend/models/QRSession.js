const mongoose = require("mongoose");

const qrSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["pending", "authenticated"], default: "pending" },
  createdAt: { type: Date, default: Date.now, expires: 300 } // auto-expire after 5 minutes
});

module.exports = mongoose.model("QRSession", qrSessionSchema);
