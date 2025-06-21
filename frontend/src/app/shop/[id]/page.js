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
const WALLET_URL_PROD = process.env.NEXT_PUBLIC_WALLET_URL_PROD || "https://etherscan.io/tx/";
const WALLET_URL_DEV = process.env.NEXT_PUBLIC_WALLET_URL_DEV || "https://sepolia.etherscan.io/tx/";
const WALLET_ENV = process.env.NEXT_PUBLIC_WALLET_ENV || "dev";
const WALLET_URL = WALLET_ENV === "prod" ? WALLET_URL_PROD : WALLET_URL_DEV;

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
    <main className="max-w-xl mx-auto p-4">
      <Link href="/shop" className="text-blue-600 hover:underline">&larr; Back to products</Link>
      <h2 className="text-2xl font-bold mt-4 mb-2">{product.title}</h2>
      <p className="mb-2">{product.description}</p>
      <div className="mb-2">
        <span className="font-semibold">Price:</span> ${product.priceUsd}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Seller:</span> {product.seller}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Status:</span> {product.status}
      </div>
      <div className="mb-4">
        <span className="font-semibold">ETH Amount:</span> {totalEth.toFixed(6)}
        <br />
        <span className="text-orange-600">
          Platform fee ({PLATFORM_PERCENT}%): {platformEth} ETH
        </span>
        <br />
        <span className="text-green-700">
          Seller receives ({SELLER_PERCENT}%): {sellerEth} ETH
        </span>
      </div>
      {product.status === "approved" && (
        <>
          {!isConnected ? (
            <div className="mt-4">
              <ConnectButton />
              <p className="text-red-600 mt-2">Connect your wallet to buy.</p>
            </div>
          ) : (
            <button
              onClick={handleBuy}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : `Buy with ETH`}
            </button>
          )}
        </>
      )}
      {txHashes.platform && (
        <p className="mt-4 text-orange-600">
          Platform fee tx sent:{" "}
          <a
            href={`${WALLET_URL}${txHashes.platform}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHashes.platform.slice(0, 12)}...
          </a>
        </p>
      )}
      {txHashes.seller && (
        <p className="mt-2 text-green-700">
          Seller payment tx sent:{" "}
          <a
            href={`${WALLET_URL}${txHashes.seller}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHashes.seller.slice(0, 12)}...
          </a>
        </p>
      )}
      {error && <p className="text-red-600 mt-2">{error.message}</p>}
      {message && (
        <p className={`mt-2 ${message.includes("failed") ? "text-red-600" : "text-green-700"}`}>
          {message}
        </p>
      )}
    </main>
  );
}