const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products");

router.get("/", productsController.getAllProducts);
router.post("/", productsController.createProduct);

module.exports = router;