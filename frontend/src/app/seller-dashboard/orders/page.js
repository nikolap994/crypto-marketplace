"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WALLET_URL_PROD = process.env.NEXT_PUBLIC_WALLET_URL_PROD;
const WALLET_URL_DEV = process.env.NEXT_PUBLIC_WALLET_URL_DEV;
const WALLET_ENV = process.env.NEXT_PUBLIC_WALLET_ENV || "dev";
const WALLET_URL = WALLET_ENV === "prod" ? WALLET_URL_PROD : WALLET_URL_DEV;

export default function SellerOrdersPage() {
  const { address, isConnected } = useAccount();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) return;
    fetch(`${API_URL}/orders?seller=${address}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <main>
        <h2 className="text-2xl font-bold mb-4">Seller Orders</h2>
        <p>Please connect your wallet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-8xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Seller Orders</h2>
      <Link
        href="/seller-dashboard"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to dashboard
      </Link>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found for your products.</p>
      ) : (
        <div className="w-full">
          <table className="w-full border rounded shadow text-sm table-fixed">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left w-32">Product</th>
                <th className="py-2 px-3 text-left w-32">Buyer</th>
                <th className="py-2 px-3 text-left text-green-700 w-28">
                  Your Cut (ETH)
                </th>
                <th className="py-2 px-3 text-left text-orange-600 w-28">
                  Platform Cut (ETH)
                </th>
                <th className="py-2 px-3 text-left w-32">Seller Tx</th>
                <th className="py-2 px-3 text-left w-24">Type</th>
                <th className="py-2 px-3 text-left w-40">Shipping Address</th>
                <th className="py-2 px-3 text-left w-32">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="py-2 px-3 truncate max-w-[8rem]">
                    {order.product?.title || "Unknown"}
                  </td>
                  <td className="py-2 px-3 truncate max-w-[8rem]">
                    {order.buyer}
                  </td>
                  <td className="py-2 px-3 text-green-700">
                    {order.sellerAmount}
                  </td>
                  <td className="py-2 px-3 text-orange-600">
                    {order.platformAmount}
                  </td>
                  <td className="py-2 px-3 truncate max-w-[8rem]">
                    <a
                      href={`${WALLET_URL}${order.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {order.txHash?.slice(0, 10)}...
                    </a>
                  </td>
                  <td className="py-2 px-3">
                    {order.product?.type || "digital"}
                  </td>
                  <td className="py-2 px-3">
                    {order.product?.type === "physical"
                      ? order.shippingAddress || <span className="italic text-gray-400">N/A</span>
                      : <span className="italic text-gray-400">-</span>}
                  </td>
                  <td className="py-2 px-3 truncate max-w-[8rem]">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}