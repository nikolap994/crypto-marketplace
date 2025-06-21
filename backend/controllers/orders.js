const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
  const {
    productId,
    buyer,
    txHash,
    platformAmount,
    sellerAmount,
    shippingAddress, // new field for physical products
  } = req.body;
  if (
    !productId ||
    !buyer ||
    !txHash ||
    !platformAmount ||
    !sellerAmount
  )
    return res.status(400).json({ error: "Missing fields" });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (product.status !== "approved")
    return res.status(400).json({ error: "Product not approved" });
  if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash))
    return res.status(400).json({ error: "Invalid tx hash" });

  try {
    const order = await prisma.order.create({
      data: {
        productId,
        buyer,
        txHash,
        platformAmount,
        sellerAmount,
        shippingAddress: product.type === "physical" ? shippingAddress : null,
      },
    });
    res.json(order);
  } catch (e) {
    res.status(400).json({ error: "Order already exists or invalid data" });
  }
};

exports.getOrders = async (req, res) => {
  const { seller, buyer } = req.query;
  let where = {};
  if (buyer) where.buyer = buyer;
  if (seller) {
    // Find all products by this seller
    const products = await prisma.product.findMany({ where: { seller } });
    where.productId = { in: products.map((p) => p.id) };
  }
  const orders = await prisma.order.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
};