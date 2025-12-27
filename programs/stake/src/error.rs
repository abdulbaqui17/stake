use anchor_lang::prelude::*;

#[error_code]
pub enum StakingError {
    #[msg("Insufficient funds to unstake")]
    InsufficientFunds,
    #[msg("Invalid stake amount")]
    InvalidAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Unauthorized access")]
    Unauthorized,
}
