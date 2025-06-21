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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <main className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white rounded shadow p-4 mb-6">
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
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-100 text-red-700 rounded px-4 py-2 hover:bg-red-200 transition"
          >
            Delete Product
          </button>
        </div>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </main>
  );
}