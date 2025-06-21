"use client";
import Link from "next/link";

export default function NavLinks() {
  return (
    <div className="flex flex-wrap gap-4 my-6">
      <Link href="/shop">
        <button className="px-6 py-3 text-lg bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Go to Shop
        </button>
      </Link>
    </div>
  );
}