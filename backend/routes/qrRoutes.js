const express = require("express");
const { generateQR, checkStatus, scanPage, confirmQR } = require("../controllers/qrController");
const router = express.Router();

router.get("/generate", generateQR);        // GET /api/qr/generate
router.get("/status", checkStatus);         // GET /api/qr/status  
router.get("/scan", scanPage);              // GET /api/qr/scan
router.post("/confirm", confirmQR);         // POST /api/qr/confirm

module.exports = router;