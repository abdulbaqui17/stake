use anchor_lang::prelude::*;

use crate::state::{UserStake, Vault};

#[derive(Accounts)]
pub struct UnstakeSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"user_stake", vault.key().as_ref(), user.key().as_ref()],
        bump = user_stake.bump,
        constraint = user_stake.owner == user.key(),
    )]
    pub user_stake: Account<'info, UserStake>,

    /// CHECK: PDA used to hold SOL, validated by seeds
    #[account(
        mut,
        seeds = [b"vault_sol"],
        bump = vault.vault_bump,
    )]
    pub vault_sol_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UnstakeSol>, amount: u64) -> Result<()> {
    // TODO: Implement unstake logic
    // - Validate user has sufficient staked amount
    // - Transfer SOL from vault_sol_account back to user
    // - Update user_stake account
    // - Update vault total_staked
    Ok(())
}
