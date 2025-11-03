import type {
  SendTransactionOptions,
  TransactionOrVersionedTransaction,
} from '@solana/wallet-adapter-base';
import {
  WalletSignMessageError,
  WalletSignTransactionError, WalletAdapterNetwork,
  WalletNotReadyError,
  WalletError,
} from '@solana/wallet-adapter-base';
import { SOLANA_CHAIN_IDS, getSolanaWallets } from './utils';
import {
  PublicKey,
  type Connection,
  type Transaction,
  type TransactionSignature,
  type VersionedTransaction,
} from '@solana/web3.js';
import type { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import type { OkxWalletAdapter, PhantomWalletAdapter } from './adapters';
import errorInfos from './error';

type WalletAdapter = SolflareWalletAdapter | PhantomWalletAdapter | OkxWalletAdapter;
export class SolanaWalletController {
  name!: string;
  provider!: WalletAdapter;

  constructor(_provider: WalletAdapter) {
    this.name = _provider.name;
    this.provider = _provider;
  }

  // static solanaWallets: {
  //   [key in SolanaWalletType]: InstanceType<(typeof walletsAdapter)[key]>;
  // } = walletObj;

  static wallets(): SolanaWalletController[] {
    const _wallets = getSolanaWallets();

    return _wallets.map((item) => {
      return new SolanaWalletController(new item());
    });
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

  async connect(): Promise<void> {
    try {
      return await this.provider?.connect();
    } catch (err) {
      if (err instanceof WalletError) {
        if (err instanceof WalletNotReadyError) {
          window.open(this.provider.url, '_blank');
        }

        const name = err.name as keyof typeof errorInfos;
        throw new Error(errorInfos[name].message);
      }
      throw err;
    }
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
