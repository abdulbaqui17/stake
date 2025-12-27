use anchor_lang::prelude::*;

use crate::state::{UserStake, Vault};

#[derive(Accounts)]
pub struct StakeSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserStake::INIT_SPACE,
        seeds = [b"user_stake", vault.key().as_ref(), user.key().as_ref()],
        bump,
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

pub fn handler(ctx: Context<StakeSol>, amount: u64) -> Result<()> {
    // TODO: Implement stake logic
    // - Transfer SOL from user to vault_sol_account
    // - Update user_stake account
    // - Update vault total_staked
    Ok(())
}
