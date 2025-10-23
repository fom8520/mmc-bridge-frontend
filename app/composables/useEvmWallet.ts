import { createAppKit, useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitProvider, useDisconnect, useWalletInfo } from '@reown/appkit/vue';
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5';
import { walletConfig } from '~/app.config';
import { bsc, bscTestnet } from '@reown/appkit/networks';
import type { Provider } from '@reown/appkit/vue';
import { ethers } from 'ethers';

const metadata = walletConfig.metadata;

let isInit = false;

if (!isInit) {
  // Create a AppKit instance
  createAppKit({
    projectId: walletConfig.projectId,
    metadata,
    adapters: [new Ethers5Adapter()],
    networks: [bsc, bscTestnet],
    features: {
      analytics: false,
      email: false,
      socials: false,
      swaps: false,
      send: false,
    },
  });

  isInit = true;
}

export function useEvmWallet() {
  const { chains } = useBridgeConfig();

  const modal = useAppKit();
  const account = useAppKitAccount({ namespace: 'eip155' });
  const provider = useAppKitProvider<Provider>('eip155');
  const networkData = useAppKitNetwork();
  const { disconnect } = useDisconnect();
  const address = computed(() => account.value.address);
  const isConnected = computed(() => account.value.isConnected);
  const walletProvider = computed(() => provider.walletProvider);
  const chainId = computed(() => networkData.value.chainId);

  const walletInfo = computed(() => {
    const { walletInfo: _walletInfo } = useWalletInfo();

    return {
      label: _walletInfo?.name ?? '',
      icon: _walletInfo?.icon ?? '',
      chain: 'evm',
      accounts: address.value ? [{ address: address.value ?? '' }] : [],
      provider: walletProvider.value,
      chainId: chainId.value,
    };
  });

  /**
   *
   * Add the token to wallet
   *
   * @param token
   * @param provider Wallet Provider
   */
  async function addTokenToWallet(token: {
    address: string;
    symbol: string;
    decimals: number | string;
    icon: string;
  }): Promise<void> {
    await walletProvider.value?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: Number(token.decimals),
          image: token.icon,
        },
      },
    });
  }

  // Sign message
  async function signMessage(message: string) {
    if (!isConnected.value) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(walletProvider.value!);
    const signer = await provider.getSigner();
    const signature = await signer?.signMessage(message);

    return signature;
  }

  async function switchNetwork(chain: number) {
    if (chain === Number(chainId.value)) return true;
    if (!walletProvider.value) {
      throw new Error('Wallet provider is not available.');
    }

    try {
      await walletProvider.value?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chain.toString(16)}` }],
      });
      return true;
    } catch (err: any) {
      if (err.code === 4902) {
        const _network = chains.find((item: any) => Number(item.id) === chain);
        if (!_network) {
          throw new Error('There is no wallet in the current network.');
        }

        await walletProvider.value // Or window.ethereum if you don't support EIP-6963.
          .request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chain.toString(16)}`,
                chainName: _network.label,
                rpcUrls: [_network.rpc] /* ... */,
                blockExplorerUrls: [_network.explorer],
                nativeCurrency: {
                  name: _network.symbol,
                  symbol: _network.symbol,
                  decimals: 18,
                },
              },
            ],
          });

        return await switchNetwork(chain);
      } else {
        throw err;
      }
    }
  }

  async function sendTransaction(chainId: number, tx: ethers.providers.TransactionRequest) {
    if (!isConnected.value) {
      throw new Error('Wallet is not connected!');
    }

    const provider = new ethers.providers.Web3Provider(walletProvider.value!);
    const signer = await provider.getSigner();
    const gas = await provider.estimateGas({
      ...tx,
      from: await signer.getAddress(),
    });
    const fee = await provider.getFeeData();

    return signer.sendTransaction({
      ...tx,
      gasLimit: gas.mul(120).div(100),
      maxFeePerGas: fee.maxFeePerGas ?? undefined,
      maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? undefined,
    });
  }

  return {
    modal,
    chainId,
    address,
    isConnected,
    walletProvider,
    walletInfo,
    disconnect,
    addTokenToWallet,
    signMessage,
    switchNetwork,
    sendTransaction,
  };
}
