<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'normal' | 'large';
  disabled?: boolean;
  loading?: boolean;
}>(), {
  size: 'normal',
  disabled: false,
  loading: false,
});
</script>

<template>
  <button
    class=" relative font-medium cursor-pointer hover:scale-[1.01] transition-all"
    :class="{
      ' text-[10px] py-1.5 px-3.5': size === 'normal',
      ' text-sm py-3.5 px-5': size === 'large',
      ' cursor-no-drop opacity-60': disabled,
    }"
    style=" letter-spacing: 1px;"
  >
    <img
      src="~/assets/images/button-border.svg"
      class=" w-full h-full object-fill absolute top-0 left-0"
    >
    <div class="flex items-center justify-center">
      <span
        v-if="loading"
        class="flex"
      >
        <UIcon
          name="i-tdesign-loading"
          class=" animate-spin"
        />
      </span>
      <span v-else>
        <slot />
      </span>
    </div>
  </button>
</template>
