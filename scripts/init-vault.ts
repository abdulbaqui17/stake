import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Stake;
  
  // Derive PDAs
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId
  );
  
  const [vaultSol] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_sol")],
    program.programId
  );

  console.log("Program ID:", program.programId.toString());
  console.log("Vault PDA:", vault.toString());
  console.log("Vault SOL PDA:", vaultSol.toString());
  console.log("Authority:", provider.wallet.publicKey.toString());

  try {
    // Check if vault already exists
    const vaultAccount = await provider.connection.getAccountInfo(vault);
    if (vaultAccount) {
      console.log("Vault already initialized!");
      return;
    }
  } catch (e) {
    // Continue to initialize
  }

  console.log("Initializing vault...");
  
  const tx = await program.methods
    .initializeVault()
    .accounts({
      authority: provider.wallet.publicKey,
      vault,
      vaultSolAccount: vaultSol,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Vault initialized! Tx:", tx);
}

main().catch(console.error);

