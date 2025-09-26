<script lang="ts" setup>
import type { InputSlots } from '@nuxt/ui';
import type { CSSProperties, HTMLAttributes } from 'vue';
import { cn } from '~/utils/helpers';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    max?: number;
    min?: number;
    placeholder?: string;
    type?: 'text' | 'password' | 'number';
    minHeight?: string;
    style?: CSSProperties;
    radius?: string;
    onlyRead?: boolean;
    cleanable?: boolean;
    disabled?: boolean;
    precision?: number; // only type = number available
    inputClass?: HTMLAttributes['class'];
  }>(),
  { cleanable: true },
);

defineSlots<InputSlots>();

const showPassword = ref(false);
const inputRef = ref<{ inputRef?: HTMLInputElement } | null>();

const emit = defineEmits<{
  (e: 'change', value?: string | number): void;
  (e: 'update:model-value', value?: string | number): void;
  (e: 'enter'): void;
  (e: 'clean'): void;
}>();
const textValue = ref<string | number | undefined>();

const inputValue = computed({
  set: (val: string | number | undefined) => {
    textValue.value = val;
    emit('update:model-value', val ?? undefined);
  },
  get: () => props.modelValue ?? textValue.value,
});

const inputType = computed(() => {
  if (props.type === 'password') {
    if (showPassword.value) {
      return 'text';
    } else {
      return 'password';
    }
  }
  return props.type ?? 'text';
});

const onChange = (payload: any) => {
  let val = payload.target.value;
  if (
    val !== ''
    && val !== undefined
    && props.type === 'number'
  ) {
    if (props.min !== undefined && Number(val) < props.min) {
      val = props.min.toString();
    } else if (props.max !== undefined && Number(val) > props.max) {
      val = props.max.toString();
    }
  }

  inputValue.value = val;

  inputRef.value!.inputRef!.setAttribute('value', val);
  emit('change', val ?? undefined);
};

const onInput = (payload: any) => {
  let val = payload.target.value;

  const reg = new RegExp(/^-?\d+(\.\d+)?$/i);

  if (props.type === 'number' && !reg.test(val)) {
    val = val.replace(/[^\d.]/g, '');
    payload.target.value = val;
  }

  if (props.precision !== undefined && val.includes('.')) {
    if ((val.split('.')[1] ?? '').length > 0) {
      const s1 = val.split('.')[0];
      const s2 = val.split('.')[1];
      if (s2) {
        if (props.precision === 0) {
          val = s1;
        } else {
          val = `${s1}.${s2.substring(0, props.precision)}`;
        }
      }
      payload.target.value = val;
    } else if (props.precision === 0) {
      val = val.split('.')[0];
      payload.target.value = val;
    }
  }
  inputValue.value = val;
};

const onBlur = () => {
  if (props.type === 'number' && inputValue.value) {
    const val = inputValue.value;
    inputValue.value = val;
  }
};
// const onVisibility = () => {
//   showPassword.value = !showPassword.value
// }

const onEnter = (ev: KeyboardEvent) => {
  if (ev.key === 'Enter') {
    inputRef.value?.inputRef?.blur();
    emit('enter');
  }
};

onMounted(() => {
  nextTick(() => {
    inputRef.value?.inputRef?.blur();
  });
});
</script>

<template>
  <UInput
    ref="inputRef"
    :style="style"
    :type="inputType === 'number' ? 'text' : inputType"
    :model-value="inputValue"
    :maxlength="type !== 'number' ? max : undefined"
    :placeholder="placeholder ?? 'Input'"
    :readonly="onlyRead"
    :min="min"
    :ui="{
      root: 'bg-white/10 backdrop-blur-md ',
      base: cn('border-none bg-transparent text-xs leading-tight text-primary', inputClass),
    }"
    :disabled="disabled"
    @input="onInput"
    @change="onChange"
    @keypress="onEnter"
    @blur="onBlur"
  >
    <template
      v-for="(_slot, name) in $slots"
      #[name]="slotProps"
    >
      <slot
        :name="name"
        v-bind="slotProps || {}"
      />
    </template>
  </UInput>
</template>

<style scoped lang="scss"></style>
