// GET /api/qr/generate
const crypto = require("crypto");
const connectDB = require("../../../lib/db");
const QRSession = require("../../../lib/models/QRSession");
const { fail, allowMethods, getOrigin } = require("../../../lib/http");

const QR_EXPIRY_MINUTES = 5; // keep in sync with the TTL index in models/QRSession.js

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    await connectDB();

    const sessionId = crypto.randomBytes(16).toString("hex");
    await QRSession.create({
      sessionId,
      expiresAt: new Date(Date.now() + QR_EXPIRY_MINUTES * 60 * 1000),
    });

    // Frontend and API share one origin on Vercel, so the phone opens
    // the static confirm page from the same site it's logged into.
    const qrURL = `${getOrigin(req)}/qr-auth.html?sessionId=${sessionId}`;

    return res.json({
      success: true,
      sessionId,
      qrURL,
      expiresIn: `${QR_EXPIRY_MINUTES} minutes`,
    });
  } catch (err) {
    console.error("QR generation error:", err);
    return fail(res, 500, "Failed to generate QR code", { error: "Failed to generate QR code" });
  }
};
