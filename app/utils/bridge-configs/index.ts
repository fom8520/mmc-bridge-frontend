import { mmc_testnet } from './mmc';
import { solana_devnet } from './solana';

export type BridgeChain = {
  label: string;
  id: number;
  value: string; // solana | mmc | bsc
  icon: string;
  rpc: string;
  network: string;
  /**
   * 'EVM' | 'Solana'  | 'MMC'
   */
  type: string; // 'EVM' | 'Solana' | 'MMC'
  tokens: {
    name: string;
    symbol: string;
    chain: string;
    address: string;
    icon: string;
    decimals: number;
    contract: {
      [key: string]: { // key = chain value
        hyperTokenCollateral: string;
        igp_program_id?: string;
        igp_account?: string;
        overhead_igp_account?: string;
        mailbox?: string;
        validator_announce?: string;
        multisig_ism_message_id?: string;
      };
    };
  }[];
};

export const bridgeChainsTestnet: BridgeChain[] = [
  mmc_testnet,
  solana_devnet,
];

export default { bridgeChainsTestnet };
