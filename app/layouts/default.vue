<script setup lang="ts"></script>

<template>
  <div class="w-full min-h-screen flex flex-col">
    <NuxtLoadingIndicator color="var(--color-primary)" />
    <div class="w-full max-w-[550px] mx-auto">
      <LayoutHeader />
      <div class="w-full pt-[22px]">
        <slot />
      </div>
    </div>
  </div>
</template>
