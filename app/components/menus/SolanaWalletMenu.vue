<script lang="ts" setup>
import { useSolanaWallet } from '~/composables/useSolanaWallet';
import type {
  SolanaWalletController,
  SolanaWalletType,
} from '~/utils/solana-wallets';

const emits = defineEmits<{
  (e: 'finish', val: 'connect' | 'disconnect'): void;
}>();

const { wallets, connectWallet, disconnectWallet, connectedWallet, address }
  = useSolanaWallet();

const connectingId = ref<SolanaWalletType>();
const onConnect = async (wallet: SolanaWalletController) => {
  try {
    connectingId.value = wallet.id;
    await connectWallet(wallet.id);
    emits('finish', 'connect');
  } catch (err) {
    if (err instanceof Error) {
      useToast().add({ description: err.message });
    }
  } finally {
    connectingId.value = undefined;
  }
};

const onDisconnect = async () => {
  try {
    await disconnectWallet();
    emits('finish', 'disconnect');
  } catch (err) {
    if (err instanceof Error) {
      useToast().add({ description: err.message });
    }
  }
};

const onCopy = async () => {
  try {
    await copyText(address.value ?? '');
  } catch {
    useToast().add({ description: 'Copy error' });
  }
};
</script>

<template>
  <div class="w-full flex flex-col space-y-2">
    <div
      v-for="wallet in wallets"
      :key="wallet.label"
    >
      <div
        class="w-full h-[46px] flex items-center border px-2 cursor-pointer rounded-lg relative select-none"
        @click.stop="onConnect(wallet)"
      >
        <div
          class="w-2 h-2 rounded-full mr-1"
          :class="{
            'bg-green-600': connectedWallet?.id === wallet.id,
            'bg-gray-400': connectedWallet?.id !== wallet.id,
          }"
        />

        <UAvatar
          :src="wallet.icon"
          :alt="wallet.label"
          size="xs"
          :ui="{ root: 'rounded-md' }"
        />

        <div
          class="grow flex flex-col justify-center text-base leading-5 font-medium pl-3"
        >
          <span>{{ wallet.label }}</span>
          <div
            v-if="wallet.id === connectedWallet?.id && address"
            class="w-full text-xs font-normal flex"
          >
            <div>{{ shortAddress(address) }}</div>
            <div
              class="ml-1"
              @click.stop="onCopy"
            >
              <UIcon
                name="mdi:content-copy"
                :size="12"
              />
            </div>
          </div>
        </div>
        <div
          v-if="wallet.id === connectingId && connectingId"
          class="flex items-center justify-center"
        >
          <UIcon
            class="w-6 h-6"
            name="svg-spinners:90-ring-with-bg"
          />
        </div>
        <div
          v-if="wallet.id === connectedWallet?.id && address"
          class="flex items-center justify-center"
          @click.stop="onDisconnect"
        >
          <UIcon
            class="w-5 h-5"
            name="i-mdi-logout"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
