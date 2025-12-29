"use client"
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Page() {
  const { connected } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to SOL Staking Frontend</h1>
      <p className="mt-4 text-gray-600">Start building your staking app here.</p>
      <WalletMultiButton />
      {connected && <p className="mt-4 text-green-500">Wallet Connected!</p>}
    </div>
  );
}