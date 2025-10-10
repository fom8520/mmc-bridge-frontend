<script setup lang="ts">
const { transferMmcToSolana, transferSolanaToMmc } = useBridgeRemote();

const confirming = ref('');
async function onBridge(type: 'mmc' | 'sol') {
  try {
    confirming.value = type;
    if (type === 'mmc') {
      await transferMmcToSolana();
    } else {
      await transferSolanaToMmc();
    }
  } catch (err) {
    console.log(err);

    if (err instanceof Error) {
      useToaster().error(err.message);
    }
  } finally {
    confirming.value = '';
  }
}
</script>

<template>
  <div class="w-full flex flex-col space-y-3">
    <UButton
      :loading="confirming === 'mmc'"
      @click="onBridge('mmc')"
    >
      Bridge mmc to solana
    </UButton>

    <UButton
      :loading="confirming === 'sol'"
      @click="onBridge('sol')"
    >
      Bridge solana to mmc
    </UButton>
  </div>
</template>
