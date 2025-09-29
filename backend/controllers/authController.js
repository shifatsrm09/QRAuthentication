// backend/controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// -------------------- SIGNUP --------------------
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// -------------------- LOGIN --------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return token + user info (without password)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// -------------------- GET CURRENT USER --------------------
exports.getUserData = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ msg: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// -------------------- LOGOUT --------------------
// Optional: for JWT, logout is usually handled on frontend
exports.logout = (req, res) => {
  // If using cookies, you can clear the cookie here
  res.json({ msg: "Logged out successfully" });
};
