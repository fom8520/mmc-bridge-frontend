import { useStorage } from '@vueuse/core';
import { SolanaWalletController } from '~/utils/solana-wallets';

let isInit = false;

export function useSolanaWallet() {
  const wallets = import.meta.client ? SolanaWalletController.wallets() : [];

  const connectedWalletId = useStorage<string>(
    'connect-solana-wallet',
    null,
  );

  const automaticallyConnected = useState(
    'solana:automaticallyConnected',
    () => false,
  );
  const address = useState<null | string>('solana:address', () => null);
  const connectedWallet = useState<null | SolanaWalletController>(
    'solana:wallet',
    () => null,
  );

  async function connectWallet(name: string) {
    if (connectedWalletId.value === name && address.value) {
      return;
    } else if (address.value) {
      await disconnectWallet();
    }

    const wallet = wallets.find(item => item.name === name)!;

    wallet.onChangeAccounts((pubkey) => {
      address.value = pubkey.toBase58();
    });
    wallet.onDisconnect(() => {
      disconnectWallet();
    });

    try {
      await wallet.connect();
      connectedWalletId.value = name;
      connectedWallet.value = wallet;
    } catch (err) {
      wallet.off('connect');
      wallet.off('disconnect');
      throw err;
    }
  }

  async function disconnectWallet() {
    connectedWalletId.value = null;
    await connectedWallet.value?.disconnect();
    address.value = null;
    connectedWallet.value = null;
  }

  onMounted(() => {
    if (import.meta.client && !isInit) {
      if (connectedWalletId.value && !automaticallyConnected.value) {
        connectWallet(connectedWalletId.value);
        isInit = true;
      }
    }
  });

  return {
    wallets,
    address,
    connectedWallet,

    connectWallet,
    disconnectWallet,
  };
}
