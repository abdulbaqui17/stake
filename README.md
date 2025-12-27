# Stake Program

A native SOL staking program built on Solana using the Anchor framework.

## Overview

This program allows users to stake and unstake native SOL tokens. It uses Program Derived Addresses (PDAs) for secure, trustless management of staked funds.

## Features

- **Stake SOL** - Deposit native SOL into the staking vault
- **Unstake SOL** - Withdraw staked SOL from the vault
- **PDA-based Security** - All funds are held in program-owned accounts with no private keys
- **Per-user Tracking** - Individual stake accounts track each user's deposits and timestamps

## Architecture

### Accounts

| Account | Seeds | Description |
|---------|-------|-------------|
| `Vault` | `["vault"]` | Singleton vault storing total staked amount and authority |
| `VaultSolAccount` | `["vault_sol"]` | PDA holding the actual staked SOL |
| `StakeAccount` | `["stake", user_pubkey]` | Per-user account tracking stake amount and timestamp |

### Instructions

1. **`initialize_vault`** - Creates the vault and vault SOL account (one-time setup)
2. **`stake_sol`** - Stakes SOL from user wallet to the vault
3. **`unstake_sol`** - Withdraws staked SOL back to user wallet

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor](https://www.anchor-lang.com/docs/installation)
- [Bun](https://bun.sh/) (for running tests)

### Installation

```bash
# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
cd tests-bun && bun test
```

### Local Development

```bash
# Start local validator
solana-test-validator

# Deploy to localnet
anchor deploy
```

## Program ID

```
BjXncxDW9oA7TqLdWVLcgyhoPT3vecadXmi9HJFw2Hmc
```

## Project Structure

```
├── programs/stake/
│   └── src/
│       ├── lib.rs          # Program entrypoint and instructions
│       ├── state.rs        # Account structures (Vault, StakeAccount)
│       ├── error.rs        # Custom error types
│       └── instructions/   # Instruction handlers
├── tests-bun/
│   └── stake.test.ts       # Bun test suite
├── target/
│   ├── idl/               # Generated IDL
│   └── types/             # Generated TypeScript types
└── Anchor.toml            # Anchor configuration
```

## License

MIT
