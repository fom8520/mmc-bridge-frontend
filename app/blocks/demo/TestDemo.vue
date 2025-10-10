<script setup lang="ts">

</script>

<template>
  <div class="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
    <UCard>
      <template #header>
        <span>Solana Wallet</span>
      </template>
      <SolanaWalletMenu />
    </UCard>
    <UCard>
      <template #header>
        <span>MMC Wallet</span>
      </template>
      <div class=" space-y-3">
        <ConnectMMCWalletButton />

        <MMCDataDemo />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <span>Bridge</span>
      </template>
      <div class=" space-y-3">
        <BridgeDemo />
      </div>
    </UCard>
  </div>
</template>
