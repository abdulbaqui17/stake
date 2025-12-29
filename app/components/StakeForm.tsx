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
      const program = getProgram(wallet);
      
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
          user: wallet.publicKey,
          vault: vaultPDA,
          stakeAccount: stakeAccountPDA,
          vaultSolAccount: vaultSolPDA,
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
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          Amount (SOL)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full py-3 px-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="0.00"
          disabled={!wallet.connected || loading}
        />
      </div>

      <button
        onClick={handleStake}
        disabled={isDisabled}
        className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all transform ${
          isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl active:scale-95"
        }`}
      >
        {loading ? "Staking..." : "Stake SOL"}
      </button>

      {status && (
        <div
          className={`p-4 rounded-xl border ${
            status.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <p className="font-medium">{status.message}</p>
        </div>
      )}
    </div>
  );
};

export default StakeForm;