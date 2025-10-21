import { bridgeChainsTestnet } from '~/utils/bridge-configs';

export function useBridgeConfig() {
  const bridgeConfig = bridgeChainsTestnet;

  const evmChains = bridgeConfig.filter(chain => chain.type === 'EVM');

  return {
    chains: bridgeConfig,
    evmChains,
  };
}
