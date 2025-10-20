<script lang="ts" setup>
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
  <ClientOnly>
    <Teleport to="body">
      <Toaster
        :position="'bottom-right'"
        rich-colors
      />
    </Teleport>
  </ClientOnly>
</template>
