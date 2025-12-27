use anchor_lang::prelude::*;

use crate::state::Vault;

/// Context for initializing the staking vault.
/// 
/// This creates two PDAs:
/// 1. `vault` - Stores staking metadata (authority, total_staked, bumps)
/// 2. `vault_sol_account` - System account that actually holds the staked SOL
/// 
/// ## Why separate accounts?
/// - The Vault account stores program data and is owned by the program
/// - The vault_sol_account is a System Program-owned account that holds native SOL
/// - This separation allows the program to track metadata while safely holding SOL
#[derive(Accounts)]
pub struct InitializeVault<'info> {
    /// The authority that will manage the vault.
    /// Pays for account creation and becomes the vault admin.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Vault PDA storing staking configuration.
    /// 
    /// Seeds: ["vault"]
    /// - Deterministic: Anyone can derive this address
    /// - Singleton: Only one vault per program deployment
    /// - Program-owned: Only this program can modify it
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,  // 8 byte discriminator + struct fields
        seeds = [b"vault"],
        bump,
    )]
    pub vault: Account<'info, Vault>,

    /// PDA system account that holds staked SOL.
    /// 
    /// Seeds: ["vault_sol"]
    /// - This is a System Program-owned account (not a program account)
    /// - Allows holding native SOL that can be transferred via CPI
    /// - Program signs for withdrawals using PDA seeds
    /// 
    /// CHECK: Safe because:
    /// 1. Seeds are validated by Anchor
    /// 2. Rent-exempt system account
    /// 3. Only program can sign for transfers from this PDA
    #[account(
        mut,
        seeds = [b"vault_sol"],
        bump,
    )]
    pub vault_sol_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeVault>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    
    // Store the authority and bump seeds for later use
    vault.authority = ctx.accounts.authority.key();
    vault.bump = ctx.bumps.vault;
    vault.vault_bump = ctx.bumps.vault_sol_account;
    vault.total_staked = 0;

    msg!("Vault initialized!");
    msg!("Vault PDA: {}", vault.key());
    msg!("Vault SOL Account: {}", ctx.accounts.vault_sol_account.key());
    msg!("Authority: {}", vault.authority);

    Ok(())
}
