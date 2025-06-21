const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products");
const auth = require("../middleware/auth"); // <-- add this line

router.get("/", productsController.getAllProducts);
router.get("/:id", productsController.getProductById);
router.post("/", auth, productsController.createProduct);
router.patch("/:id", auth, productsController.updateProduct); // Edit
router.delete("/:id", auth, productsController.deleteProduct); // Delete

module.exports = router;
