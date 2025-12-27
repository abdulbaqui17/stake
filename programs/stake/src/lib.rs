use anchor_lang::prelude::*;

declare_id!("BjXncxDW9oA7TqLdWVLcgyhoPT3vecadXmi9HJFw2Hmc");

pub mod state;
pub mod error;

use state::*;
use error::*;

#[program]
pub mod stake {
    use super::*;
    use anchor_lang::system_program::{transfer, Transfer};

    /// Initializes the staking vault
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        
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

    /// Stakes native SOL into the vault
    pub fn stake_sol(ctx: Context<StakeSol>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);

        let clock = Clock::get()?;
        let current_timestamp = clock.unix_timestamp;

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

        let stake_account = &mut ctx.accounts.stake_account;
        
        let is_new_account = stake_account.user == Pubkey::default();
        
        if is_new_account {
            stake_account.user = ctx.accounts.user.key();
            stake_account.amount = amount;
            stake_account.stake_timestamp = current_timestamp;
            stake_account.bump = ctx.bumps.stake_account;
            
            msg!("New stake account created for user: {}", stake_account.user);
        } else {
            stake_account.amount = stake_account
                .amount
                .checked_add(amount)
                .ok_or(StakingError::Overflow)?;
            stake_account.stake_timestamp = current_timestamp;
            
            msg!("Added to existing stake for user: {}", stake_account.user);
        }

        let vault = &mut ctx.accounts.vault;
        vault.total_staked = vault
            .total_staked
            .checked_add(amount)
            .ok_or(StakingError::Overflow)?;

        msg!("Stake successful!");
        msg!("Amount staked: {} lamports ({} SOL)", amount, amount as f64 / 1e9);
        msg!("User total stake: {} lamports", stake_account.amount);
        msg!("Vault total staked: {} lamports", vault.total_staked);
        msg!("Stake timestamp: {}", current_timestamp);

        Ok(())
    }

    /// Unstakes native SOL from the vault
    pub fn unstake_sol(ctx: Context<UnstakeSol>, amount: u64) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        
        require!(
            stake_account.amount >= amount,
            StakingError::InsufficientFunds
        );

        let vault_sol_seeds = &[b"vault_sol".as_ref(), &[ctx.accounts.vault.vault_bump]];
        
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.vault_sol_account.key(),
            &ctx.accounts.user.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &transfer_ix,
            &[
                ctx.accounts.vault_sol_account.to_account_info(),
                ctx.accounts.user.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[vault_sol_seeds],
        )?;

        stake_account.amount = stake_account
            .amount
            .checked_sub(amount)
            .ok_or(StakingError::InsufficientFunds)?;

        let vault = &mut ctx.accounts.vault;
        vault.total_staked = vault
            .total_staked
            .checked_sub(amount)
            .ok_or(StakingError::InsufficientFunds)?;

        msg!("Unstake successful!");
        msg!("Amount unstaked: {} lamports ({} SOL)", amount, amount as f64 / 1e9);
        msg!("User remaining stake: {} lamports", stake_account.amount);
        msg!("Vault total staked: {} lamports", vault.total_staked);

        Ok(())
    }
}

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

    #[account(
        mut,
        seeds = [b"vault_sol"],
        bump,
    )]
    pub vault_sol_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

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
        space = 8 + StakeAccount::INIT_SPACE,
        seeds = [StakeAccount::SEED_PREFIX, user.key().as_ref()],
        bump,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        mut,
        seeds = [b"vault_sol"],
        bump = vault.vault_bump,
    )]
    pub vault_sol_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

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
        seeds = [StakeAccount::SEED_PREFIX, user.key().as_ref()],
        bump = stake_account.bump,
        constraint = stake_account.user == user.key() @ StakingError::Unauthorized,
        close = user,
    )]
    pub stake_account: Account<'info, StakeAccount>,

    #[account(
        mut,
        seeds = [b"vault_sol"],
        bump = vault.vault_bump,
    )]
    pub vault_sol_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}
