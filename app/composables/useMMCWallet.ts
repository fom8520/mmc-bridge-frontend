import { MMCRpcApi } from '~/utils/apis/mmc-rpc-api';
import { mmcNetworkConfigs } from '~/utils/configs';
import { StarProvider } from '~/utils/mcc-wallets/mmc-provider';

export function useMMCWallet() {
  const rpcApi = new MMCRpcApi(import.meta.client ? (window.location.origin) : '');
  const walletProvider = new StarProvider();
  const address = useState<string | null>('mmc:address', () => null);

  const useWalletEvent = useState(() => true);

  async function connectWallet() {
    await walletProvider.connect();
  }

  async function disconnectWallet() {
    await walletProvider.disconnect();
  }

  onMounted(() => {
    nextTick(() => {
      if (useWalletEvent.value) {
        useWalletEvent.value = false;
        walletProvider.onAccountsChanged((info) => {
          address.value = info.active || null;
        });
      }
    });
  });

  return {

    config: mmcNetworkConfigs,
    provider: walletProvider,
    address,
    rpcApi,

    connectWallet,
    disconnectWallet,
  };
}
