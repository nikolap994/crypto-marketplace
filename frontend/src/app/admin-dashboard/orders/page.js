"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
    <main>
      <h2>All Orders (Admin)</h2>
      <Link href="/admin-dashboard">&larr; Back to dashboard</Link>
      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Product</th>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Platform Cut (ETH)</th>
              <th>Seller Cut (ETH)</th>
              <th>Platform Tx</th>
              <th>Seller Tx</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.product?.title || "Unknown"}</td>
                <td>{order.product?.seller || "Unknown"}</td>
                <td>{order.buyer}</td>
                <td style={{ color: "orange" }}>{order.platformAmount}</td>
                <td style={{ color: "green" }}>{order.sellerAmount}</td>
                <td>
                  <a
                    href={`https://etherscan.io/tx/${order.platformTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {order.platformTxHash?.slice(0, 10)}...
                  </a>
                </td>
                <td>
                  <a
                    href={`https://etherscan.io/tx/${order.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {order.txHash?.slice(0, 10)}...
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