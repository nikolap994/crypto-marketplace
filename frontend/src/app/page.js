"use client";

import NavLinks from "./components/NavLinks";

const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT;

export default function HomePage() {
  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Crypto Marketplace</h1>
      <p className="mb-4">
        Welcome to <b>Crypto Marketplace</b> – a decentralized platform to buy
        and sell digital products using crypto.
      </p>
      <ul className="mb-8 list-disc list-inside space-y-1">
        <li>🛡️ Escrow: Platform holds funds until order is confirmed</li>
        <li>💸 Platform fee: 2-5% per transaction</li>
        <li>🛒 Browse and buy products with ETH</li>
        <li>🔒 Seller and admin dashboards</li>
      </ul>
      <NavLinks />
      <footer className="mt-12 text-gray-500 text-sm text-center">
        <p>MVP project by Nikola &middot; 2025</p>
        {ESCROW_CONTRACT && (
          <div className="mt-2">
            <a
              href={`https://sepolia.etherscan.io/address/${ESCROW_CONTRACT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View Escrow Contract on Etherscan
            </a>
            <div className="mt-1">
              <span>
                This contract splits payments between the platform and sellers.
                {` `}
                {/** Optionally add: */}
                {` `}
                <a
                  href={`https://sepolia.etherscan.io/address/${ESCROW_CONTRACT}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View source code
                </a>
              </span>
            </div>
          </div>
        )}
      </footer>
    </main>
  );
}
