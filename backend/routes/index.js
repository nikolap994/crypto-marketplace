const express = require("express");
const router = express.Router();

// Import routers
const authRouter = require("./auth");
const productsRouter = require("./products");

// Mount routers
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/admin-auth", require("./admin"));

module.exports = router;