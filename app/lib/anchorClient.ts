import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import idl from "../../target/idl/stake.json";

const programId = new PublicKey("BjXncxDW9oA7TqLdWVLcgyhoPT3vecadXmi9HJFw2Hmc");

export function getProgram() {
  const wallet = useWallet();

  if (!wallet.connected) {
    throw new Error("Wallet not connected");
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const provider = new AnchorProvider(connection, wallet, {});
  
  setProvider(provider);

  return new Program(idl as any, provider);
}