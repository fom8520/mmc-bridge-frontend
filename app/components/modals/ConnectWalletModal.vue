<script setup lang="ts">
defineProps<{
  type: 'MMC' | 'Solana';
}>();
</script>

<template>
  <BasicModal>
    <template #content>
      <div class="w-full px-3">
        <template v-if="type === 'Solana'">
          <SolanaWalletMenu />
        </template>
        <template v-else-if="type === 'MMC'">
          <MMCWalletMenu />
        </template>
      </div>
    </template>
  </BasicModal>
</template>
