import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, VAULT_SEED, VAULT_SOL_SEED, STAKE_SEED } from '../constants';

/**
 * Derives the Vault PDA (Program Derived Address).
 * 
 * PDAs are deterministic addresses derived from seeds and a program ID.
 * - No private key exists for PDAs
 * - Only the program can sign for transactions from this address
 * - Anyone can derive the same address using the same seeds
 * 
 * Seeds: ["vault"]
 * Returns: [PublicKey, bump] where bump is used to ensure the address is off the ed25519 curve
 */
export const getVaultPda = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED)],
    PROGRAM_ID
  );
};

/**
 * Derives the Vault SOL Account PDA.
 * 
 * This is a System Program-owned account that holds the actual staked SOL.
 * Separate from the Vault account which stores metadata.
 * 
 * Seeds: ["vault_sol"]
 * Returns: [PublicKey, bump]
 */
export const getVaultSolPda = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SOL_SEED)],
    PROGRAM_ID
  );
};

/**
 * Derives the Stake Account PDA for a specific user.
 * 
 * Each user has their own stake account that tracks their staked amount.
 * The user's public key is used as a seed to ensure uniqueness.
 * 
 * Seeds: ["stake", user_pubkey]
 * - "stake": Namespace prefix
 * - user_pubkey: Ensures one stake account per user
 * 
 * Returns: [PublicKey, bump]
 */
export const getStakePda = (userPublicKey: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(STAKE_SEED), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
};
