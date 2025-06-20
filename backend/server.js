const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const nonces = {}; // In-memory nonce store

app.get("/api/ping", (req, res) => {
  res.send({ message: "PONG" });
});

// --- AUTH ROUTES ---

app.post("/auth/nonce", (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "No address" });
  const nonce = Math.random().toString(36).substring(2, 15);
  nonces[address.toLowerCase()] = nonce;
  res.json({ nonce });
});

app.post("/auth/login", (req, res) => {
  const { address, signature } = req.body;
  if (!address || !signature)
    return res.status(400).json({ error: "Missing fields" });

  const nonce = nonces[address.toLowerCase()];

  if (!nonce) return res.status(400).json({ error: "No nonce for address" });

  let recovered;
  try {
    recovered = ethers.verifyMessage(nonce, signature);
  } catch (e) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return res.status(401).json({ error: "Signature does not match address" });
  }

  // Success: issue JWT
  const token = jwt.sign({ address }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "1h",
  });
  delete nonces[address.toLowerCase()]; // Invalidate nonce
  res.json({ token });
});

// --- PRODUCTS ROUTE ---

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.listen(process.env.PORT, () => {
  console.log("Backend running on http://localhost:4000");
});
