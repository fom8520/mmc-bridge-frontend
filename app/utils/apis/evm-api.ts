import { ethers } from 'ethers';
import ERC20_ABI from '../evm/abis/erc-20';

export class EvmApi {
  constructor(rpc: string) {
    this.rpc = rpc;
  }

  rpc!: string;
  get provider() {
    return new ethers.providers.JsonRpcProvider(this.rpc);
  }

  /**
     * Get the balance of the chain natively.
     * @param address
     * @returns
     */
  async getBalance(address: string) {
    const res = await this.provider.getBalance(address);

    return res.toBigInt();
  }

  /**
     *  Get the balance of the chain erc20 token.
     * @param address
     * @param contract
     * @returns
     */
  async balanceOf(address: string, contract: string) {
    const contractProvider = new ethers.Contract(contract, ERC20_ABI, this.provider);
    const res = await contractProvider.balanceOf(address);

    return res.toBigInt();
  }
}
