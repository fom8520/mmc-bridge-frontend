import type starRpcApiJson from './mmc-rpc-api.json';

type StarRpcApiType = typeof starRpcApiJson;

type StarRpcApiPath = keyof StarRpcApiType;

type StarRpcApiParams<K extends StarRpcApiPath> = StarRpcApiType[K]['params'];

export type SendTransactionMethod
  = | 'CreateTransaction'
    | 'CreateFundTransaction'
    | 'CreateDeployContractTransaction'
    | 'CreateCallContractTransaction'
    | 'CreateStakingTransaction'
    | 'CreateUnstakingTransaction'
    | 'CreateDelegatingTransaction'
    | 'CreateUndelegatingTransaction'
    | 'CreateBonusTransaction'
    | 'CreateLockTransaction'
    | 'CreateUnLockTransaction'
    | 'CreateVoteTransaction';

export type SendTransactionParams = {
  [K in SendTransactionMethod]: {
    method: K; // rpc method
    data: K extends 'CreateTransaction' // 交易体
      ? StarRpcApiParams<K>
      : StarRpcApiParams<K>['params'];
    options?: { // 不参与交易
      gasAsset?: { // gas
        gasType: string;
        gasAmount: string;
      };
      asset?: { // execute asset type
        assetType: string;
        amount: string; //
      };
      flowRate?: number;
    };
  }
}[SendTransactionMethod];

export class StarProvider {
  constructor() {
    const provider = (window as any)?.starLink as any;
    this.provider = provider;
  }

  provider: any;

  name = 'LOLlet';
  icon = '/wallet/LOLlet.png';

  connect(): Promise<string[]> {
    return this.provider.connect();
  }

  disconnect(): Promise<void> {
    return this.provider.disconnect();
  }

  signMessage(msg: string): Promise<string> {
    return this.provider.signMessage(msg);
  }

  signTransaction(tx: string): Promise<string> {
    return this.provider.signTransaction(tx);
  }

  getPublicKey(): Promise<string> {
    return this.provider.getPublicKey();
  }

  switchAccount(addr: string): Promise<boolean> {
    return this.provider.switchAccount(addr);
  }

  sendTransaction(data: SendTransactionParams) {
    return this.provider.sendTransaction(data);
  }

  onAccountsChanged(callback: (info: { active?: string | null; accounts: string[] }) => void) {
    if (this.provider?.initialized?.()) {
      callback({
        active: this.provider.address(),
        accounts: this.provider.accounts(),
      });
    }

    this.provider?.onAccountsChanged(callback);
  }

  onDisconnect(callback: () => void) {
    this.provider?.onDisconnect(callback);
  }
}
