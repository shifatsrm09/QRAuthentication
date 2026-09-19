// POST /api/auth/signup
const bcrypt = require("bcryptjs");
const connectDB = require("../../../lib/db");
const User = require("../../../lib/models/User");
const { fail, allowMethods } = require("../../../lib/http");

module.exports = async (req, res) => {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return fail(res, 400, "Name, email and password are required");
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) return fail(res, 400, "User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await new User({ name, email, password: hashedPassword }).save();

    return res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("signup error:", err);
    return fail(res, 500, err.message);
  }
};
