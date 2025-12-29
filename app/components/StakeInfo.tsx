"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProgram } from "../lib/anchorClient";

const StakeInfo = () => {
  const wallet = useWallet();
  const [stakeData, setStakeData] = useState<{ amount: number; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStakeAccount = async () => {
      if (!wallet.connected || !wallet.publicKey) {
        setStakeData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const program = getProgram(wallet);
        const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("stake"), wallet.publicKey.toBuffer()],
          program.programId
        );

        const account = await (program.account as any).stakeAccount.fetchNullable(stakeAccountPDA);

        if (!account) {
          setStakeData(null);
        } else {
          setStakeData({
            amount: account.amount.toNumber() / 1e9, // Convert lamports to SOL
            timestamp: new Date(account.timestamp.toNumber() * 1000).toLocaleString(),
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stake account.");
      } finally {
        setLoading(false);
      }
    };

    fetchStakeAccount();
  }, [wallet.connected, wallet.publicKey]);

  if (!wallet.connected) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border border-gray-200">
        <p className="text-gray-600 animate-pulse">Loading stake info...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-5 text-center border border-red-100">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!stakeData) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border border-gray-200">
        <p className="text-gray-600 font-medium">No stake account found</p>
        <p className="text-xs text-gray-500 mt-1">Stake SOL to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 space-y-3 border border-indigo-100">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Staked Amount</span>
        <span className="text-xl font-bold text-indigo-700">{stakeData.amount} SOL</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Staked At</span>
        <span className="text-xs text-gray-700">{stakeData.timestamp}</span>
      </div>
    </div>
  );
};

export default StakeInfo;