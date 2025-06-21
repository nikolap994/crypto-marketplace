const { ethers } = require("ethers");
const jwt = require("jsonwebtoken");

const nonces = {}; // In-memory nonce store

exports.getNonce = (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "No address" });
  const nonce = Math.random().toString(36).substring(2, 15);
  nonces[address.toLowerCase()] = nonce;
  res.json({ nonce });
};

exports.login = (req, res) => {
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

  const token = jwt.sign({ address }, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "1h",
  });
  delete nonces[address.toLowerCase()];
  res.json({ token });
};

exports.verify = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    res.json({ valid: true, address: decoded.address });
  } catch {
    res.status(401).json({ valid: false, error: "Invalid or expired token" });
  }
};