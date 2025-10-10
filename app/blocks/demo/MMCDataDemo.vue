<script setup lang="ts">
import { ethers } from 'ethers';

const { address, rpcApi } = useMMCWallet();

const { data: userAsset, status: userAssetStatus } = useAsyncData('mmc:user-asset', () => {
  if (!address.value) return Promise.resolve(null);
  return rpcApi.getAddressAssets(address.value);
}, {
  watch: [address],
  server: false,
});
</script>

<template>
  <div v-if="address">
    <div
      v-if="userAssetStatus === 'pending'"
      class="flex items-center justify-center"
    >
      <UIcon
        class="w-5 h-5"
        name="svg-spinners:90-ring-with-bg"
      />
    </div>
    <div class="w-full">
      <div
        v-for="item in (userAsset || [])"
        :key="item.assetType"
      >
        <span>{{ item.name }}: </span>
        <span>{{ ethers.utils.formatUnits(item.balance, item.decimals) }}</span>
      </div>
    </div>
  </div>
</template>
