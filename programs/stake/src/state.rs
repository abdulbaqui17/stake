use anchor_lang::prelude::*;

/// Vault PDA (Program Derived Address) for holding staked SOL.
/// 
/// ## Why use a PDA?
/// - **Deterministic**: The address is derived from seeds ["vault"], making it
///   predictable and discoverable by anyone with the program ID.
/// - **Program-owned**: Only this program can sign for the PDA, ensuring
///   SOL can only be moved through program instructions.
/// - **No private key**: PDAs have no corresponding private key, eliminating
///   the risk of key compromise.
/// - **Rent-exempt**: Initialized with enough lamports to be rent-exempt,
///   ensuring the account persists indefinitely.
/// 
/// ## Seeds: ["vault"]
/// Single seed creates a unique, singleton vault per program deployment.
#[account]
#[derive(InitSpace)]
pub struct Vault {
    /// Authority that can manage the vault (e.g., admin operations)
    pub authority: Pubkey,
    /// Bump seed used to derive the PDA - stored to avoid recalculation
    pub bump: u8,
    /// Bump seed for the vault's SOL holding account
    pub vault_bump: u8,
    /// Total lamports (SOL) staked in the vault
    pub total_staked: u64,
}

/// User stake account tracking individual stakes
#[account]
#[derive(InitSpace)]
pub struct UserStake {
    /// Owner of this stake account
    pub owner: Pubkey,
    /// Amount of SOL staked
    pub amount: u64,
    /// Timestamp when staked
    pub staked_at: i64,
    /// Bump seed for the user stake PDA
    pub bump: u8,
}

/// StakeAccount PDA for tracking a user's native SOL stake.
/// 
/// ## PDA Seeds: ["stake", user_pubkey]
/// - `"stake"`: Namespace prefix to avoid collisions with other PDAs
/// - `user_pubkey`: The staker's wallet address, ensuring one stake account per user
/// 
/// ## Space Calculation
/// - Discriminator: 8 bytes (Anchor account identifier)
/// - user: 32 bytes (Pubkey)
/// - amount: 8 bytes (u64)
/// - stake_timestamp: 8 bytes (i64)
/// - bump: 1 byte (u8)
/// - Total: 8 + 32 + 8 + 8 + 1 = 57 bytes
/// 
/// Using InitSpace derive macro for automatic calculation.
#[account]
#[derive(InitSpace)]
pub struct StakeAccount {
    /// The user's wallet pubkey who owns this stake.
    /// Used as part of PDA seeds to ensure unique stake account per user.
    pub user: Pubkey,

    /// Amount of native SOL staked in lamports.
    /// 1 SOL = 1_000_000_000 lamports (10^9).
    /// u64 max: ~18.4 billion SOL (more than total supply).
    pub amount: u64,

    /// Unix timestamp (seconds) when the stake was created or last updated.
    /// Used for calculating staking duration, rewards, or enforcing lock periods.
    /// i64 allows dates until year 292 billion.
    pub stake_timestamp: i64,

    /// Bump seed for PDA derivation.
    /// Stored to avoid recalculating during subsequent instructions.
    /// Seeds: ["stake", user.key().as_ref()], bump
    pub bump: u8,
}

impl StakeAccount {
    /// Seeds for deriving the StakeAccount PDA
    pub const SEED_PREFIX: &'static [u8] = b"stake";
    
    /// Calculate space needed for account (alternative to InitSpace)
    /// 8 (discriminator) + 32 (pubkey) + 8 (u64) + 8 (i64) + 1 (u8) = 57 bytes
    pub const SIZE: usize = 8 + 32 + 8 + 8 + 1;
}
