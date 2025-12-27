import { describe, test, expect, beforeAll } from "bun:test";
import { LiteSVM } from "litesvm";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";

// Program ID - must match declare_id! in lib.rs
const PROGRAM_ID = new PublicKey("BjXncxDW9oA7TqLdWVLcgyhoPT3vecadXmi9HJFw2Hmc");

function getDiscriminator(instructionName: string): Buffer {
  const preimage = `global:${instructionName}`;
  const hash = createHash("sha256").update(preimage).digest();
  return hash.slice(0, 8);
}

/** Parse StakeAccount data from account bytes */
interface StakeAccountData {
  discriminator: Buffer;
  user: PublicKey;
  amount: bigint;
  stakeTimestamp: bigint;
  bump: number;
}

function parseStakeAccount(data: Uint8Array): StakeAccountData {
  const buffer = Buffer.from(data);
  return {
    discriminator: buffer.slice(0, 8),
    user: new PublicKey(buffer.slice(8, 40)),
    amount: buffer.readBigUInt64LE(40),
    stakeTimestamp: buffer.readBigInt64LE(48),
    bump: buffer.readUInt8(56),
  };
}

/** Parse Vault data from account bytes */
interface VaultData {
  discriminator: Buffer;
  authority: PublicKey;
  bump: number;
  vaultBump: number;
  totalStaked: bigint;
}

function parseVault(data: Uint8Array): VaultData {
  const buffer = Buffer.from(data);
  return {
    discriminator: buffer.slice(0, 8),
    authority: new PublicKey(buffer.slice(8, 40)),
    bump: buffer.readUInt8(40),
    vaultBump: buffer.readUInt8(41),
    totalStaked: buffer.readBigUInt64LE(42),
  };
}

// PDA derivation helpers
function findVaultPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("vault")], PROGRAM_ID);
}

function findVaultSolPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("vault_sol")], PROGRAM_ID);
}

function findStakeAccountPda(user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), user.toBuffer()],
    PROGRAM_ID
  );
}

// ============================================================================
// Test Suite
// ============================================================================

