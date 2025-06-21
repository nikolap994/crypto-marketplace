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
    <main className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Product List</h2>
      <ul className="space-y-4 mb-8">
        {products.map((p) => (
          <li
            key={p.id}
            className="bg-white rounded shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <div>
              <Link
                href={`/shop/${p.id}`}
                className="text-lg font-semibold text-blue-700 hover:underline"
              >
                {p.title}
              </Link>
              <span className="ml-2 text-gray-600">${p.priceUsd}</span>
              <span className="ml-4 text-xs text-gray-400">
                Seller: {p.seller}
              </span>
              <span className="ml-4 text-xs text-gray-500">
                Type: {p.type || "digital"}
              </span>
            </div>
            <Link
              href={`/shop/${p.id}`}
              className="mt-2 sm:mt-0 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
      <h3 className="mt-8 text-center">
        <Link
          href="/seller-dashboard"
          className="text-blue-600 hover:underline"
        >
          Want to add a product? Go to Seller Dashboard &rarr;
        </Link>
      </h3>
    </main>
  );
}