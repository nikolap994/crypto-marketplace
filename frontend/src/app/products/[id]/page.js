"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductDetailPage({ params }) {
  const { id } = use(params);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  if (!product) return <div>Loading...</div>;
  if (product.error) return <div>Product not found.</div>;

  return (
    <main>
      <Link href="/products">&larr; Back to products</Link>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.priceUsd}</p>
      <p>Seller: {product.seller}</p>
      <p>Status: {product.status}</p>
    </main>
  );
}