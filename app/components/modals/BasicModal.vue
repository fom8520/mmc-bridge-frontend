<script setup lang="ts">
import type { ModalProps } from '@nuxt/ui';
import { cn } from '~/utils';
import type { HTMLAttributes } from 'vue';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    title?: string;
    showClose?: boolean;
    showTitle?: boolean;
    dismissible?: boolean;
    fullscreen?: boolean;
    contentClass?: HTMLAttributes['class'];
    ui?: ModalProps['ui'];
    type?: 0 | 1;
  }>(),
  {
    showTitle: false,
    showClose: false,
    title: '',
    dismissible: true,
    fullscreen: false,
    type: 0,
  },
);

const emits = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'close'): void;
}>();

const isOpen = ref(props.open ?? false);

const _isOpen = computed({
  get() {
    if (props.open === undefined) {
      return isOpen.value;
    }
    return props.open;
  },
  set(val) {
    isOpen.value = val;
    emits('update:open', val);
  },
});

defineExpose({
  open: () => {
    _isOpen.value = true;
  },
  close: () => {
    _isOpen.value = false;
  },
});

const tem = useTemplateRef('baseModal');

onMounted(async () => {
  await nextTick();

  tem.value?.querySelectorAll('input').forEach((el) => {
    el.blur();
  });
});
</script>

<template>
  <UModal
    v-model:open="_isOpen"
    :dismissible="dismissible"
    :ui="Object.assign({
      overlay: 'z-30 bg-black/60',
      content: cn(
        'w-full max-w-[320px] z-40 !ring-0 bg-transparent pb-40',
        fullscreen ? 'w-full !h-screen !max-h-screen !bg-secondary-900' : '',
      ),
    }, ui)"
  >
    <span @click="_isOpen = !_isOpen">
      <slot />
    </span>
    <template #title>
      <span class="hidden" />
    </template>
    <template #description>
      <span class="hidden" />
    </template>

    <template #content="{ close }">
      <div
        ref="baseModal"
        class="w-full lg:h-auto h-full relative flex flex-col rounded-md bg-secondary-900 backdrop-blur-sm "
      >
        <div class=" absolute top-0 left-0 w-full h-full -z-0">
          <!-- <img
            src="~/assets/images/modal-bg.svg"
            class="h-full w-full object-fill"
            :class="{ 'block ': type === 0, ' md:!block hidden': type !== 0 }"
          >
          <img
            src="~/assets/images/modal-bg-1.svg"
            class=" w-full object-fill"
            :class="{ 'lg:hidden block': type === 1 }"
          > -->
        </div>
        <div
          v-if="showClose"
          class=" absolute md:top-1 md:right-1 top-1.5 right-1.5 z-30"
        >
          <span
            class="cursor-pointer transition-all hover:bg-gray-500/10  flex items-center justify-center"
            @click="close"
          >
            <UIcon
              name="i-icon-close"
              class="w-5 h-5 opacity-80"
            />
          </span>
        </div>

        <div
          v-if="!fullscreen"
          class="w-full lg:h-auto h-full py-[18px] z-10"
        >
          <div
            v-if="showTitle && title"
            class="pb-3 px-5"
          >
            <p class=" text-base font-bold">
              <slot name="title">
                <span>{{ title }}</span>
              </slot>
            </p>
          </div>
          <div :class="cn('w-full max-h-[70vh]  overflow-y-auto  ', contentClass)">
            <slot name="content" />
          </div>
        </div>

        <div
          v-else
          :class="cn('overflow-y-auto z-10', contentClass)"
        >
          <slot name="content" />
        </div>
      </div>
    </template>
  </UModal>
</template>
