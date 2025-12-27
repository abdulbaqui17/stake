use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::error::StakingError;
use crate::state::{StakeAccount, Vault};

/// Context for unstaking native SOL.
/// 
/// This instruction:
/// 1. Verifies the caller owns the StakeAccount
/// 2. Transfers SOL from vault PDA back to the user
/// 3. Closes the StakeAccount PDA, returning rent to the user
/// 4. Updates the vault's total staked amount
#[derive(Accounts)]
pub struct UnstakeSol<'info> {
    /// The user unstaking SOL. Must be the owner of the StakeAccount.
    /// Will receive the unstaked SOL and rent from closed account.
    #[account(mut)]
    pub user: Signer<'info>,

    /// The vault PDA storing global staking state.
    /// Mutable because we update total_staked.
    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    /// The user's stake account PDA.
    /// - Seeds verify this belongs to the user
    /// - Constraint ensures caller is the owner
    /// - close = user: Returns rent lamports to user after unstaking
    #[account(
        mut,
        seeds = [StakeAccount::SEED_PREFIX, user.key().as_ref()],
        bump = stake_account.bump,
        constraint = stake_account.user == user.key() @ StakingError::Unauthorized,
        close = user,  // Close account and return rent to user
    )]
    pub stake_account: Account<'info, StakeAccount>,

    /// PDA system account that holds staked SOL.
    /// SOL will be transferred from here back to the user.
    /// 
    /// CHECK: Safe because:
    /// 1. Seeds are validated by Anchor
    /// 2. Bump is verified against stored vault.vault_bump
    /// 3. Only this program can sign for transfers via invoke_signed
    #[account(
        mut,
        seeds = [b"vault_sol"],
        bump = vault.vault_bump,
    )]
    pub vault_sol_account: SystemAccount<'info>,

    /// Required for SOL transfers via CPI.
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UnstakeSol>, amount: u64) -> Result<()> {
    // =========================================================================
    // Step 1: Validate the unstake amount
    // =========================================================================
    // Ensure the user is unstaking a non-zero amount
    require!(amount > 0, StakingError::InvalidAmount);

    let stake_account = &ctx.accounts.stake_account;
    let vault = &mut ctx.accounts.vault;

    // =========================================================================
    // Step 2: Verify user has sufficient staked amount
    // =========================================================================
    // Check that the requested unstake amount doesn't exceed their stake
    require!(
        stake_account.amount >= amount,
        StakingError::InsufficientFunds
    );

    // =========================================================================
    // Step 3: Verify vault has sufficient SOL
    // =========================================================================
    // Ensure the vault_sol_account has enough lamports to fulfill the request
    // This should always be true if accounting is correct, but we check anyway
    let vault_sol_balance = ctx.accounts.vault_sol_account.lamports();
    require!(
        vault_sol_balance >= amount,
        StakingError::InsufficientFunds
    );

    // =========================================================================
    // Step 4: Transfer SOL from vault PDA back to user using invoke_signed
    // =========================================================================
    // 
    // ## Why invoke_signed?
    // The vault_sol_account is a PDA (Program Derived Address). PDAs don't have
    // private keys, so they can't sign transactions normally. Instead, the program
    // that owns the PDA can "sign" on its behalf using invoke_signed.
    //
    // ## How PDA signing works:
    // 1. We provide the seeds used to derive the PDA: ["vault_sol"]
    // 2. We include the bump seed to complete the derivation
    // 3. Solana runtime verifies: sha256("vault_sol" + bump + program_id) == vault_sol_account.key
    // 4. If verified, the runtime allows the transfer as if the PDA signed it
    //
    // ## Security:
    // - Only THIS program can produce a valid signature for this PDA
    // - The seeds must match exactly what was used to create the PDA
    // - This ensures only authorized program logic can move funds
    //
    let vault_sol_seeds: &[&[u8]] = &[
        b"vault_sol",
        &[vault.vault_bump],  // The bump seed makes this a valid PDA
    ];
    let signer_seeds: &[&[&[u8]]] = &[vault_sol_seeds];

    // Perform the SOL transfer via CPI with PDA signing
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_sol_account.to_account_info(),
                to: ctx.accounts.user.to_account_info(),
            },
            signer_seeds,  // PDA signs via these seeds
        ),
        amount,
    )?;

    // =========================================================================
    // Step 5: Update vault's total staked amount
    // =========================================================================
    // Safely subtract the unstaked amount using checked arithmetic
    vault.total_staked = vault
        .total_staked
        .checked_sub(amount)
        .ok_or(StakingError::Overflow)?;

    // =========================================================================
    // Step 6: Emit logs for tracking/debugging
    // =========================================================================
    // Note: The StakeAccount will be closed automatically by Anchor's `close` constraint
    // after this handler returns. The rent lamports go to the user.
    msg!("Unstake successful!");
    msg!("Amount unstaked: {} lamports ({} SOL)", amount, amount as f64 / 1e9);
    msg!("User: {}", ctx.accounts.user.key());
    msg!("Vault remaining total: {} lamports", vault.total_staked);
    msg!("StakeAccount will be closed, rent returned to user");

    // =========================================================================
    // Note on Account Closure:
    // =========================================================================
    // The `close = user` constraint in the account validation handles:
    // 1. Zeroing out the account data (security: prevents resurrection attacks)
    // 2. Transferring all remaining lamports (rent) to the user
    // 3. Setting the account's owner to the System Program
    // 
    // This happens automatically after the handler returns successfully.
    // If this instruction fails, the account remains open.

    Ok(())
}
