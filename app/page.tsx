'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import dynamic from 'next/dynamic';
import '@solana/wallet-adapter-react-ui/styles.css';
import { getStakingProgram } from './utils/anchorClient';
import { getVaultPda, getVaultSolPda, getStakePda } from './utils/pda';

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchData();
    }
  }, [wallet.publicKey]);

  const fetchData = async () => {
    if (!wallet.publicKey) return;

    try {
      const bal = await connection.getBalance(wallet.publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);

      const program = getStakingProgram(wallet as any) as any;
      const [stakeAccountPda] = getStakePda(wallet.publicKey);
      const accountInfo = await connection.getAccountInfo(stakeAccountPda);
      
      if (accountInfo) {
        const stakeAccount = await program.account.stakeAccount.fetch(stakeAccountPda);
        setStakedAmount(stakeAccount.amount.toNumber() / LAMPORTS_PER_SOL);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleStake = async () => {
    if (!wallet.publicKey || !amount) return;
    
    setLoading(true);
    try {
      const amountInLamports = new BN(parseFloat(amount) * LAMPORTS_PER_SOL);
      const program = getStakingProgram(wallet as any);
      const [vaultPda] = getVaultPda();
      const [vaultSolPda] = getVaultSolPda();
      const [stakeAccountPda] = getStakePda(wallet.publicKey);

      await program.methods
        .stakeSol(amountInLamports)
        .accountsPartial({
          user: wallet.publicKey,
          vault: vaultPda,
          stakeAccount: stakeAccountPda,
          vaultSolAccount: vaultSolPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setAmount('');
      await fetchData();
    } catch (error: any) {
      console.error('Stake failed:', error);
      alert(error.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const program = getStakingProgram(wallet as any);
      const [vaultPda] = getVaultPda();
      const [vaultSolPda] = getVaultSolPda();
      const [stakeAccountPda] = getStakePda(wallet.publicKey);

      await program.methods
        .unstakeSol()
        .accountsPartial({
          user: wallet.publicKey,
          vault: vaultPda,
          stakeAccount: stakeAccountPda,
          vaultSolAccount: vaultSolPda,
        })
        .rpc();

      await fetchData();
    } catch (error: any) {
      console.error('Unstake failed:', error);
      alert(error.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">SOL Staking</h1>
          <WalletMultiButton />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold mb-6">SOL Staking</h1>
        
        <WalletMultiButton />

        <div className="border border-gray-700 rounded-lg p-6">
          <p className="text-sm text-gray-400">Balance</p>
          <p className="text-2xl font-bold">{balance.toFixed(2)} SOL</p>
        </div>

        <div className="border border-gray-700 rounded-lg p-6">
          <p className="text-sm text-gray-400">Staked</p>
          <p className="text-2xl font-bold">{stakedAmount.toFixed(2)} SOL</p>
        </div>

        <div className="border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Stake SOL</h3>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white mb-4"
          />
          <button
            onClick={handleStake}
            disabled={loading || !amount}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded"
          >
            {loading ? 'Processing...' : 'Stake'}
          </button>
        </div>

        {stakedAmount > 0 && (
          <div className="border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Unstake</h3>
            <button
              onClick={handleUnstake}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-3 rounded"
            >
              {loading ? 'Processing...' : 'Unstake All'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
