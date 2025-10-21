<script setup lang="ts">
import type { BridgeChain } from '~/utils/bridge-configs';
import { cn } from '~/utils/helpers';

const props = defineProps<{
  chains: BridgeChain[];
  selected?: BridgeChain;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'select', value: BridgeChain): void;
}>();

const availableChains = ref(props.chains);
const searchStr = ref('');

function onSelect(c: BridgeChain) {
  if (c.id !== props.selected?.id) {
    emits('select', c);
  }
  emits('close');
}

function routesCount(c: BridgeChain) {
  return c.tokens.reduce((sum, item) => {
    return sum + Object.keys(item.contract).length;
  }, 0);
}

function onSearch() {
  console.log(searchStr.value);

  if (searchStr.value) {
    availableChains.value = props.chains.filter((item) => {
      return item.label.includes(searchStr.value) || item.id === Number(searchStr.value);
    });
  } else {
    availableChains.value = props.chains;
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
            placeholder="Chain name or id"
            :ui="{ base: ['!bg-secondary-700'] }"
            @keyup.enter="onSearch"
          />
        </div>
        <div class="w-full">
          <div
            v-if="availableChains.length > 0"
            class="w-full"
          >
            <div
              v-for="item in availableChains"
              :key="item.id"
              class="px-4 py-2 cursor-pointer transition-all hover:bg-primary-700/25"
              :class="{ 'bg-primary-700/10': item.id === selected?.id }"
              @click="onSelect(item)"
            >
              <div class="w-full flex items-center gap-3">
                <div class="grow flex items-center gap-3 overflow-hidden">
                  <UAvatar
                    :key=" item.icon"
                    :src="item.icon"
                    :size="'2xs'"
                    :ui="{ image: 'object-contain rounded-none', root: cn('p-0.5', item.icon ? ' bg-transparent' : '') }"
                  />

                  <div class=" flex flex-col font-normal leading-4 overflow-hidden">
                    <span class="text-xs text-primary truncate">{{ item.label }}</span>
                    <span class="text-[10px] text-secondary-400 truncate">{{ item.network }}</span>
                  </div>
                </div>

                <div class="flex flex-col  leading-4 font-normal text-nowrap">
                  <span class=" text-xs text-white">{{ `${routesCount(item)} routes` }}</span>
                  <span class=" text-[10px] text-secondary-400">{{ 'Routes from Ethereum' }}</span>
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
