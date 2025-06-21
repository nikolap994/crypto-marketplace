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
  });
  const [message, setMessage] = useState("");
  const [myProducts, setMyProducts] = useState([]);

  // On mount, load JWT from localStorage if it exists and check validity
  useEffect(() => {
    const checkToken = async () => {
      setCheckingJwt(true);
      const storedJwt = localStorage.getItem("jwt");
      if (!storedJwt) {
        setJwt(null);
        setCheckingJwt(false);
        return;
      }
      // Call the /auth/verify endpoint to check token validity
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

  // Wallet login logic (copy from homepage)
  useEffect(() => {
    const loginWithEthereum = async () => {
      if (!isConnected || !address || jwt || checkingJwt) return;

      // 1. Fetch nonce from backend
      const nonceRes = await fetch(`${API_URL}/auth/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { nonce } = await nonceRes.json();

      // 2. Sign nonce
      const signature = await signMessageAsync({ message: nonce });

      // 3. Send signature and address to backend
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

  // Autofill seller address from wallet
  useEffect(() => {
    if (isConnected && address) {
      setForm((f) => ({ ...f, seller: address }));
    }
  }, [isConnected, address]);

  // Fetch products for current seller
  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!jwt || !address) return;
      const res = await fetch(`${API_URL}/products?seller=${address}`);
      const mine = await res.json();
      setMyProducts(mine);
    };
    fetchMyProducts();
  }, [jwt, address, message]); // refetch after product creation

  if (!isConnected || !jwt || checkingJwt) {
    return (
      <main>
        <h2>Seller Dashboard</h2>
        <p>Please sign in with your wallet to access the seller dashboard.</p>
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
      }),
    });
    if (res.ok) {
      setMessage("Product created!");
      setForm({
        title: "",
        description: "",
        priceUsd: "",
        seller: address || "",
      });
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to create product");
    }
  };

  return (
    <main>
      <h2>Seller Dashboard</h2>
      <h3>Add Product</h3>
      <p>
        <Link href="/products">&larr; Back to products</Link>
      </p>
      <p>
        <Link href="seller-dashboard/orders">Orders</Link>
      </p>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <input
          placeholder="Price (USD)"
          type="number"
          value={form.priceUsd}
          onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
        />
        <input placeholder="Seller Address" value={form.seller} readOnly />
        <button type="submit">Create</button>
      </form>
      {message && <p>{message}</p>}

      <h3>Your Products</h3>
      {myProducts.length === 0 ? (
        <p>No products found for this wallet.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Price (USD)</th>
              <th>Status</th>
              <th>Created</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {myProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.description}</td>
                <td>${p.priceUsd}</td>
                <td>{p.status}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>
                  <Link href={`/seller-dashboard/${p.id}/edit`}>
                    <button>Edit</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => {
          disconnect();
          setJwt(null);
          localStorage.removeItem("jwt");
        }}
        style={{ marginTop: "1rem" }}
      >
        Logout
      </button>
    </main>
  );
}
