"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [jwt, setJwt] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_jwt");
    setJwt(token);
  }, []);

  useEffect(() => {
    if (!jwt) return;
    fetch(`${API_URL}/admin-auth/products`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));
  }, [jwt]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch(`${API_URL}/admin-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    if (res.ok) {
      const { token } = await res.json();
      setJwt(token);
      localStorage.setItem("admin_jwt", token);
    } else {
      setLoginError("Invalid credentials");
    }
  };

  const handleAction = async (id, status) => {
    await fetch(`${API_URL}/admin-auth/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ status }),
    });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage("Product deleted.");
    } else {
      setMessage("Failed to delete product.");
    }
  };

  if (!jwt) {
    return (
      <main className="max-w-md mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-3 bg-white rounded shadow p-4 mb-6">
          <input
            className="border rounded px-3 py-2"
            placeholder="Username"
            value={loginForm.username}
            onChange={(e) =>
              setLoginForm((f) => ({ ...f, username: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Password"
            type="password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        {loginError && <p className="text-red-600">{loginError}</p>}
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Super Admin Dashboard</h2>
      <p className="mb-4">
        <Link href="/admin-dashboard/orders" className="text-blue-600 hover:underline">Orders</Link>
      </p>
      <h3 className="text-lg font-semibold mb-2">Pending Products</h3>
      {message && <p className="text-red-600 mb-2">{message}</p>}
      {products.length === 0 ? (
        <p>No pending products.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Title</th>
                <th className="py-2 px-3 text-left">Description</th>
                <th className="py-2 px-3 text-left">Seller</th>
                <th className="py-2 px-3 text-left">Price</th>
                <th className="py-2 px-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 px-3">{p.title}</td>
                  <td className="py-2 px-3">{p.description}</td>
                  <td className="py-2 px-3">{p.seller}</td>
                  <td className="py-2 px-3">${p.priceUsd}</td>
                  <td className="py-2 px-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleAction(p.id, "approved")}
                      className="bg-green-100 text-green-700 rounded px-3 py-1 hover:bg-green-200 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(p.id, "rejected")}
                      className="bg-yellow-100 text-yellow-700 rounded px-3 py-1 hover:bg-yellow-200 transition"
                    >
                      Reject
                    </button>
                    <Link href={`/admin-dashboard/${p.id}/edit`}>
                      <button className="bg-gray-200 rounded px-3 py-1 hover:bg-gray-300 transition">Edit</button>
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-100 text-red-700 rounded px-3 py-1 hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={() => {
          setJwt(null);
          localStorage.removeItem("admin_jwt");
        }}
        className="mt-8 bg-gray-200 rounded px-4 py-2 hover:bg-gray-300 transition"
      >
        Logout
      </button>
    </main>
  );
}