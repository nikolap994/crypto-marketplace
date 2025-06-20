const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

// POST /auth/nonce
router.post("/nonce", authController.getNonce);

// POST /auth/login
router.post("/login", authController.login);

module.exports = router;