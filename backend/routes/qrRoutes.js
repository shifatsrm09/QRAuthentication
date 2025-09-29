const express = require("express");
const { generateQR, checkStatus, scanPage, confirmQR } = require("../controllers/qrController");
const router = express.Router();

router.get("/generate", generateQR);        // desktop: generate QR
router.get("/status", checkStatus);         // desktop: poll status  
router.get("/scan", scanPage);              // mobile: scan page (CHANGED)
router.post("/confirm", confirmQR);         // mobile: confirm login (NEW)

module.exports = router;