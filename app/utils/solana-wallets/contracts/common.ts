import { PublicKey } from '@solana/web3.js';

export const SPL_NOOP_PROGRAM_ID = new PublicKey('noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV');
export const HYP_TOKEN_IX_TAG_TRANSFER_REMOTE = 0; // HyperlaneTokenInstruction::TransferRemote tag
/// There are 1e9 lamports in one SOL.
export const ONE_SOL_IN_LAMPORTS = 50000000;
export const LOCAL_DOMAIN = 1234;
export const LOCAL_DECIMALS = 8;
export const LOCAL_DECIMALS_U32 = LOCAL_DECIMALS;
export const REMOTE_DECIMALS = 18;
export const REMOTE_GAS_AMOUNT = 200000;
export const MINIMUM_PRIORITY_FEE = 100_000;
export const PRIORITY_FEE_PADDING_FACTOR = 2;
