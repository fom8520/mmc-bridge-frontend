<script setup lang="ts">
defineProps<{
  type: 'MMC' | 'Solana' | 'EVM';
}>();
</script>

<template>
  <BasicModal>
    <template #content>
      <div class="w-full px-3 space-y-2">
        <div class="w-full space-y-1.5">
          <p class="text-xs font-medium">
            {{ 'MMC Wallet' }}
          </p>
          <MMCWalletMenu />
        </div>

        <div class="w-full space-y-1.5">
          <p class="text-xs font-medium">
            {{ 'EVM Wallets' }}
          </p>
          <EvmWalletMenu />
        </div>

        <div class="w-full space-y-1.5">
          <p class="text-xs font-medium">
            {{ 'Solana Wallets' }}
          </p>
          <SolanaWalletMenu />
        </div>
        <!-- <template v-if="type === 'MMC'">
          <MMCWalletMenu />
        </template>
        <template v-else-if="type === 'EVM'">
          <EvmWalletMenu />
        </template>
        <template v-else-if="type === 'Solana'">
          <SolanaWalletMenu />
        </template> -->
      </div>
    </template>
  </BasicModal>
</template>
