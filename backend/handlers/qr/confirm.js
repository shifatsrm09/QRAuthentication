// POST /api/qr/confirm   body: { sessionId }   (Authorization: Bearer <phone user's jwt>)
const connectDB = require("../../../lib/db");
const QRSession = require("../../../lib/models/QRSession");
const User = require("../../../lib/models/User");
const { checkSessionId } = require("../../../lib/qrSession");
const { fail, allowMethods, verifyRequestToken } = require("../../../lib/http");

const UNAVAILABLE = "QR session not found, expired, or already used";

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

  // Forged, malformed or expired ids are rejected without touching the database.
  const { state, expiresAt } = checkSessionId(sessionId);
  if (state !== "valid") return fail(res, 404, UNAVAILABLE);

  try {
    await connectDB();

    const user = await User.findById(decoded.id).select("name email");
    if (!user) return fail(res, 401, "User no longer exists");

    // The first confirmation creates the session row; any later one finds it and is rejected.
    // With upsert and new:false, null means "we just created it".
    let alreadyUsed;
    try {
      alreadyUsed = await QRSession.findOneAndUpdate(
        { sessionId },
        {
          $setOnInsert: {
            userId: user._id,
            status: "authenticated",
            expiresAt,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: false, setDefaultsOnInsert: false }
      );
    } catch (err) {
      if (err.code !== 11000) throw err; // two simultaneous confirms: the loser hits the unique index
      alreadyUsed = true;
    }
    if (alreadyUsed) return fail(res, 404, UNAVAILABLE);

    return res.json({
      msg: "Login confirmed successfully!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("QR confirm error:", err);
    return fail(res, 500, "Server error: " + err.message);
  }
};
