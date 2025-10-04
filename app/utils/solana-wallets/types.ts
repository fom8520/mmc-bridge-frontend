import type { walletsAdapter } from './utils';

export type SolanaWalletType = keyof typeof walletsAdapter;

export type SolanaWalletAdapter<K extends SolanaWalletType> = InstanceType<(typeof walletsAdapter)[K]>;
