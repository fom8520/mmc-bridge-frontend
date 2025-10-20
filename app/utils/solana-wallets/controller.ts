import type {
  SendTransactionOptions,
  TransactionOrVersionedTransaction,
} from '@solana/wallet-adapter-base';
import {
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError, WalletAdapterNetwork,
} from '@solana/wallet-adapter-base';
import type { SolanaWalletType } from './types';
import { SOLANA_CHAIN_IDS, walletsAdapter } from './utils';
import {
  PublicKey,
  type Connection,
  type Transaction,
  type TransactionSignature,
  type VersionedTransaction,
} from '@solana/web3.js';

const walletObj: any = {};

for (const k of Object.keys(walletsAdapter) as SolanaWalletType[]) {
  const adapterCtor = walletsAdapter[k];
  const p = new adapterCtor();
  if (p.readyState === WalletReadyState.Installed) {
    walletObj[k] = p as InstanceType<typeof adapterCtor>;
  }
}

export class SolanaWalletController {
  id!: SolanaWalletType;

  constructor(id: SolanaWalletType) {
    this.id = id;
  }

  static solanaWallets: {
    [key in SolanaWalletType]: InstanceType<(typeof walletsAdapter)[key]>;
  } = walletObj;

  static get wallets() {
    return (
      Object.keys(SolanaWalletController.solanaWallets) as SolanaWalletType[]
    ).map(k => new SolanaWalletController(k));
  }

  static isValidSolanaAddress(address: string): boolean {
    try {
      const pubkey = new PublicKey(address);

      return pubkey.toBase58() === address;
    } catch {
      return false;
    }
  }

  static isSolana(chainId: number) {
    return Object.values(SOLANA_CHAIN_IDS).includes(chainId);
  }

  static requestSolanaNetworkType(chainId: number): WalletAdapterNetwork {
    switch (chainId) {
      case 1399811149: // ??
        return WalletAdapterNetwork.Mainnet;
      default:// 1399811149
        return WalletAdapterNetwork.Devnet;
    }
  }

  get provider() {
    const p = SolanaWalletController.solanaWallets[this.id];

    return p;
  }

  get connected() {
    return this.provider?.connected;
  }

  get publicKey() {
    return this.provider?.publicKey;
  }

  get label() {
    return this.provider?.name;
  }

  get icon() {
    return this.provider?.icon;
  }

  get address() {
    return this.publicKey?.toBase58();
  }

  onChangeAccounts(callback: (pubkey: PublicKey) => void) {
    this.provider.on('connect', (pubkey: PublicKey) => {
      callback(pubkey);
    });
  }

  onDisconnect(callback: () => void) {
    this.provider.on('disconnect', () => {
      callback();
    });
  }

  off(event: 'connect' | 'disconnect') {
    this.provider.off(event);
  }

  connect(): Promise<void> {
    return this.provider?.connect();
  }

  disconnect(): Promise<void> {
    this.provider.off('disconnect');
    this.provider.off('connect');
    return this.provider.disconnect();
  }

  signMessage(message: Uint8Array): Promise<Uint8Array> {
    const provider = this.provider as {
      signMessage?: (msg: Uint8Array) => Promise<Uint8Array>;
    };
    if (typeof provider.signMessage !== 'function') {
      return Promise.reject(WalletSignMessageError);
    }
    return provider.signMessage(message);
  }

  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    const provider = this.provider as {
      signTransaction?: (tx: T) => Promise<T>;
    };
    if (typeof provider.signTransaction !== 'function') {
      return Promise.reject(WalletSignTransactionError);
    }
    return provider.signTransaction(transaction);
  }

  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    const provider = this.provider as {
      signAllTransactions?: (txs: T[]) => Promise<T[]>;
    };
    if (typeof provider.signAllTransactions !== 'function') {
      return Promise.reject(WalletSignTransactionError);
    }
    return provider.signAllTransactions(transactions);
  }

  sendTransaction(
    transaction: TransactionOrVersionedTransaction<
      (typeof this.provider)['supportedTransactionVersions']
    >,
    connection: Connection,
    options: SendTransactionOptions = {},
  ): Promise<TransactionSignature> {
    return (this.provider as any).sendTransaction(
      transaction as Transaction | VersionedTransaction,
      connection,
      options,
    );
  }
}
