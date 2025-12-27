use anchor_lang::prelude::*;

declare_id!("BjXncxDW9oA7TqLdWVLcgyhoPT3vecadXmi9HJFw2Hmc");

pub mod state;
pub mod instructions;
pub mod error;

use instructions::*;

#[program]
pub mod stake {
    use super::*;

    /// Initializes the staking vault
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        instructions::initialize_vault::handler(ctx)
    }

    /// Stakes native SOL into the vault
    pub fn stake_sol(ctx: Context<StakeSol>, amount: u64) -> Result<()> {
        instructions::stake_sol::handler(ctx, amount)
    }

    /// Unstakes native SOL from the vault
    pub fn unstake_sol(ctx: Context<UnstakeSol>, amount: u64) -> Result<()> {
        instructions::unstake_sol::handler(ctx, amount)
    }
}
