'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // RPC endpoint - connects to Solana devnet
  const endpoint = 'https://api.devnet.solana.com';

  // Configure supported wallets - Phantom only
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    // ConnectionProvider - manages RPC connection to Solana network
    <ConnectionProvider endpoint={endpoint}>
      {/* WalletProvider - manages wallet state and interactions */}
      <WalletProvider wallets={wallets} autoConnect>
        {/* WalletModalProvider - provides UI modal for wallet selection */}
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
