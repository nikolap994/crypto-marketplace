"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceUsd: "",
    seller: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        priceUsd: parseFloat(form.priceUsd),
      }),
    });
    // Refresh product list
    const res = await fetch(`${API_URL}/products`);
    setProducts(await res.json());
  };

  return (
    <main>
      <h2>Product List</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/products/${p.id}`}>
              {p.title}
            </Link>
            {" "} - ${p.priceUsd} (Seller: {p.seller})
          </li>
        ))}
      </ul>
      <h3>Add Product</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <input
          placeholder="Price (USD)"
          type="number"
          value={form.priceUsd}
          onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
        />
        <input
          placeholder="Seller Address"
          value={form.seller}
          onChange={(e) => setForm((f) => ({ ...f, seller: e.target.value }))}
        />
        <button type="submit">Create</button>
      </form>
    </main>
  );
}