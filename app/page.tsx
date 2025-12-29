"use client"
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import StakeInfo from "./components/StakeInfo";
import StakeForm from "./components/StakeForm";
import UnstakeButton from "./components/UnstakeButton";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function Page() {
  const { connected } = useWallet();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-md space-y-6 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            SOL Staking
          </h1>
          <p className="text-sm text-gray-500">Stake your SOL securely using Anchor</p>
        </header>

        {/* Wallet Button */}
        <div className="flex justify-center">
          <WalletMultiButton />
        </div>

        {connected ? (
          <div className="w-full space-y-6 pt-2">
            <StakeInfo />
            <StakeForm />
            <UnstakeButton />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Please connect your wallet to view staking controls.</p>
          </div>
        )}
      </div>
    </div>
  );
}