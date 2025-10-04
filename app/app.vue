<script lang="ts" setup>
import type { ToasterProps } from '@nuxt/ui';

const toaster: ToasterProps = { position: 'bottom-right' };
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
