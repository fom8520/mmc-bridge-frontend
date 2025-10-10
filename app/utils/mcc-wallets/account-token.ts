type AccountTokenInstance = any;
interface Token {
  address: string;
  name: string;
  symbol: string;
  icon: string;
  balance: string;
  decimals: number;
  isNative: boolean;
  deployer: string;
  deployutxo: string;
}

// AccountToken class
export class AccountToken implements Token {
  constructor(info: AccountTokenInstance) {
    this.initData = info;
    Object.assign(this, {
      decimals: info.decimals ? info.decimals.length - 1 : 8,
      deployer: info.ownerAddress,
      deployutxo: info.deployHash,
      address: info.contractAddress || info.assetType,
      icon: info.logo,
      balance: info.balance || '0',
      symbol: info.symbol,
      assetType: info.assetType || '',
      owner: info.owner || '',
    });
  }

  initData!: AccountTokenInstance;

  // add token to my list
  owner?: string;

  address!: string;
  icon!: string;
  balance!: string;
  symbol!: string;
  decimals!: number;
  deployer!: string;
  deployutxo!: string;
  assetType!: string;

  get isNative() {
    return this.assetType === 'Vote';
  }

  get name() {
    return this.initData.name || this.initData.contractName;
  }

  get formatBalance() {
    return this.balance;
  }

  get isFlow() {
    return this.initData.isFlow === '1';
  }

  isSame(addr: string) {
    return (
      addr && this.address && addr.toLowerCase() === this.address.toLowerCase()
    );
  }
}
