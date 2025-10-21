<script setup lang="ts">
import { shortAddress } from '~/utils/helpers';

withDefaults(defineProps<{
  size?: 'normal' | 'large';
}>(), { size: 'normal' });

const { fromChain } = useBridgeRemote();
const { address: mmcAddress, provider } = useMMCWallet();
const { address: solanaAddress, connectedWallet: solanaConnectedWallet } = useSolanaWallet();
const { address: evmAddress, walletInfo: evmWalletInfo } = useEvmWallet();

const connectedWallet = computed(() => {
  const _chain = fromChain.value;

  if (_chain) {
    if (_chain.type === 'Solana') {
      return solanaAddress.value
        ? {
            address: solanaAddress.value,
            icon: solanaConnectedWallet.value?.icon,
          }
        : null;
    } else if (_chain.type === 'MMC') {
      return mmcAddress.value
        ? {
            address: mmcAddress.value,
            icon: provider.icon,
          }
        : null;
    } else if (_chain.type === 'EVM') {
      return evmAddress.value
        ? {
            address: evmAddress.value,
            icon: evmWalletInfo.value?.icon,
          }
        : null;
    }
  }

  return false;
});

function connectWallet() {
  const _chain = fromChain.value;
  const _type = _chain?.type || 'MMC';
  useModals().open('ConnectWalletModal', { props: { type: _type as any } });

  // if (_type === 'EVM') {
  //   evmModal.open();
  // } else {
  //   useModals().open('ConnectWalletModal', { props: { type: _type as any } });
  // }
}
</script>

<template>
  <PrimaryButton
    :size="size"
    @click="connectWallet"
  >
    <div
      class="flex items-center justify-center gap-1 "
      :class="{ 'text-xs font-normal': size === 'normal', 'text-sm font-normal': size === 'large' }"
    >
      <span
        v-if="!connectedWallet"
        class="flex"
      >
        <UIcon
          name="i-custom-wallet"
          class="w-4 h-4"
        />
      </span>
      <span v-else>
        <UAvatar
          :key="connectedWallet.icon"
          :src="connectedWallet.icon"
          :size="size === 'normal' ? '3xs' : 'xs'"
          :ui="{
            image: 'object-contain rounded-none',
            root: cn('p-0.5', connectedWallet?.icon ? ' bg-transparent' : '') }"
        />
      </span>
      <span v-if="!connectedWallet">Connect wallet</span>
      <span v-else>{{ shortAddress(connectedWallet.address, size ==='normal' ? 4 : 6) }}</span>
    </div>
  </PrimaryButton>
</template>
