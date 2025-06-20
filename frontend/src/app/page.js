"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [jwt, setJwt] = useState(null);

  // On mount, load JWT from localStorage if it exists
  useEffect(() => {
    const storedJwt = localStorage.getItem("jwt");
    if (storedJwt) setJwt(storedJwt);
  }, []);

  useEffect(() => {
    const loginWithEthereum = async () => {
      if (!isConnected || !address || jwt) return;

      // 1. Fetch nonce from backend
      const nonceRes = await fetch("http://localhost:4000/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { nonce } = await nonceRes.json();

      // 2. Sign nonce
      const signature = await signMessageAsync({ message: nonce });

      // 3. Send signature and address to backend
      const loginRes = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });
      const { token } = await loginRes.json();

      setJwt(token);
      localStorage.setItem("jwt", token);
    };

    if (isConnected && !jwt) {
      loginWithEthereum();
    }
  }, [isConnected, address, signMessageAsync, jwt]);

  return (
    <main>
      <ConnectButton />
      {isConnected ? (
        <>
          <p>Logged in as: {address}</p>
          {jwt && <p>JWT: {jwt}</p>}
          <button
            onClick={() => {
              disconnect();
              setJwt(null);
              localStorage.removeItem("jwt");
            }}
            style={{ marginTop: "1rem" }}
          >
            Logout
          </button>
        </>
      ) : (
        <p>Welcome to Crypto Marketplace!</p>
      )}
    </main>
  );
}
