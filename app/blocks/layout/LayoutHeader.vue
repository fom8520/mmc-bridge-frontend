<script setup lang="ts">
</script>

<template>
  <div class="w-full pr-4 pt-1.5 flex items-center justify-between">
    <div>
      <img
        src="~/assets/images/MOONMESH-bg.svg"
        class=" h-12"
      >
    </div>

    <div class="">
      <ClientOnly>
        <ConnectWallet />
      </ClientOnly>
    </div>
  </div>
</template>
