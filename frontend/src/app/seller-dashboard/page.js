"use client";
import { useState, useEffect } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SellerDashboard() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [jwt, setJwt] = useState(null);
  const [checkingJwt, setCheckingJwt] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceUsd: "",
    seller: "",
    type: "digital", // default to digital
  });
  const [message, setMessage] = useState("");
  const [myProducts, setMyProducts] = useState([]);

  useEffect(() => {
    const checkToken = async () => {
      setCheckingJwt(true);
      const storedJwt = localStorage.getItem("jwt");
      if (!storedJwt) {
        setJwt(null);
        setCheckingJwt(false);
        return;
      }
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${storedJwt}` },
      });
      if (res.status !== 200) {
        setJwt(null);
        localStorage.removeItem("jwt");
      } else {
        setJwt(storedJwt);
      }
      setCheckingJwt(false);
    };
    checkToken();
  }, [isConnected, address]);

  useEffect(() => {
    const loginWithEthereum = async () => {
      if (!isConnected || !address || jwt || checkingJwt) return;
      const nonceRes = await fetch(`${API_URL}/auth/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { nonce } = await nonceRes.json();
      const signature = await signMessageAsync({ message: nonce });
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });
      const { token } = await loginRes.json();
      setJwt(token);
      localStorage.setItem("jwt", token);
    };
    if (isConnected && !jwt && !checkingJwt) {
      loginWithEthereum();
    }
  }, [isConnected, address, signMessageAsync, jwt, checkingJwt]);

  useEffect(() => {
    if (isConnected && address) {
      setForm((f) => ({ ...f, seller: address }));
    }
  }, [isConnected, address]);

  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!jwt || !address) return;
      const res = await fetch(`${API_URL}/products?seller=${address}`);
      const mine = await res.json();
      setMyProducts(mine);
    };
    fetchMyProducts();
  }, [jwt, address, message]);

  if (!isConnected || !jwt || checkingJwt) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Seller Dashboard</h2>
        <p className="mb-4">Please sign in with your wallet to access the seller dashboard.</p>
        <ConnectButton />
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        ...form,
        priceUsd: parseFloat(form.priceUsd),
        type: form.type || "digital",
      }),
    });
    if (res.ok) {
      setMessage("Product created!");
      setForm({
        title: "",
        description: "",
        priceUsd: "",
        seller: address || "",
        type: "digital",
      });
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to create product");
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Seller Dashboard</h2>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Link href="/seller-dashboard/orders" className="text-blue-600 hover:underline">View Orders</Link>
      </div>
      <div className="bg-white rounded shadow p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">Add Product</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Price (USD)"
            type="number"
            value={form.priceUsd}
            onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.type || "digital"}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="digital">Digital</option>
            <option value="physical">Physical</option>
          </select>
          <input
            className="border rounded px-3 py-2 bg-gray-100"
            placeholder="Seller Address"
            value={form.seller}
            readOnly
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
          >
            Create
          </button>
        </form>
        {message && <p className="mt-2">{message}</p>}
      </div>

      <h3 className="text-lg font-semibold mb-2">Your Products</h3>
      {myProducts.length === 0 ? (
        <p>No products found for this wallet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Title</th>
                <th className="py-2 px-3 text-left">Description</th>
                <th className="py-2 px-3 text-left">Price (USD)</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Created</th>
                <th className="py-2 px-3 text-left">Edit</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 px-3">{p.title}</td>
                  <td className="py-2 px-3">{p.description}</td>
                  <td className="py-2 px-3">${p.priceUsd}</td>
                  <td className="py-2 px-3">{p.type || "digital"}</td>
                  <td className="py-2 px-3">{p.status}</td>
                  <td className="py-2 px-3">{new Date(p.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <Link href={`/seller-dashboard/${p.id}/edit`}>
                      <button className="bg-gray-200 rounded px-3 py-1 hover:bg-gray-300 transition">Edit</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => {
          disconnect();
          setJwt(null);
          localStorage.removeItem("jwt");
        }}
        className="mt-8 bg-gray-200 rounded px-4 py-2 hover:bg-gray-300 transition"
      >
        Logout
      </button>
    </main>
  );
}