'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getStakingProgram } from '../utils/anchorClient';
import { getVaultPda, getVaultSolPda, getStakePda } from '../utils/pda';

export function StakeForm({ onSuccess }: { onSuccess?: () => void }) {
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the staking process:
   * 1. Validates amount input
   * 2. Converts SOL to lamports (1 SOL = 1_000_000_000 lamports)
   * 3. Derives required PDAs
   * 4. Calls stake_sol instruction via Anchor program
   */
  const handleStake = async () => {
    if (!wallet.publicKey || !amount) return;
    
    setIsLoading(true);

    try {
      // Validate amount
      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert SOL to lamports
      const amountInLamports = new BN(amountFloat * LAMPORTS_PER_SOL);
      
      // Get Anchor program instance
      const program = getStakingProgram(wallet as any);
      
      // Derive all required PDAs
      const [vaultPda] = getVaultPda();
      const [vaultSolPda] = getVaultSolPda();
      const [stakeAccountPda] = getStakePda(wallet.publicKey);

      // Call stake_sol instruction
      const tx = await program.methods
        .stakeSol(amountInLamports)
        .accountsPartial({
          user: wallet.publicKey,
          vault: vaultPda,
          stakeAccount: stakeAccountPda,
          vaultSolAccount: vaultSolPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Staked successfully:', tx);
      console.log(`Amount: ${amount} SOL`);
      
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('❌ Stake failed:', error);
      console.error('Error message:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Stake SOL</h3>
      
      <input
        type="number"
        placeholder="Amount in SOL"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={!wallet.connected || isLoading}
      />

      <button
        onClick={handleStake}
        disabled={!wallet.connected || !amount || isLoading}
      >
        {isLoading ? 'Processing...' : 'Stake'}
      </button>
    </div>
  );
}
