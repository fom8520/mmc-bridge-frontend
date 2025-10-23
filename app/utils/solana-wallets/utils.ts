import { PhantomWalletAdapter, OkxWalletAdapter } from './adapters';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletAdapterNetwork, WalletReadyState } from '@solana/wallet-adapter-base';

export const SOLANA_CHAIN_IDS = {
  [WalletAdapterNetwork.Devnet]: 741852,
  [WalletAdapterNetwork.Mainnet]: 741852,
};

export function getSolanaWallets() {
  return [SolflareWalletAdapter, PhantomWalletAdapter, OkxWalletAdapter].filter((item) => {
    const adapterCtor = item;
    const p = new adapterCtor();

    return p.readyState === WalletReadyState.Installed;
  });
}
