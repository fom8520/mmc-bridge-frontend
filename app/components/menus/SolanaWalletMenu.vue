<script lang="ts" setup>
import { toast } from 'vue-sonner';
import { useSolanaWallet } from '~/composables/useSolanaWallet';
import type { SolanaWalletController } from '~/utils/solana-wallets';

const emits = defineEmits<{
  (e: 'finish', val: 'connect' | 'disconnect'): void;
}>();

const { wallets, connectWallet, disconnectWallet, connectedWallet, address }
  = useSolanaWallet();

const connectingId = ref<string>();
const onConnect = async (wallet: SolanaWalletController) => {
  if (connectingId.value) {
    return;
  }
  try {
    connectingId.value = wallet.name;
    await connectWallet(wallet.name);
    emits('finish', 'connect');
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
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
      toast.error(err.message);
    }
  }
};

const onCopy = async () => {
  try {
    await copyText(address.value ?? '');
  } catch {
    toast.error('Copy error');
  }
};
</script>

<template>
  <div class="w-full flex flex-col space-y-2">
    <div
      v-for="wallet in wallets"
      :key="wallet.label"
      class="cursor-pointer rounded-lg select-none border border-primary-800 p-2.5"
      :class="{ ' bg-primary-800/20': connectedWallet?.name === wallet.name }"
    >
      <div
        class="w-full flex flex-col items-center relative"
        @click.stop="onConnect(wallet)"
      >
        <!-- <div
          class="w-2 h-2 rounded-full mr-1"
          :class="{
            'bg-green-600': connectedWallet?.id === wallet.id,
            'bg-gray-400': connectedWallet?.id !== wallet.id,
          }"
        /> -->

        <UAvatar
          :src="wallet.icon"
          :alt="wallet.label"
          size="md"
          :ui="{ root: 'rounded-md' }"
        />

        <div
          class="grow pt-1.5 flex flex-col justify-center text-base leading-5 font-normal text-center"
        >
          <span class=" text-md font-normal text-primary">{{ wallet.label }}</span>
          <div
            v-if="wallet.name === connectedWallet?.name && address"
            class="w-full text-xs font-normal flex pt-2.5"
          >
            <div>{{ shortAddress(address) }}</div>
            <div
              class="ml-1 flex items-center"
              @click.stop="onCopy"
            >
              <UIcon
                name="mdi:content-copy"
                :size="12"
              />
            </div>

            <div
              class="flex items-center justify-center ml-3"
              @click.stop="onDisconnect"
            >
              <UIcon
                class="w-4 h-4"
                name="i-mdi-logout"
              />
            </div>
          </div>
          <div
            v-else
            class=" text-xs leading-4 text-secondary-400 "
          >
            <span>{{ `Connect a ${wallet.label} compatible wallet` }}</span>
          </div>
        </div>
        <div
          v-if="wallet.name === connectingId && connectingId"
          class=" absolute w-full h-full flex items-center justify-center backdrop-blur-lg "
        >
          <UIcon
            class="w-6 h-6"
            name="svg-spinners:90-ring-with-bg"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
