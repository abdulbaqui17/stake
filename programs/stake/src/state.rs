use anchor_lang::prelude::*;

/// Vault account that holds staking configuration
#[account]
#[derive(InitSpace)]
pub struct Vault {
    /// Authority that can manage the vault
    pub authority: Pubkey,
    /// Bump seed for the vault PDA
    pub bump: u8,
    /// Total SOL staked in the vault
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
