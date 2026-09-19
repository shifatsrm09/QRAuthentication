// GET /api/auth/me   (Authorization: Bearer <jwt>)
const connectDB = require("../../../lib/db");
const User = require("../../../lib/models/User");
const { fail, allowMethods, verifyRequestToken } = require("../../../lib/http");

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ["GET"])) return;

  const decoded = verifyRequestToken(req);
  if (!decoded) return fail(res, 401, "Unauthorized");

  try {
    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return fail(res, 404, "User not found");
    return res.json(user);
  } catch (err) {
    console.error("me error:", err);
    return fail(res, 500, err.message);
  }
};
