// GET /api/qr/status?sessionId=...
// Polled by the desktop. Once the phone has confirmed, the first poll receives
// a real JWT and the session is marked "consumed" so it can't be replayed.
const connectDB = require("../../../lib/db");
const QRSession = require("../../../lib/models/QRSession");
const { checkSessionId } = require("../../../lib/qrSession");
const { fail, allowMethods, signToken } = require("../../../lib/http");

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ["GET"])) return;

  const { sessionId } = req.query;
  if (!sessionId || typeof sessionId !== "string") {
    return fail(res, 400, "Session ID is required");
  }

  // Forged, malformed or expired ids are rejected without touching the database.
  const { state } = checkSessionId(sessionId);
  if (state === "invalid") {
    return res.status(404).json({ success: false, authenticated: false, error: "QR session not found" });
  }
  if (state === "expired") {
    return res.status(410).json({ success: false, authenticated: false, error: "QR session expired" });
  }

  try {
    await connectDB();

    // No row yet means the phone hasn't confirmed: the common case while polling (one query).
    const session = await QRSession.findOne({ sessionId });
    if (!session) {
      return res.json({ success: true, authenticated: false, status: "pending" });
    }
    if (session.status !== "authenticated") {
      return res.json({ success: true, authenticated: false, status: session.status });
    }

    // Atomically claim it so only one poll ever receives the token (single use)
    const claimed = await QRSession.findOneAndUpdate(
      { sessionId, status: "authenticated" },
      { $set: { status: "consumed" } }
    ).populate("userId", "name email");

    if (!claimed || !claimed.userId) {
      return res.json({ success: true, authenticated: false, status: "consumed" });
    }

    const user = claimed.userId;
    return res.json({
      success: true,
      authenticated: true,
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("QR status error:", err);
    return fail(res, 500, "Failed to check QR status");
  }
};
