const mongoose = require("mongoose");
require("./User"); // register the User model so populate("userId") works in any function that loads only this file

const qrSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // pending -> (phone confirms) -> authenticated -> (desktop collects token) -> consumed
  status: {
    type: String,
    enum: ["pending", "authenticated", "consumed"],
    default: "pending",
  },
  // Explicit expiry checked in code (Mongo's TTL monitor only runs ~once/minute)
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // TTL cleanup after 5 minutes
});

module.exports =
  mongoose.models.QRSession || mongoose.model("QRSession", qrSessionSchema);
