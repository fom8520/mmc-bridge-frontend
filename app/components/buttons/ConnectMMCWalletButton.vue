<script setup lang="ts">
const { address, connectWallet, disconnectWallet } = useMMCWallet();

const loading = ref(false);

async function connect() {
  if (address.value) {
    return;
  }
  try {
    loading.value = true;
    await connectWallet();
  } catch (err) {
    if (err instanceof Error) {
      useToaster().error(err.message);
    }
  } finally {
    loading.value = false;
  }
}

async function onDisconnect() {
  try {
    loading.value = true;
    await disconnectWallet();
  } catch (err) {
    if (err instanceof Error) {
      useToaster().error(err.message);
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UButton @click="connect">
    <div class="flex items-center gap-2">
      <span v-if="address">{{ shortAddress(address) }}</span>
      <span v-else>{{ 'Connect Wallet' }}</span>

      <div
        v-if="loading"
        class="flex items-center justify-center"
      >
        <UIcon
          class="w-5 h-5"
          name="svg-spinners:90-ring-with-bg"
        />
      </div>
      <div
        v-if="address"
        class="flex items-center justify-center cursor-pointer"
        @click.stop="onDisconnect"
      >
        <UIcon
          class="w-5 h-5"
          name="i-mdi-logout"
        />
      </div>
    </div>
  </UButton>
</template>
