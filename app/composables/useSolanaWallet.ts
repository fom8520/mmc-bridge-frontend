import { useStorage } from '@vueuse/core';
import { SolanaWalletController } from '~/utils/solana-wallets';
import type { SolanaWalletType } from '~/utils/solana-wallets';

let isInit = false;

export function useSolanaWallet() {
  const wallets = SolanaWalletController.wallets;

  const connectedWalletId = useStorage<SolanaWalletType>(
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

  async function connectWallet(id: SolanaWalletType) {
    if (connectedWalletId.value === id && address.value) {
      return;
    } else if (address.value) {
      await disconnectWallet();
    }

    const wallet = wallets.find(item => item.id === id)!;

    wallet.onChangeAccounts((pubkey) => {
      address.value = pubkey.toBase58();
    });
    wallet.onDisconnect(() => {
      disconnectWallet();
    });

    try {
      await wallet.connect();
      connectedWalletId.value = id;
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
