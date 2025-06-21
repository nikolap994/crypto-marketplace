const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
  try {
    const where = {};
    if (req.query.seller) {
      where.seller = {
        equals: req.query.seller,
        mode: "insensitive",
      };
    } else {
      where.status = {
        equals: req.query.status || "approved",
        mode: "insensitive",
      };
    }
    const products = await prisma.product.findMany({ where });
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
  const { title, description, priceUsd, seller, type, images } = req.body;
  if (!title || !description || !priceUsd || !seller)
    return res.status(400).json({ error: "Missing fields" });
  if (images && images.length > 3)
    return res.status(400).json({ error: "Maximum 3 images allowed" });
  try {
    const product = await prisma.product.create({
      data: {
        title,
        description,
        priceUsd,
        seller,
        type: type || "digital",
        images: images && Array.isArray(images) ? images.slice(0, 3) : [],
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, description, priceUsd, type, images } = req.body;
  try {
    const updateData = { title, description, priceUsd, type };
    if (images) {
      if (images.length > 3)
        return res.status(400).json({ error: "Maximum 3 images allowed" });
      updateData.images = images.slice(0, 3);
    }
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};