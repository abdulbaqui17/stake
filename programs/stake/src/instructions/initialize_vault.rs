use anchor_lang::prelude::*;

use crate::state::Vault;

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: Account<'info, Vault>,

    /// CHECK: PDA used to hold SOL, validated by seeds
    #[account(
        seeds = [b"vault_sol", vault.key().as_ref()],
        bump,
    )]
    pub vault_sol_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeVault>) -> Result<()> {
    // TODO: Implement initialization logic
    Ok(())
}
