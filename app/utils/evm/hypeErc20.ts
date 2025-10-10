import { Contract, ethers } from 'ethers';
import Hyper_ERC20_ABI from './abis/hypey-erc20';

type ABI = typeof Hyper_ERC20_ABI;
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

export class HyperERC20Collateral {
  constructor(address: string) {
    this.address = address;
  }

  address!: string;

  static ABI = Hyper_ERC20_ABI;

  get contractProvider() {
    return new Contract(this.address, Hyper_ERC20_ABI);
  }

  getFunction<N extends FunctionNames>(name: N, ...params: ParamsFor<N>) {
    return this.contractProvider.populateTransaction[name]?.(...params);
  }

  parse(data: string) {
    try {
      const iface = new ethers.utils.Interface(Hyper_ERC20_ABI);
      const res = iface.parseTransaction({ data });

      return res;
    } catch {
      return null;
    }
  }

  /**
     *
     * @param param
     * @param param.destination target chain id
     * @param param.recipient target chain address
     * @param param.amountOrId transfer amount
     * @returns
     */
  transferRemote(param: { destination: string; recipient: string; amountOrId: bigint }) {
    return this.getFunction('transferRemote', ...[param.destination, param.recipient, param.amountOrId]);
  }
}
