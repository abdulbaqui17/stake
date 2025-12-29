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
        const program = getProgram();
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
    return <div className="flex items-center justify-center h-screen">Please connect your wallet.</div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">{error}</div>;
  }

  if (!stakeData) {
    return <div className="flex items-center justify-center h-screen">No stake account found.</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Stake Account</h2>
        <p className="text-gray-700">Staked Amount: {stakeData.amount} SOL</p>
        <p className="text-gray-700">Stake Timestamp: {stakeData.timestamp}</p>
      </div>
    </div>
  );
};

export default StakeInfo;