<script setup lang="ts"></script>

<template>
  <div class="w-full min-h-screen flex flex-col p-3">
    <NuxtLoadingIndicator color="var(--color-primary)" />
    <div class="w-full grow flex flex-col pt-6 ">
      <slot />
    </div>
  </div>
</template>
