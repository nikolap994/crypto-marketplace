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
      .then(setProducts);
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
      <main>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            placeholder="Username"
            value={loginForm.username}
            onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
          />
          <input
            placeholder="Password"
            type="password"
            value={loginForm.password}
            onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
          />
          <button type="submit">Login</button>
        </form>
        {loginError && <p style={{ color: "red" }}>{loginError}</p>}
      </main>
    );
  }

  return (
    <main>
      <h2>Super Admin Dashboard</h2>
      <h3>Pending Products</h3>
      {message && <p style={{ color: "red" }}>{message}</p>}
      {products.length === 0 ? (
        <p>No pending products.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.description}</td>
                <td>{p.seller}</td>
                <td>${p.priceUsd}</td>
                <td>
                  <button onClick={() => handleAction(p.id, "approved")}>Approve</button>
                  <button onClick={() => handleAction(p.id, "rejected")}>Reject</button>
                  <Link href={`/admin-dashboard/${p.id}/edit`} style={{ marginLeft: 8 }}>
                    <button>Edit</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ color: "red", marginLeft: 8 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
        onClick={() => {
          setJwt(null);
          localStorage.removeItem("admin_jwt");
        }}
        style={{ marginTop: "1rem" }}
      >
        Logout
      </button>
    </main>
  );
}