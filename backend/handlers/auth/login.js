// POST /api/auth/login
const bcrypt = require("bcryptjs");
const connectDB = require("../../../lib/db");
const User = require("../../../lib/models/User");
const { fail, allowMethods, signToken } = require("../../../lib/http");

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return fail(res, 400, "Email and password are required");
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) return fail(res, 400, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return fail(res, 400, "Invalid credentials");

    const token = signToken(user._id);

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("login error:", err);
    return fail(res, 500, err.message);
  }
};
