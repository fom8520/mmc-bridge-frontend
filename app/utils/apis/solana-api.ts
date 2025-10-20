import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

export class SolanaApi {
  constructor(rpc: string) {
    this.rpc = rpc;
    this.connection = new Connection(rpc);
  }

  rpc!: string;
  connection!: Connection;

  async getTokenProgramId(token: PublicKey) {
    const mintInfo = await this.connection.getAccountInfo(new PublicKey(token));
    if (!mintInfo) {
      throw new Error(`Provided SVM account ${token} does not exist`);
    }

    return mintInfo.owner;
  }

  async getBalance(param: {
    address: string;
    contract?: string;
  }): Promise<bigint> {
    const address = new PublicKey(param.address);
    if (!address) {
      return 0n;
    }

    if (param.contract) {
      const tokenProgramId = new PublicKey(param.contract);
      const programId = await this.getTokenProgramId(tokenProgramId);

      const dst = getAssociatedTokenAddressSync(
        tokenProgramId,
        address,
        true,
        programId,
      );

      console.log(dst.toBase58());

      const result = await this.connection.getTokenAccountBalance(dst);

      return BigInt(result.value.amount);
    } else {
      const res = await this.connection.getBalance(address);

      return BigInt(res);
    }
  }
}
