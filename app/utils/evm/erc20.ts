import { Contract, ethers } from 'ethers';
import ERC20_ABI from './abis/erc-20';

type ABI = typeof ERC20_ABI;
type ABIFunction = Extract<ABI[number], { type: 'function' }>;
type FunctionNames = ABIFunction['name'];

type InputToType<T> = T extends 'address'
  ? string
  : T extends 'uint256'
    ? bigint
    : T extends 'uint8'
      ? number
      : T extends 'bool'
        ? boolean
        : T extends 'string'
          ? string
          : unknown;

type InputsOf<T extends readonly { type: string }[]> = {
  [K in keyof T]: T[K] extends { type: infer U } ? InputToType<U> : never
};

type ParamsFor<N extends FunctionNames> = Extract<
  ABIFunction,
  { name: N }
>['inputs'] extends infer I
  ? I extends readonly any[]
    ? InputsOf<I>
    : []
  : [];

export class ERC20 {
  constructor(address: string, rpc?: string) {
    this.address = address;
    this.rpc = rpc;
  }

  rpc?: string;
  address!: string;

  static ABI = ERC20_ABI;
  get rpcProvider() {
    if (!this.rpc) {
      return;
    }
    return new ethers.providers.JsonRpcProvider(this.rpc);
  }

  get contractProvider() {
    return new Contract(this.address, ERC20.ABI, this.rpcProvider);
  }

  getFunction<N extends FunctionNames>(name: N, ...params: ParamsFor<N>) {
    return this.contractProvider.populateTransaction[name]?.(...params);
  }

  parse(data: string) {
    try {
      const iface = new ethers.utils.Interface(ERC20.ABI);
      const res = iface.parseTransaction({ data });

      return res;
    } catch {
      return null;
    }
  }

  async allowanceToTokenSelf(
    owner: string,
    spender: string,
    amount: bigint,
  ) {
    const cur: ethers.BigNumber = await this.contractProvider.allowance(owner, spender);
    if (cur.gte(amount)) return true;
    return false;
  }

  /**
   *
   * Approve token
   * @param provider
   * @param param
   *    contract: Contract Address
   *    approveAddress Approved address
   *    address Account address
   *    amount Transaction amount
   * @returns boolean
   */
  async approve(
    provider: ethers.providers.Web3Provider,
    param: {
      approvedAddress: string;
      address: string;
      amount: bigint;
    },
  ): Promise<boolean | ethers.providers.TransactionReceipt> {
    const isApprove = await this.allowanceToTokenSelf(param.address, param.approvedAddress, param.amount);
    console.log(isApprove);

    if (isApprove) {
      return true;
    }
    const signer = await provider.getSigner();
    const _contractProvider = new ethers.Contract(this.address, ERC20.ABI, signer);
    const res = await _contractProvider.approve(param.approvedAddress, param.amount);
    console.log(res);

    await res.wait();
    await this.rpcProvider?.waitForTransaction(res.hash);

    const _isApprove = await this.allowanceToTokenSelf(param.address, param.approvedAddress, param.amount);

    if (!isApprove) {
      throw new Error('Allowance exceeded');
    }

    return _isApprove;
  }
}
