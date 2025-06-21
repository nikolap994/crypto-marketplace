"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceUsd: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.title,
          description: data.description,
          priceUsd: data.priceUsd,
        });
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jwt = localStorage.getItem("jwt");
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
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
      setMessage("Product updated!");
      router.push(`/seller-dashboard/`);
    } else {
      setMessage("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const jwt = localStorage.getItem("jwt");
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (res.ok) {
      router.push("/seller-dashboard");
    } else {
      setMessage("Failed to delete product");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main>
      <h2>Edit Product</h2>
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
        <button type="submit">Save</button>
      </form>
      <button
        onClick={handleDelete}
        style={{ color: "red", marginTop: "1rem" }}
      >
        Delete Product
      </button>
      {message && <p>{message}</p>}
    </main>
  );
}
