"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WALLET_URL_PROD = process.env.NEXT_PUBLIC_WALLET_URL_PROD || "https://etherscan.io/tx/";
const WALLET_URL_DEV = process.env.NEXT_PUBLIC_WALLET_URL_DEV || "https://sepolia.etherscan.io/tx/";
const WALLET_ENV = process.env.NEXT_PUBLIC_WALLET_ENV || "dev";
const WALLET_URL = WALLET_ENV === "prod" ? WALLET_URL_PROD : WALLET_URL_DEV;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/orders`)
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-8xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">All Orders (Admin)</h2>
      <Link href="/admin-dashboard" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to dashboard</Link>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Product</th>
                <th className="py-2 px-3 text-left">Seller</th>
                <th className="py-2 px-3 text-left">Buyer</th>
                <th className="py-2 px-3 text-left text-orange-600">Platform Cut (ETH)</th>
                <th className="py-2 px-3 text-left text-green-700">Seller Cut (ETH)</th>
                <th className="py-2 px-3 text-left">Platform Tx</th>
                <th className="py-2 px-3 text-left">Seller Tx</th>
                <th className="py-2 px-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="py-2 px-3">{order.product?.title || "Unknown"}</td>
                  <td className="py-2 px-3">{order.product?.seller || "Unknown"}</td>
                  <td className="py-2 px-3">{order.buyer}</td>
                  <td className="py-2 px-3 text-orange-600">{order.platformAmount}</td>
                  <td className="py-2 px-3 text-green-700">{order.sellerAmount}</td>
                  <td className="py-2 px-3">
                    <a
                      href={`${WALLET_URL}${order.platformTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {order.platformTxHash?.slice(0, 10)}...
                    </a>
                  </td>
                  <td className="py-2 px-3">
                    <a
                      href={`${WALLET_URL}${order.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {order.txHash?.slice(0, 10)}...
                    </a>
                  </td>
                  <td className="py-2 px-3">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}