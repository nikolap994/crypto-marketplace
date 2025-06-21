const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

exports.createProduct = async (req, res) => {
  const { title, description, priceUsd, seller } = req.body;
  if (!title || !description || !priceUsd || !seller)
    return res.status(400).json({ error: "Missing fields" });
  try {
    const product = await prisma.product.create({
      data: { title, description, priceUsd, seller },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};