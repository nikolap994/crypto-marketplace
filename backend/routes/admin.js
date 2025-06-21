const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const adminAuth = require("../middleware/adminAuth"); // JWT + isAdmin check

router.post("/login", adminController.login);
router.get("/products", adminAuth, adminController.getPendingProducts);
router.patch("/products/:id", adminAuth, adminController.approveOrRejectProduct);

module.exports = router;