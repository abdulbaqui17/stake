'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { getProgram } from '../lib/anchorClient';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

export default function UnstakeButton() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUnstake = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
    const program = getProgram(wallet);

      // Derive PDAs
      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('stake'), publicKey.toBuffer()],
        program.programId
      );

      const [vault] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault')],
        program.programId
      );

      const [vaultSol] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault_sol')],
        program.programId
      );

      // Build transaction
      const tx = await program.methods
        .unstakeSol()
        .accounts({
          user: publicKey,
          stakeAccount,
          vault,
          vaultSol,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .transaction();

      // Send transaction
      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      setSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error('Unstake error:', err);
      setError(err.message || 'Failed to unstake SOL');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !publicKey || isLoading;

  return (
    <div className="space-y-4">
      <button
        onClick={handleUnstake}
        disabled={isDisabled}
        className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all border-2 ${
          isDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-95'
        }`}
      >
        {isLoading ? 'Unstaking...' : 'Unstake SOL'}
      </button>

      {success && (
        <div className="p-4 bg-green-50 text-green-800 rounded-xl border border-green-200">
          <p className="font-medium">Successfully unstaked SOL!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
