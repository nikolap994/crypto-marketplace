"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET;

export default function ProductDetailPage({ params }) {
  const actualParams =
    typeof params?.then === "function" ? use(params) : params;
  const id = actualParams?.id;

  const { isConnected, address } = useAccount();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  const ethAmount = product ? (product.priceUsd / 3500).toFixed(6) : "0";

  const { sendTransaction, data, isLoading, isSuccess, error, status } =
    useSendTransaction();

  // React to transaction hash and confirmation
  useEffect(() => {
    // In wagmi v2, data is the hash string, not an object
    if (typeof data === "string" && !orderSubmitted) {
      setMessage("Transaction sent! Waiting for confirmation...");
      (async () => {
        try {
          // Optionally, you could poll for confirmation here if needed
          const jwt = localStorage.getItem("jwt");
          const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              productId: product.id,
              txHash: data,
              buyer: address,
            }),
          });
          if (res.ok) {
            setMessage("Transaction confirmed and order submitted!");
          } else {
            const errData = await res.json();
            setMessage(errData.error || "Failed to submit order.");
          }
          setOrderSubmitted(true);
        } catch (err) {
          setMessage("Transaction failed or was rejected.");
        }
      })();
    }
  }, [data, orderSubmitted, product, address, id, error, isLoading, isSuccess, status]);

  const handleBuy = () => {
    setMessage("");
    setOrderSubmitted(false);
    if (!PLATFORM_WALLET || !sendTransaction) {
      setMessage("Wallet not connected or platform wallet misconfigured.");
      return;
    }
    sendTransaction({
      to: PLATFORM_WALLET,
      value: parseEther(ethAmount),
    });
  };

  if (!id) return <div>Invalid product ID.</div>;
  if (!product) return <div>Loading...</div>;
  if (product.error) return <div>Product not found.</div>;

  return (
    <main>
      <Link href="/products">&larr; Back to products</Link>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.priceUsd}</p>
      <p>Seller: {product.seller}</p>
      <p>Status: {product.status}</p>
      <p>ETH Amount: {ethAmount}</p>
      {product.status === "approved" && (
        <>
          {!isConnected ? (
            <div style={{ marginTop: "1rem" }}>
              <ConnectButton />
              <p style={{ color: "red" }}>Connect your wallet to buy.</p>
            </div>
          ) : (
            <button
              onClick={handleBuy}
              style={{ marginTop: "1rem" }}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : `Buy with ETH`}
            </button>
          )}
        </>
      )}
      {typeof data === "string" && (
        <p style={{ color: "orange" }}>
          Transaction sent! Waiting for confirmation...
          <br />
          Hash:{" "}
          <a
            href={`https://etherscan.io/tx/${data}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data}
          </a>
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error.message}</p>}
      {message && (
        <p style={{ color: message.includes("failed") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </main>
  );
}
