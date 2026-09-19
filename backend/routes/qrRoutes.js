const router = require("express").Router();
router.all("/generate", require("../handlers/qr/generate"));
router.all("/status", require("../handlers/qr/status"));
router.all("/confirm", require("../handlers/qr/confirm"));
module.exports = router;
