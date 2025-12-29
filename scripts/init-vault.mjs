import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { homedir } from "os";

const PROGRAM_ID = new PublicKey("C2vn8WDXEtTBHYf9ujRemiiSyPC561FoSAJhysMno7c3");

async function main() {
  // Load wallet
  const walletPath = `${homedir()}/.config/solana/id.json`;
  const secretKey = JSON.parse(readFileSync(walletPath, "utf-8"));
  const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  
  console.log("Wallet:", wallet.publicKey.toBase58());
  
  // Connect to devnet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // Load IDL
  const idl = JSON.parse(readFileSync("./target/idl/stake.json", "utf-8"));
  
  // Create provider
  const provider = new AnchorProvider(
    connection,
    { publicKey: wallet.publicKey, signTransaction: async (tx) => { tx.sign(wallet); return tx; }, signAllTransactions: async (txs) => { txs.forEach(tx => tx.sign(wallet)); return txs; } },
    { commitment: "confirmed" }
  );
  setProvider(provider);
  
  const program = new Program(idl, provider);
  
  // Derive PDAs
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    PROGRAM_ID
  );
  
  const [vaultSol] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_sol")],
    PROGRAM_ID
  );
  
  console.log("Program ID:", PROGRAM_ID.toBase58());
  console.log("Vault PDA:", vault.toBase58());
  console.log("Vault SOL PDA:", vaultSol.toBase58());
  
  // Check if vault exists
  const vaultAccount = await connection.getAccountInfo(vault);
  if (vaultAccount) {
    console.log("Vault already initialized!");
    return;
  }
  
  console.log("Initializing vault...");
  
  const tx = await program.methods
    .initializeVault()
    .accounts({
      authority: wallet.publicKey,
      vault,
      vaultSolAccount: vaultSol,
      systemProgram: SystemProgram.programId,
    })
    .signers([wallet])
    .rpc();
  
  console.log("Vault initialized! Tx:", tx);
}

main().catch(console.error);
