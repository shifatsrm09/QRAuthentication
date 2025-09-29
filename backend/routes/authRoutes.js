const express = require("express");
const { signup, login, getUserData } = require("../controllers/authController");
const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route: get current user info
router.get("/me", getUserData);

module.exports = router;

const auth = require("../middleware/authMiddleware");
router.get("/me", auth, getUserData);
