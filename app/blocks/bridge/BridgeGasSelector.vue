<script setup lang="ts">
import { ethers } from 'ethers';

const { rpcApi, address } = useMMCWallet();
const { payGasType, estimatedGas, fromChain, toChain, fromToken } = useBridgeRemote();

const { data: userAsset, status: userAssetStatus } = useAsyncData('mmc:user-asset', () => {
  if (!address.value) return Promise.resolve(null);
  return rpcApi.getAddressAssets(address.value);
}, {
  watch: [address],
  server: false,
});

const options = computed(() => {
  return userAsset.value?.map((item) => {
    return {
      label: item.symbol,
      icon: item.icon,
      value: item.assetType,
    };
  }) ?? [];
});

watch(userAsset, () => {
  const useGas = userAsset.value?.find(item => Number(item.balance) > 0);
  if (useGas) {
    payGasType.value = useGas.assetType;
  }
});

const { data, status } = useAsyncData('bridge:mmc-gas', () => {
  return estimatedGas();
}, {
  server: false,
  watch: [payGasType, fromChain, toChain, fromToken],
});

const formatGas = computed(() => {
  const selected = userAsset.value?.find(item => item.assetType === payGasType.value);

  return formatAmount(ethers.utils.formatUnits(data.value || '0', selected?.decimals));
});
</script>

<template>
  <div
    v-if="userAssetStatus === 'success' && options.length > 0 && fromChain && toChain && fromToken"
    class="w-full py-3"
  >
    <div class="w-full flex justify-between items-center gap-3 ">
      <div class=" text-sm font-normal">
        <span>Estimated Gas</span>
      </div>

      <div class="grow flex justify-end gap-2">
        <div class=" flex items-center">
          <span
            v-if="status === 'success' && data"
            class="w-full h-full flex items-center justify-between gap-0.5 cursor-pointer bg-[#1C1C1C] rounded-md p-1"
          >
            {{ formatGas }}
          </span>
          <span
            v-else
            class="w-[100px] h-full"
          >
            <USkeleton class="w-full h-full" />
          </span>
        </div>
        <USelect
          v-model:model-value="payGasType"
          :items="options"
          :ui="{ base: 'w-full max-w-[200px]' }"
        />
      </div>
    </div>
  </div>
</template>
