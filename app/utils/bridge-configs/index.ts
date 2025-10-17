import { mmc_testnet } from './mmc';
import { solana_devnet } from './solana';

export type BridgeChain = {
  label: string;
  id: number;
  icon: string;
  rpc: string;
  tokens: {
    name: string;
    symbol: string;
    address: string;
    icon: string;
    decimals: number;
    contract: {
      hyperTokenCollateral: string;
      igp_program_id?: string;
      igp_account?: string;
      overhead_igp_account?: string;
      mailbox?: string;
      validator_announce?: string;
      multisig_ism_message_id?: string;
    };
  }[];
};

export const bridgeChainsTestnet: BridgeChain[] = [
  mmc_testnet,
  solana_devnet,
];

export default { bridgeChainsTestnet };
