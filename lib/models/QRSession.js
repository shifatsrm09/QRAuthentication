const mongoose = require("mongoose");
require("./User"); // register the User model so populate("userId") works in any function that loads only this file

// A row exists only after the phone confirms a login:
//   confirm -> "authenticated" -> desktop collects its token -> "consumed"
// (Session ids are created and verified without the database: see lib/qrSession.js)
const qrSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["authenticated", "consumed"],
    default: "authenticated",
  },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // TTL cleanup after 5 minutes
});

module.exports =
  mongoose.models.QRSession || mongoose.model("QRSession", qrSessionSchema);
