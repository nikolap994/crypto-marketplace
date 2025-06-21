"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then(setProducts);
  }, []);

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
      <h3>
        <Link href="/seller-dashboard">
          Want to add a product? Go to Seller Dashboard &rarr;
        </Link>
      </h3>
    </main>
  );
}