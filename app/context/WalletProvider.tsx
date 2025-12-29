"use client";

import { FC, ReactNode, useMemo, useCallback, useState, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletError } from "@solana/wallet-adapter-base";

interface WalletContextProviderProps {
  children: ReactNode;
}

const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const endpoint = clusterApiUrl("devnet");

  const [wallets, setWallets] = useState<any[]>([]);
  const [deferredAutoConnect, setDeferredAutoConnect] = useState(false);

  useEffect(() => {
    // Delay initializing adapters and enabling autoConnect until after mount
    // and only when a wallet provider is present. This prevents adapter
    // instances from trying to connect when no provider exists.
    if (typeof window === "undefined") return;

    const hasPhantom = (window as any).phantom?.solana?.isPhantom === true;
    const hasStandard = !!(window as any).wallets || !!(window as any).solana;

    if (hasPhantom || hasStandard) {
      // instantiate adapters now that provider is present
      setWallets([new PhantomWalletAdapter()]);
      setDeferredAutoConnect(true);
    } else {
      // ensure no adapters are provided when no provider exists
      setWallets([]);
      setDeferredAutoConnect(false);
    }
  }, []);

  const onError = useCallback((error: WalletError) => {
    console.error("Wallet error:", error);
    // Silently handle auto-connect errors
    if (error.message?.includes("Unexpected error") || error.name === "WalletConnectionError") {
      return;
    }
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