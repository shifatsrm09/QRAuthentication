// GET /api/qr/status?sessionId=...
// Polled by the desktop. Once the phone has confirmed, the first poll receives
// a real JWT and the session is marked "consumed" so it can't be replayed.
const connectDB = require("../../../lib/db");
const QRSession = require("../../../lib/models/QRSession");
const { fail, allowMethods, signToken } = require("../../../lib/http");

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ["GET"])) return;

  const { sessionId } = req.query;
  if (!sessionId || typeof sessionId !== "string") {
    return fail(res, 400, "Session ID is required");
  }

  try {
    await connectDB();

    // Atomically claim an authenticated session (single use)
    const claimed = await QRSession.findOneAndUpdate(
      {
        sessionId,
        status: "authenticated",
        userId: { $ne: null },
        expiresAt: { $gt: new Date() },
      },
      { $set: { status: "consumed" } }
    ).populate("userId", "name email");

    if (claimed && claimed.userId) {
      const user = claimed.userId;
      return res.json({
        success: true,
        authenticated: true,
        token: signToken(user._id),
        user: { id: user._id, name: user.name, email: user.email },
      });
    }

    // Not claimable: figure out why
    const session = await QRSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({
        success: false,
        authenticated: false,
        error: "QR session not found",
      });
    }
    if (session.expiresAt && session.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        authenticated: false,
        error: "QR session expired",
      });
    }

    return res.json({ success: true, authenticated: false, status: session.status });
  } catch (err) {
    console.error("QR status error:", err);
    return fail(res, 500, "Failed to check QR status");
  }
};
