"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SellerOrdersPage() {
  const { address, isConnected } = useAccount();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) return;
    fetch(`${API_URL}/orders?seller=${address}`)
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <main>
        <h2>Seller Orders</h2>
        <p>Please connect your wallet.</p>
      </main>
    );
  }

  return (
    <main>
      <h2>Seller Orders</h2>
      <Link href="/seller-dashboard">&larr; Back to dashboard</Link>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found for your products.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Product</th>
              <th>Buyer</th>
              <th>Tx Hash</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.product?.title || "Unknown"}</td>
                <td>{order.buyer}</td>
                <td>
                  <a
                    href={`https://etherscan.io/tx/${order.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {order.txHash.slice(0, 10)}...
                  </a>
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}