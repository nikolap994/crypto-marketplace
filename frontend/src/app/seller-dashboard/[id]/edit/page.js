"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [form, setForm] = useState({
    title: "",
    description: "",
    priceUsd: "",
    type: "digital",
    images: [],
  });
  const [imageInputs, setImageInputs] = useState(["", "", ""]);
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
          type: data.type || "digital",
          images: data.images || [],
        });
        setImageInputs([
          data.images?.[0] || "",
          data.images?.[1] || "",
          data.images?.[2] || "",
        ]);
        setLoading(false);
      });
  }, [id]);

  const handleImageUpload = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      const newInputs = [...imageInputs];
      newInputs[idx] = base64;
      setImageInputs(newInputs);
      setForm((f) => ({
        ...f,
        images: newInputs.filter((img) => img.trim() !== ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (idx, value) => {
    const newInputs = [...imageInputs];
    newInputs[idx] = value;
    setImageInputs(newInputs);
    setForm((f) => ({
      ...f,
      images: newInputs.filter((img) => img.trim() !== ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jwt = localStorage.getItem("jwt");
    const images = imageInputs.filter((img) => img.trim() !== "");
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        ...form,
        images,
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
        <select
          className="border rounded px-3 py-2"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="digital">Digital</option>
          <option value="physical">Physical</option>
        </select>
        <div>
          <label className="block font-semibold mb-1">
            Product Images (max 3, upload or paste base64):
          </label>
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(idx, e.target.files?.[0] || null)
                }
                className="border rounded px-2 py-1"
              />
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder={`Paste base64 or image URL ${idx + 1}`}
                value={imageInputs[idx]}
                onChange={(e) => handleImageChange(idx, e.target.value)}
                maxLength={102400}
              />
              {imageInputs[idx] && (
                <Image
                  src={imageInputs[idx]}
                  alt={`Preview ${idx + 1}`}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded border"
                  unoptimized
                />
              )}
            </div>
          ))}
        </div>
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