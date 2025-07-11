"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import MarketplaceEscrowArtifact from "../../../../@abi/MarketplaceEscrow.json";

const MarketplaceEscrowABI =
  MarketplaceEscrowArtifact.abis[
    Object.keys(MarketplaceEscrowArtifact.abis)[0]
  ];
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT;
const WALLET_URL_PROD = process.env.NEXT_PUBLIC_WALLET_URL_PROD;
const WALLET_URL_DEV = process.env.NEXT_PUBLIC_WALLET_URL_DEV;
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
  const [txHash, setTxHash] = useState(null);

  // For structured shipping address
  const [shippingFields, setShippingFields] = useState({
    name: "",
    street: "",
    city: "",
    postcode: "",
    country: "",
  });

  // Read platform percent from contract
  const { data: platformPercentRaw } = useReadContract({
    address: ESCROW_CONTRACT,
    abi: MarketplaceEscrowABI,
    functionName: "platformPercent",
  });
  const PLATFORM_PERCENT = platformPercentRaw ? Number(platformPercentRaw) : 0;
  const SELLER_PERCENT = 100 - PLATFORM_PERCENT;

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  // Calculate ETH amounts using contract percentages
  const totalEth = product ? product.priceUsd / 3500 : 0;
  const platformEth = ((totalEth * PLATFORM_PERCENT) / 100).toFixed(6);
  const sellerEth = ((totalEth * SELLER_PERCENT) / 100).toFixed(6);

  const { writeContractAsync, isPending, error } = useWriteContract();

  // Merge shipping fields into one string
  const shippingAddress = `${shippingFields.name}, ${shippingFields.street}, ${shippingFields.city}, ${shippingFields.postcode}, ${shippingFields.country}`;

  // Submit order to backend after txHash is set
  useEffect(() => {
    if (txHash && !orderSubmitted && product) {
      setMessage("Transaction sent! Submitting order...");
      (async () => {
        try {
          const jwt = localStorage.getItem("jwt");
          const orderBody = {
            productId: product.id,
            txHash,
            buyer: address,
            platformAmount: parseFloat(platformEth),
            sellerAmount: parseFloat(sellerEth),
          };
          if (product.type === "physical") {
            orderBody.shippingAddress = shippingAddress;
          }
          const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify(orderBody),
          });
          if (res.ok) {
            setMessage("Order complete! Payment sent via escrow.");
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
  }, [
    txHash,
    orderSubmitted,
    product,
    address,
    platformEth,
    sellerEth,
    shippingAddress,
  ]);

  const handleBuy = async () => {
    setMessage("");
    setOrderSubmitted(false);
    setTxHash(null);

    if (!ESCROW_CONTRACT || !product?.seller || !writeContractAsync) {
      setMessage("Wallet not connected or contract misconfigured.");
      return;
    }

    if (product.type === "physical") {
      // Validate all fields are filled
      if (
        !shippingFields.name.trim() ||
        !shippingFields.street.trim() ||
        !shippingFields.city.trim() ||
        !shippingFields.postcode.trim() ||
        !shippingFields.country.trim()
      ) {
        setMessage("Please fill in all shipping address fields.");
        return;
      }
    }

    try {
      setMessage("Sending payment via escrow contract...");
      const tx = await writeContractAsync({
        address: ESCROW_CONTRACT,
        abi: MarketplaceEscrowABI,
        functionName: "buy",
        args: [product.seller],
        value: parseEther(totalEth.toString()),
      });
      setTxHash(typeof tx === "string" ? tx : tx.hash);
      setMessage("Transaction sent! Waiting for confirmation...");
    } catch (err) {
      setMessage("Transaction failed or was rejected.");
    }
  };

  if (!id) return <div>Invalid product ID.</div>;
  if (!product) return <div>Loading...</div>;
  if (product.error) return <div>Product not found.</div>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <Link href="/shop" className="text-blue-600 hover:underline">
        &larr; Back to products
      </Link>
      <h2 className="text-2xl font-bold mt-4 mb-2">{product.title}</h2>
      {/* Product Images */}
      {product.images && product.images.length > 0 && (
        <>
          {product.images.map(
            (img, idx) =>
              img && (
                <Image
                  key={idx}
                  src={img}
                  alt={`Product image ${idx + 1}`}
                  width={128}
                  height={128}
                  className="w-32 h-32 object-cover rounded border"
                  style={{ objectFit: "cover" }}
                  unoptimized={img.startsWith("data:")}
                />
              )
          )}
        </>
      )}
      <p className="mb-2">{product.description}</p>
      <div className="mb-2">
        <span className="font-semibold">Price:</span> ${product.priceUsd}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Seller:</span> {product.seller}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Type:</span> {product.type || "digital"}
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
      {product.type === "physical" && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">Shipping Address:</label>
          <input
            className="border rounded px-3 py-2 w-full mb-2"
            placeholder="Full Name"
            value={shippingFields.name}
            onChange={(e) =>
              setShippingFields((f) => ({ ...f, name: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2 w-full mb-2"
            placeholder="Street Address"
            value={shippingFields.street}
            onChange={(e) =>
              setShippingFields((f) => ({ ...f, street: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2 w-full mb-2"
            placeholder="City"
            value={shippingFields.city}
            onChange={(e) =>
              setShippingFields((f) => ({ ...f, city: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2 w-full mb-2"
            placeholder="Postcode"
            value={shippingFields.postcode}
            onChange={(e) =>
              setShippingFields((f) => ({ ...f, postcode: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Country"
            value={shippingFields.country}
            onChange={(e) =>
              setShippingFields((f) => ({ ...f, country: e.target.value }))
            }
          />
        </div>
      )}
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
              disabled={isPending}
            >
              {isPending ? "Processing..." : `Buy with ETH`}
            </button>
          )}
        </>
      )}
      {txHash && (
        <p className="mt-4 text-green-700">
          Payment tx sent:{" "}
          <a
            href={`${WALLET_URL}${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash.slice(0, 12)}...
          </a>
        </p>
      )}
      {error && <p className="text-red-600 mt-2">{error.message}</p>}
      {message && (
        <p
          className={`mt-2 ${
            message.includes("failed") ? "text-red-600" : "text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </main>
  );
}
