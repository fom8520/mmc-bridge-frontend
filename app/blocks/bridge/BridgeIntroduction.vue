<script setup lang="ts">
const introductionList = [
  {
    id: '1',
    title: 'Bridge USDC with zero slippage',
    content: 'Move between Solana, Base, Arbitrum, Optimism, Ethereum, Unichain, and more.',
    path: '',
  },
];
</script>

<template>
  <div class="w-full ">
    <UCard
      v-for="item in introductionList"
      :key="item.id"
      :ui="{
        root: ' ring-primary/30 ring-1 divide-primary/30 rounded-md',
        header: ' !p-1.5 text-sm font-normal leading-5 bg-primary/10',
        body: ' text-xs leading-4 !p-1.5 bg-secondary-950/80',
      }"
    >
      <template #header>
        <div class="w-full text-primary flex justify-between items-center">
          <span>{{ item.title }}</span>
          <span class="flex cursor-pointer">
            <UIcon
              name="carbon:close-outline"
              class="w-4 h-4"
            />
          </span>
        </div>
      </template>

      <template #default>
        <div class="w-full flex justify-between space-x-5">
          <div class=" grow text-xs font-normal leading-4">
            <span>{{ item.content }}</span>
          </div>
          <div>
            <UButton
              color="neutral"
              :ui="{ base: ' bg-white/10 rounded-[7px] cursor-pointer' }"
            >
              <UIcon name="i-custom-share" />
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
