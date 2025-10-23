<script setup lang="ts">
import { toast } from 'vue-sonner';

const { address, walletInfo, disconnect, modal } = useEvmWallet();

const wallets = computed(() => {
  return [
    {
      label: walletInfo.value.label || 'Wallet Connect',
      icon: walletInfo.value.icon || '/wallet/wallet.svg',
    },
  ];
});

const onCopy = async () => {
  try {
    await copyText(address.value ?? '');
  } catch {
    toast.error('Copy error');
  }
};

const connecting = ref(false);
async function onConnect() {
  try {
    connecting.value = true;
    await modal.open();
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    }
  } finally {
    connecting.value = false;
  }
}
</script>

<template>
  <div class="w-full flex flex-col space-y-2">
    <div
      v-for="wallet in wallets"
      :key="wallet.label"
      class="cursor-pointer rounded-lg select-none border border-primary-800 p-2.5"
      :class="{ ' bg-primary-800/20': !!address }"
    >
      <div
        class="w-full flex flex-col items-center relative"
        @click.stop="onConnect"
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
          :ui="{ root: cn('rounded-md', wallet.icon ? ' bg-transparent' : ''), image: 'rounded-none' }"
        />

        <div
          class="grow pt-1.5 flex flex-col justify-center text-base leading-5 font-normal text-center"
        >
          <span class=" text-md font-normal text-primary">{{ wallet.label }}</span>
          <div
            v-if="address"
            class="w-full text-xs font-normal flex pt-2.5"
          >
            <div>{{ shortAddress(address || '') }}</div>
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
              @click.stop="() => disconnect({ })"
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
          v-if="connecting"
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
