"use client";

import { FC, ReactNode, useMemo, useCallback } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletError } from "@solana/wallet-adapter-base";

interface WalletContextProviderProps {
  children: ReactNode;
}

const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // Use devnet for testing - change to "mainnet-beta" for production
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  // Empty array - wallet-standard will auto-detect installed wallets
  const wallets = useMemo(() => [], []);

  const onError = useCallback((error: WalletError) => {
    // Silently handle common connection errors
    if (
      error.name === "WalletConnectionError" ||
      error.message?.includes("Unexpected error") ||
      error.message?.includes("User rejected")
    ) {
      // These are expected user actions, don't log as errors
      return;
    }
    console.error("Wallet error:", error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;