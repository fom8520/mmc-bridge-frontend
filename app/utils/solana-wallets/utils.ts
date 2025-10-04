import * as solanaWallets from './adapters';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export const SOLANA_CHAIN_IDS = {
  [WalletAdapterNetwork.Devnet]: 741852,
  [WalletAdapterNetwork.Mainnet]: 741852,
};

export const walletsAdapter = {
  SolflareWalletAdapter: SolflareWalletAdapter,
  PhantomWalletAdapter: solanaWallets.PhantomWalletAdapter,
  OkxWalletAdapter: solanaWallets.OkxWalletAdapter,
} as const;
