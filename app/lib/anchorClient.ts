import { AnchorProvider, Program, setProvider, Idl } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import idlJson from "../../target/idl/stake.json";

// Program ID deployed on devnet
const PROGRAM_ID = new PublicKey("C2vn8WDXEtTBHYf9ujRemiiSyPC561FoSAJhysMno7c3");

// Create IDL with correct address
const idl = {
  ...idlJson,
  address: PROGRAM_ID.toBase58(),
} as Idl;

export function getProgram(wallet: any) {
  if (!wallet || !wallet.connected) {
    throw new Error("Wallet not connected");
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const provider = new AnchorProvider(connection, wallet, {});

  setProvider(provider);

  return new Program(idl, provider);
}