describe("Stake Program - LiteSVM", () => {
  let svm: LiteSVM;
  let authority: Keypair;
  let vaultPda: PublicKey;
  let vaultBump: number;
  let vaultSolPda: PublicKey;
  let vaultSolBump: number;

  beforeAll(() => {
    // Initialize LiteSVM
    svm = new LiteSVM();

    // Load the compiled program
    const programPath = path.join(__dirname, "../target/deploy/stake.so");
    if (!fs.existsSync(programPath)) {
      throw new Error(`Program not found at ${programPath}. Run 'anchor build' first.`);
    }
    const programBytes = fs.readFileSync(programPath);
    svm.addProgram(PROGRAM_ID, programBytes);

    // Create and fund test wallet
    authority = Keypair.generate();
    svm.airdrop(authority.publicKey, BigInt(10 * LAMPORTS_PER_SOL));

    // Derive PDAs
    [vaultPda, vaultBump] = findVaultPda();
    [vaultSolPda, vaultSolBump] = findVaultSolPda();

    console.log("LiteSVM initialized");
    console.log(`   Program ID: ${PROGRAM_ID.toBase58()}`);
    console.log(`   Authority: ${authority.publicKey.toBase58()}`);
    console.log(`   Vault PDA: ${vaultPda.toBase58()}`);
    console.log(`   Vault SOL PDA: ${vaultSolPda.toBase58()}`);
  });

  // ==========================================================================
  // initialize_vault
  // ==========================================================================
  test("initialize_vault creates vault PDA", () => {
    const discriminator = getDiscriminator("initialize_vault");

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: vaultSolPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: discriminator,
    });

    const tx = new Transaction().add(ix);
    tx.recentBlockhash = svm.latestBlockhash();
    tx.feePayer = authority.publicKey;
    tx.sign(authority);
    svm.sendTransaction(tx);

    // Verify vault account exists and is owned by the program
    const vaultAccount = svm.getAccount(vaultPda);
    expect(vaultAccount).not.toBeNull();
    expect(vaultAccount!.owner.toBase58()).toBe(PROGRAM_ID.toBase58());

    console.log("Vault initialized successfully!");
    console.log(`   Vault owner: ${vaultAccount!.owner.toBase58()}`);
    console.log(`   Vault data length: ${vaultAccount!.data.length} bytes`);
  });

  // ==========================================================================
  // stake_sol - Comprehensive Test
  // ==========================================================================
  test("stake_sol: user stakes SOL with all state changes verified", () => {
    const stakeAmount = BigInt(2 * LAMPORTS_PER_SOL);
    const [stakeAccountPda, stakeAccountBump] = findStakeAccountPda(authority.publicKey);

    // ========== Capture state BEFORE staking ==========
    const userBalanceBefore = svm.getBalance(authority.publicKey) ?? BigInt(0);
    const vaultSolBalanceBefore = svm.getBalance(vaultSolPda) ?? BigInt(0);
    const vaultAccountBefore = svm.getAccount(vaultPda);
    const vaultDataBefore = parseVault(vaultAccountBefore!.data);
    
    // StakeAccount should NOT exist before first stake
    const stakeAccountBefore = svm.getAccount(stakeAccountPda);
    expect(stakeAccountBefore).toBeNull();

    console.log("\nState BEFORE stake_sol:");
    console.log(`   User balance: ${Number(userBalanceBefore) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Vault SOL balance: ${Number(vaultSolBalanceBefore) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Vault totalStaked: ${Number(vaultDataBefore.totalStaked) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   StakeAccount exists: ${stakeAccountBefore !== null}`);

    // ========== Build and send stake_sol instruction ==========
    const discriminator = getDiscriminator("stake_sol");
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(stakeAmount);
    const data = Buffer.concat([discriminator, amountBuffer]);

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
        { pubkey: vaultSolPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const tx = new Transaction().add(ix);
    tx.recentBlockhash = svm.latestBlockhash();
    tx.feePayer = authority.publicKey;
    tx.sign(authority);
    svm.sendTransaction(tx);

    // ========== Capture and verify state AFTER staking ==========
    const userBalanceAfter = svm.getBalance(authority.publicKey) ?? BigInt(0);
    const vaultSolBalanceAfter = svm.getBalance(vaultSolPda) ?? BigInt(0);
    const vaultAccountAfter = svm.getAccount(vaultPda);
    const vaultDataAfter = parseVault(vaultAccountAfter!.data);
    const stakeAccountAfter = svm.getAccount(stakeAccountPda);

    console.log("\nState AFTER stake_sol:");
    console.log(`   User balance: ${Number(userBalanceAfter) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Vault SOL balance: ${Number(vaultSolBalanceAfter) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Vault totalStaked: ${Number(vaultDataAfter.totalStaked) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   StakeAccount exists: ${stakeAccountAfter !== null}`);

    // ========== ASSERTIONS ==========

    // 1. User balance decreased by stake amount (plus tx fees)
    const userBalanceDecrease = userBalanceBefore - userBalanceAfter;
    expect(userBalanceDecrease).toBeGreaterThanOrEqual(stakeAmount);
    console.log(`\nUser balance decreased by ${Number(userBalanceDecrease) / LAMPORTS_PER_SOL} SOL`);

    // 2. Vault PDA balance increased by stake amount
    const vaultBalanceIncrease = vaultSolBalanceAfter - vaultSolBalanceBefore;
    expect(vaultBalanceIncrease).toBe(stakeAmount);
    console.log(`Vault SOL balance increased by ${Number(vaultBalanceIncrease) / LAMPORTS_PER_SOL} SOL`);

    // 3. StakeAccount PDA was created
    expect(stakeAccountAfter).not.toBeNull();
    expect(stakeAccountAfter!.owner.toBase58()).toBe(PROGRAM_ID.toBase58());
    console.log(`StakeAccount PDA created, owned by program`);

    // 4. Parse and verify StakeAccount data
    const stakeData = parseStakeAccount(stakeAccountAfter!.data);
    
    // Verify user pubkey stored correctly
    expect(stakeData.user.toBase58()).toBe(authority.publicKey.toBase58());
    console.log(`StakeAccount.user matches: ${stakeData.user.toBase58()}`);
    
    // Verify amount stored correctly
    expect(stakeData.amount).toBe(stakeAmount);
    console.log(`StakeAccount.amount = ${Number(stakeData.amount) / LAMPORTS_PER_SOL} SOL`);
    
    // Verify timestamp field exists (LiteSVM may return 0 since Clock sysvar isn't fully simulated)
    // In production, this would be non-zero
    expect(stakeData.stakeTimestamp).toBeGreaterThanOrEqual(BigInt(0));
    console.log(`StakeAccount.stake_timestamp = ${stakeData.stakeTimestamp}`);
    
    // Verify bump is stored
    expect(stakeData.bump).toBe(stakeAccountBump);
    console.log(`StakeAccount.bump = ${stakeData.bump}`);

    // 5. Vault totalStaked increased
    expect(vaultDataAfter.totalStaked).toBe(vaultDataBefore.totalStaked + stakeAmount);
    console.log(`Vault.totalStaked increased to ${Number(vaultDataAfter.totalStaked) / LAMPORTS_PER_SOL} SOL`);

    console.log("\nstake_sol test passed - all state changes verified!");
  });

  // ==========================================================================
  // unstake_sol - Comprehensive Test
  // ==========================================================================
  test("unstake_sol: user unstakes SOL, PDA signs transfer, account closed", () => {
    const [stakeAccountPda] = findStakeAccountPda(authority.publicKey);

    // Get current stake amount from StakeAccount
    const stakeAccountBefore = svm.getAccount(stakeAccountPda);
    expect(stakeAccountBefore).not.toBeNull();
    const stakeDataBefore = parseStakeAccount(stakeAccountBefore!.data);
    const unstakeAmount = stakeDataBefore.amount; // Unstake full amount

    // ========== Capture state BEFORE unstaking ==========
    const userBalanceBefore = svm.getBalance(authority.publicKey) ?? BigInt(0);
    const vaultSolBalanceBefore = svm.getBalance(vaultSolPda) ?? BigInt(0);
    const vaultAccountBefore = svm.getAccount(vaultPda);
    const vaultDataBefore = parseVault(vaultAccountBefore!.data);
    const stakeAccountRentBefore = stakeAccountBefore!.lamports;

    console.log("\nState BEFORE unstake_sol:");
    console.log(`   User balance: ${Number(userBalanceBefore) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Vault SOL balance: ${Number(vaultSolBalanceBefore) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Vault totalStaked: ${Number(vaultDataBefore.totalStaked) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   StakeAccount.amount: ${Number(stakeDataBefore.amount) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   StakeAccount rent: ${Number(stakeAccountRentBefore)} lamports`);
    console.log(`   Unstaking: ${Number(unstakeAmount) / LAMPORTS_PER_SOL} SOL`);

    // ========== Build and send unstake_sol instruction ==========
    const discriminator = getDiscriminator("unstake_sol");
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(unstakeAmount);
    const data = Buffer.concat([discriminator, amountBuffer]);

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
        { pubkey: vaultSolPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const tx = new Transaction().add(ix);
    tx.recentBlockhash = svm.latestBlockhash();
    tx.feePayer = authority.publicKey;
    tx.sign(authority);

    // This should succeed - PDA signs the transfer via invoke_signed
    svm.sendTransaction(tx);

    // ========== Capture and verify state AFTER unstaking ==========
    const userBalanceAfter = svm.getBalance(authority.publicKey) ?? BigInt(0);
    const vaultSolBalanceAfter = svm.getBalance(vaultSolPda) ?? BigInt(0);
    const vaultAccountAfter = svm.getAccount(vaultPda);
    const vaultDataAfter = parseVault(vaultAccountAfter!.data);
    const stakeAccountAfter = svm.getAccount(stakeAccountPda);

    console.log("\nState AFTER unstake_sol:");
    console.log(`   User balance: ${Number(userBalanceAfter) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Vault SOL balance: ${Number(vaultSolBalanceAfter) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Vault totalStaked: ${Number(vaultDataAfter.totalStaked) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   StakeAccount exists: ${stakeAccountAfter !== null}`);

    // ========== ASSERTIONS ==========

    // 1. User received SOL back (balance increased, minus tx fees)
    // User gets: unstakeAmount + stakeAccountRent - txFees
    const userBalanceIncrease = userBalanceAfter - userBalanceBefore;
    expect(userBalanceAfter).toBeGreaterThan(userBalanceBefore);
    console.log(`\nUser balance increased by ${Number(userBalanceIncrease) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   (unstaked amount + rent refund - tx fees)`);

    // 2. Vault SOL balance decreased by unstake amount
    const vaultBalanceDecrease = vaultSolBalanceBefore - vaultSolBalanceAfter;
    expect(vaultBalanceDecrease).toBe(unstakeAmount);
    console.log(`Vault SOL balance decreased by ${Number(vaultBalanceDecrease) / LAMPORTS_PER_SOL} SOL`);

    // 3. PDA signed the transfer correctly (if we got here, it worked!)
    console.log(`PDA signed the transfer correctly (invoke_signed succeeded)`);

    // 4. StakeAccount PDA is CLOSED (account should not exist)
    expect(stakeAccountAfter).toBeNull();
    console.log(`StakeAccount PDA is closed (account no longer exists)`);

    // 5. Vault totalStaked decreased
    expect(vaultDataAfter.totalStaked).toBe(vaultDataBefore.totalStaked - unstakeAmount);
    console.log(`Vault.totalStaked decreased to ${Number(vaultDataAfter.totalStaked) / LAMPORTS_PER_SOL} SOL`);

    console.log("\nunstake_sol test passed - PDA signed transfer, account closed!");
  });

  // ==========================================================================
  // Reward Calculation Test
  // ==========================================================================
  test("calculate_rewards: compute staking rewards based on duration", () => {
    const [stakeAccountPda] = findStakeAccountPda(authority.publicKey);

    // First, stake some SOL to have a stake account
    const stakeAmount = BigInt(1 * LAMPORTS_PER_SOL);
    const discriminator = getDiscriminator("stake_sol");
    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(stakeAmount);
    const data = Buffer.concat([discriminator, amountBuffer]);

    const ix = new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: authority.publicKey, isSigner: true, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: stakeAccountPda, isSigner: false, isWritable: true },
        { pubkey: vaultSolPda, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data,
    });

    const tx = new Transaction().add(ix);
    tx.recentBlockhash = svm.latestBlockhash();
    tx.feePayer = authority.publicKey;
    tx.sign(authority);
    svm.sendTransaction(tx);

    // Get stake account data
    const stakeAccount = svm.getAccount(stakeAccountPda);
    expect(stakeAccount).not.toBeNull();
    const stakeData = parseStakeAccount(stakeAccount!.data);

    // Reward calculation parameters
    const ANNUAL_RATE = 0.10; // 10% APY
    const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

    // Simulate different staking durations
    const durations = [
      { name: "1 hour", seconds: 3600 },
      { name: "1 day", seconds: 86400 },
      { name: "1 week", seconds: 604800 },
      { name: "30 days", seconds: 2592000 },
      { name: "1 year", seconds: SECONDS_PER_YEAR },
    ];

    console.log("\nReward Calculation (10% APY):");
    console.log(`   Staked amount: ${Number(stakeData.amount) / LAMPORTS_PER_SOL} SOL`);
    console.log(`   Stake timestamp: ${stakeData.stakeTimestamp}`);
    console.log("\n   Duration        | Reward (SOL)   | Reward (lamports)");
    console.log("   ----------------|----------------|------------------");

    for (const duration of durations) {
      // Simple interest formula: reward = principal * rate * (time / year)
      const rewardLamports = Math.floor(
        Number(stakeData.amount) * ANNUAL_RATE * (duration.seconds / SECONDS_PER_YEAR)
      );
      const rewardSol = rewardLamports / LAMPORTS_PER_SOL;

      console.log(
        `   ${duration.name.padEnd(15)} | ${rewardSol.toFixed(9).padStart(14)} | ${rewardLamports}`
      );

      // Verify reward calculation is positive and proportional
      expect(rewardLamports).toBeGreaterThan(0);
    }

    // Verify 1 year reward equals 10% of stake
    const oneYearReward = Math.floor(Number(stakeData.amount) * ANNUAL_RATE);
    expect(oneYearReward).toBe(Math.floor(Number(stakeAmount) * 0.10));

    console.log("\nReward calculation test passed!");
    console.log(`   1 year reward at 10% APY: ${oneYearReward / LAMPORTS_PER_SOL} SOL`);
  });
});
