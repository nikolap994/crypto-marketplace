const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/ping", (req, res) => {
  res.send({ message: "PONG" });
});

app.listen(process.env.PORT, () => {
  console.log("Backend running on http://localhost:4000");
});

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});
