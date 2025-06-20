"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <main>
      <ConnectButton />
      {isConnected ? (
        <>
          <p>Logged in as: {address}</p>
          <button onClick={() => disconnect()} style={{ marginTop: '1rem' }}>
            Logout
          </button>
        </>
      ) : (
        <p>Welcome to Crypto Marketplace!</p>
      )}
    </main>
  );
}