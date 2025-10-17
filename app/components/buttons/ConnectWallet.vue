<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'normal' | 'large';
}>(), { size: 'normal' });
</script>

<template>
  <ClientOnly>
    <PrimaryButton :size="size">
      <div class="flex items-center justify-center space-x-1">
        <span class="flex">
          <UIcon
            name="i-custom-wallet"
            class="w-4 h-4"
          />
        </span>
        <span>Connect wallet</span>
      </div>
    </PrimaryButton>
  </ClientOnly>
</template>
