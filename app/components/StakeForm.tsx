"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getProgram } from "../lib/anchorClient";
import { BN } from "@coral-xyz/anchor";

const StakeForm = () => {
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleStake = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setStatus({ type: "error", message: "Wallet not connected" });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatus({ type: "error", message: "Invalid amount" });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const program = getProgram();
      
      // Convert SOL to lamports
      const amountLamports = new BN(amountNum * LAMPORTS_PER_SOL);

      // Derive PDAs
      const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        program.programId
      );

      const [vaultSolPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_sol")],
        program.programId
      );

      // Call stake_sol instruction
      await program.methods
        .stakeSol(amountLamports)
        .accounts({
          stakeAccount: stakeAccountPDA,
          vault: vaultPDA,
          vaultSol: vaultSolPDA,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus({ type: "success", message: "Staked successfully!" });
      setAmount("");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to stake SOL" });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !wallet.connected || loading || !amount || parseFloat(amount) <= 0;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Stake SOL</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount (SOL)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter amount"
            disabled={!wallet.connected || loading}
          />
        </div>

        <button
          onClick={handleStake}
          disabled={isDisabled}
          className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Staking..." : "Stake SOL"}
        </button>

        {status && (
          <div
            className={`mt-4 p-3 rounded ${
              status.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        {!wallet.connected && (
          <p className="mt-4 text-center text-gray-600 text-sm">
            Please connect your wallet to stake SOL
          </p>
        )}
      </div>
    </div>
  );
};

export default StakeForm;