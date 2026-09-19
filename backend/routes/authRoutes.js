const router = require("express").Router();
router.all("/signup", require("../handlers/auth/signup"));
router.all("/login", require("../handlers/auth/login"));
router.all("/me", require("../handlers/auth/me"));
module.exports = router;
