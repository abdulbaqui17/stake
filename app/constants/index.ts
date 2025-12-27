import { PublicKey } from '@solana/web3.js';

// Program ID from the deployed Solana program (declare_id in lib.rs)
export const PROGRAM_ID = new PublicKey('BjXncxDW9oA7TqLdWVLcgyhoPT3vecadXmi9HJFw2Hmc');

// RPC endpoint - use localnet for development
// Change to devnet: 'https://api.devnet.solana.com' or mainnet-beta for production
export const RPC_ENDPOINT = 'http://127.0.0.1:8899';

// PDA seed strings - must match exactly with on-chain program
// Used to derive deterministic program addresses

// Vault PDA seed - stores global staking metadata (authority, total_staked, bumps)
export const VAULT_SEED = 'vault';

// Vault SOL account PDA seed - System Program account that holds staked SOL
export const VAULT_SOL_SEED = 'vault_sol';

// Stake account PDA seed prefix - combined with user pubkey to create per-user stake accounts
// Full seeds: [STAKE_SEED, userPublicKey]
export const STAKE_SEED = 'stake';
