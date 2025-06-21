const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ adminId: admin.id, isAdmin: true }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "1d" });
  res.json({ token });
};

exports.getPendingProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ where: { status: "pending" } });
    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No pending products found" });
    }
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch pending products" });
  }
};

exports.approveOrRejectProduct = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "approved" or "rejected"
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: { status },
  });
  res.json(product);
};