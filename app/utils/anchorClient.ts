import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { PROGRAM_ID, RPC_ENDPOINT } from '../constants';
import idl from '../../target/idl/stake.json';

/**
 * Creates and returns a configured Anchor Program instance for the staking program.
 * 
 * @param wallet - The connected wallet adapter from useWallet hook
 * @returns Program instance configured with the staking program IDL
 */
export const getStakingProgram = (wallet: any) => {
  // Create connection to Solana cluster (localnet/devnet/mainnet)
  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  
  // Create AnchorProvider - bridges wallet adapter with Anchor
  // This provider handles signing transactions using the connected wallet
  const provider = new AnchorProvider(
    connection,
    wallet,
    {
      commitment: 'confirmed',
    }
  );
  
  // Initialize and return the Program instance with:
  // - IDL: defines the program's interface (accounts, instructions, types)
  // - Program ID: on-chain address of the deployed program (from IDL)
  // - Provider: handles RPC calls and transaction signing
  return new Program(idl as Idl, provider);
};
