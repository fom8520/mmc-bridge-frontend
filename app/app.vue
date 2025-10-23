<script lang="ts" setup>
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';

const { isHydrating } = useNuxtApp();
</script>

<template>
  <UApp v-show="isHydrating">
    <NuxtLoadingIndicator color="#00ffff" />
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
  <ClientOnly>
    <Teleport to="body">
      <Suspense>
        <div
          v-if="!isHydrating"
          class="w-screen h-screen flex items-center justify-center fixed top-0 bottom-0"
        >
          <UIcon
            name="i-tdesign-loading"
            class=" animate-spin w-6 h-6"
          />
        </div>
      </Suspense>
    </Teleport>
  </ClientOnly>
</template>
