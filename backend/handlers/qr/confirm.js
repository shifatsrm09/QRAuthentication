// POST /api/qr/confirm   body: { sessionId }   (Authorization: Bearer <phone user's jwt>)
const connectDB = require("../../../lib/db");
const QRSession = require("../../../lib/models/QRSession");
const User = require("../../../lib/models/User");
const { fail, allowMethods, verifyRequestToken } = require("../../../lib/http");

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ["POST"])) return;

  const { sessionId } = req.body || {};
  if (!sessionId || typeof sessionId !== "string") {
    return fail(res, 400, "Session ID is required");
  }

  const decoded = verifyRequestToken(req);
  if (!decoded) {
    return fail(res, 401, "Not authenticated on this device. Please log in first.");
  }

  try {
    await connectDB();

    const user = await User.findById(decoded.id).select("name email");
    if (!user) return fail(res, 401, "User no longer exists");

    // Only a pending, unexpired session can be confirmed (atomic)
    const session = await QRSession.findOneAndUpdate(
      { sessionId, status: "pending", expiresAt: { $gt: new Date() } },
      { $set: { userId: user._id, status: "authenticated" } },
      { new: true }
    );

    if (!session) {
      return fail(res, 404, "QR session not found, expired, or already used");
    }

    return res.json({
      msg: "Login confirmed successfully!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("QR confirm error:", err);
    return fail(res, 500, "Server error: " + err.message);
  }
};
