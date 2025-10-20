<script setup lang="ts">
import type { BridgeChain } from '~/utils/bridge-configs';

const props = defineProps<{
  tokens: BridgeChain['tokens'];
  selected?: BridgeChain['tokens'][number] | null;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'select', value: BridgeChain['tokens'][number]): void;
}>();

const availableTokens = ref(props.tokens);
const searchStr = ref('');

function onSelect(c: BridgeChain['tokens'][number]) {
  if (c.address !== props.selected?.address) {
    emits('select', c);
  }
  emits('close');
}

// function routesCount(c: BridgeChain) {
//   return c.tokens.reduce((sum, item) => {
//     return sum + Object.keys(item.contract).length;
//   }, 0);
// }

function onSearch() {
  if (searchStr.value) {
    availableTokens.value = props.tokens.filter((item) => {
      return item.name.includes(searchStr.value) || item.address === searchStr.value || item.symbol.includes(searchStr.value);
    });
  } else {
    availableTokens.value = props.tokens;
  }
}

watchDebounced(searchStr, () => {
  onSearch();
}, { debounce: 1000 });
</script>

<template>
  <BasicModal>
    <template #content>
      <div class="w-full pb-10">
        <div class="w-full px-3 pb-3 sticky top-0 backdrop-blur-sm">
          <UInput
            v-model:model-value="searchStr"
            class="w-full"
            leading-icon="iconamoon:search"
            placeholder="Token name，symbol or address"
            :ui="{ base: ['!bg-secondary-700'] }"
            @keyup.enter="onSearch"
          />
        </div>
        <div class="w-full">
          <div
            v-if="availableTokens.length > 0"
            class="w-full"
          >
            <div
              v-for="item in availableTokens"
              :key="item.address"
              class="px-4 py-2 cursor-pointer transition-all hover:bg-primary-700/25"
              :class="{ 'bg-primary-700/10': item.address === selected?.address }"
              @click="onSelect(item)"
            >
              <div class="w-full flex items-center gap-3">
                <div class="grow flex items-center gap-3 overflow-hidden">
                  <UAvatar
                    :key=" item.icon"
                    :src="item.icon"
                    :size="'2xs'"
                    :ui="{ image: ' object-contain', root: cn('p-0.5', item.icon ? ' bg-transparent' : '') }"
                  />

                  <div class=" flex flex-col font-normal leading-4 overflow-hidden">
                    <span class="text-xs text-primary truncate">{{ item.symbol }}</span>
                    <span class="text-[10px] text-secondary-400 truncate">{{ item.chain }}</span>
                  </div>
                </div>

                <div class="flex flex-col  leading-4 font-normal text-nowrap">
                  <!-- <span class=" text-xs text-white">{{ `${routesCount(item)} routes` }}</span>
                  <span class=" text-[10px] text-secondary-400">{{ 'Routes from Ethereum' }}</span> -->
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="w-full flex justify-center items-center h-20"
          >
            <span class=" text-secondary-400">No Data</span>
          </div>
        </div>
      </div>
    </template>
  </BasicModal>
</template>
