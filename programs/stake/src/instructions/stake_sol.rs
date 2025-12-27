use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::error::StakingError;
use crate::state::{StakeAccount, Vault};

/// Context for staking native SOL.
/// 
/// This instruction:
/// 1. Transfers SOL from the user to the vault PDA
/// 2. Creates or updates the user's StakeAccount PDA
/// 3. Updates the vault's total staked amount
#[derive(Accounts)]
pub struct StakeSol<'info> {
    /// The user staking SOL. Must sign the transaction.
    /// Marked as mutable because SOL will be debited from this account.
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
    /// Seeds: ["stake", user_pubkey] - unique per user.
    /// init_if_needed: Creates on first stake, reuses on subsequent stakes.
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + StakeAccount::INIT_SPACE,
        seeds = [StakeAccount::SEED_PREFIX, user.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    /// PDA system account that holds staked SOL.
    /// This is where all staked SOL is pooled.
    #[account(
        mut,
        seeds = [b"vault_sol"],
        bump = vault.vault_bump,
    )]
    pub vault_sol_account: SystemAccount<'info>,

    /// Required for SOL transfers via CPI.
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<StakeSol>, amount: u64) -> Result<()> {
    // =========================================================================
    // Step 1: Validate the stake amount
    // =========================================================================
    // Ensure the user is staking a non-zero amount to prevent empty transactions
    require!(amount > 0, StakingError::InvalidAmount);

    // =========================================================================
    // Step 2: Get the current timestamp from Clock sysvar
    // =========================================================================
    // Clock::get() retrieves the cluster's current time without needing
    // to pass the Clock account explicitly (uses sysvar cache)
    let clock = Clock::get()?;
    let current_timestamp = clock.unix_timestamp;

    // =========================================================================
    // Step 3: Transfer SOL from user to vault PDA
    // =========================================================================
    // Use system_program::transfer via CPI (Cross-Program Invocation)
    // The user signs this transaction, authorizing the debit from their account
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.vault_sol_account.to_account_info(),
            },
        ),
        amount,
    )?;

    // =========================================================================
    // Step 4: Initialize or update the StakeAccount PDA
    // =========================================================================
    let stake_account = &mut ctx.accounts.stake_account;
    
    // Check if this is a new stake account (user field will be default/zeroed)
    let is_new_account = stake_account.user == Pubkey::default();
    
    if is_new_account {
        // First time staking: initialize all fields
        stake_account.user = ctx.accounts.user.key();
        stake_account.amount = amount;
        stake_account.stake_timestamp = current_timestamp;
        stake_account.bump = ctx.bumps.stake_account;
        
        msg!("New stake account created for user: {}", stake_account.user);
    } else {
        // Existing stake: add to current amount, update timestamp
        stake_account.amount = stake_account
            .amount
            .checked_add(amount)
            .ok_or(StakingError::Overflow)?;
        stake_account.stake_timestamp = current_timestamp;
        
        msg!("Added to existing stake for user: {}", stake_account.user);
    }

    // =========================================================================
    // Step 5: Update the vault's total staked amount
    // =========================================================================
    let vault = &mut ctx.accounts.vault;
    vault.total_staked = vault
        .total_staked
        .checked_add(amount)
        .ok_or(StakingError::Overflow)?;

    // =========================================================================
    // Step 6: Emit logs for tracking/debugging
    // =========================================================================
    msg!("Stake successful!");
    msg!("Amount staked: {} lamports ({} SOL)", amount, amount as f64 / 1e9);
    msg!("User total stake: {} lamports", stake_account.amount);
    msg!("Vault total staked: {} lamports", vault.total_staked);
    msg!("Stake timestamp: {}", current_timestamp);

    Ok(())
}
