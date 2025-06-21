"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET;
const PLATFORM_PERCENT = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_PERCENT || "5");
const SELLER_PERCENT = 100 - PLATFORM_PERCENT;

export default function ProductDetailPage({ params }) {
  const actualParams =
    typeof params?.then === "function" ? use(params) : params;
  const id = actualParams?.id;

  const { isConnected, address } = useAccount();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [txHashes, setTxHashes] = useState({ platform: null, seller: null });

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  // Calculate ETH amounts using env percentages
  const totalEth = product ? product.priceUsd / 3500 : 0;
  const platformEth = ((totalEth * PLATFORM_PERCENT) / 100).toFixed(6);
  const sellerEth = ((totalEth * SELLER_PERCENT) / 100).toFixed(6);

  const { sendTransactionAsync, isLoading, error } = useSendTransaction();

  // React to both transaction hashes and submit order after both succeed
  useEffect(() => {
    if (
      txHashes.platform &&
      txHashes.seller &&
      !orderSubmitted
    ) {
      setMessage("Both transactions sent! Submitting order...");
      (async () => {
        try {
          const jwt = localStorage.getItem("jwt");
          const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              productId: product.id,
              txHash: txHashes.seller, // Seller payment tx hash
              buyer: address,
              platformTxHash: txHashes.platform, // Platform fee tx hash
              platformAmount: parseFloat(platformEth),
              sellerAmount: parseFloat(sellerEth),
            }),
          });
          if (res.ok) {
            setMessage("Order complete! Both payments sent.");
          } else {
            const errData = await res.json();
            setMessage(errData.error || "Failed to submit order.");
          }
          setOrderSubmitted(true);
        } catch (err) {
          setMessage("Order failed to submit to backend.");
        }
      })();
    }
  }, [txHashes, orderSubmitted, product, address, id, platformEth, sellerEth]);

  const handleBuy = async () => {
    setMessage("");
    setOrderSubmitted(false);
    setTxHashes({ platform: null, seller: null });

    if (!PLATFORM_WALLET || !product?.seller || !sendTransactionAsync) {
      setMessage("Wallet not connected or platform/seller wallet misconfigured.");
      return;
    }

    try {
      setMessage(`Sending ${PLATFORM_PERCENT}% platform fee...`);
      const platformTx = await sendTransactionAsync({
        to: PLATFORM_WALLET,
        value: parseEther(platformEth),
      });
      setTxHashes((prev) => ({ ...prev, platform: typeof platformTx === "string" ? platformTx : platformTx.hash }));

      setMessage(`Sending ${SELLER_PERCENT}% to seller...`);
      const sellerTx = await sendTransactionAsync({
        to: product.seller,
        value: parseEther(sellerEth),
      });
      setTxHashes((prev) => ({ ...prev, seller: typeof sellerTx === "string" ? sellerTx : sellerTx.hash }));

      setMessage("Both transactions sent! Waiting for confirmation...");
    } catch (err) {
      setMessage("Transaction failed or was rejected.");
    }
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
      <p>
        ETH Amount: {totalEth.toFixed(6)} <br />
        <span style={{ color: "orange" }}>
          Platform fee ({PLATFORM_PERCENT}%): {platformEth} ETH
        </span>
        <br />
        <span style={{ color: "green" }}>
          Seller receives ({SELLER_PERCENT}%): {sellerEth} ETH
        </span>
      </p>
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
      {txHashes.platform && (
        <p style={{ color: "orange" }}>
          Platform fee tx sent:{" "}
          <a
            href={`https://etherscan.io/tx/${txHashes.platform}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHashes.platform.slice(0, 12)}...
          </a>
        </p>
      )}
      {txHashes.seller && (
        <p style={{ color: "green" }}>
          Seller payment tx sent:{" "}
          <a
            href={`https://etherscan.io/tx/${txHashes.seller}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txHashes.seller.slice(0, 12)}...
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