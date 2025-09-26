import type { OverlayOptions } from '@nuxt/ui/runtime/composables/useOverlay.js';
import type { ComponentEmit, ComponentProps } from 'vue-component-type-helpers';
import { BasicModal } from '#components';

const components = { BasicModal };
type CloseEventArgType<T> = T extends (event: 'close', args_0: infer R) => void
  ? R
  : never;

interface ManagedOverlayOptionsPrivate<T extends Component> {
  component?: T;
  id: symbol;
  isMounted: boolean;
  isOpen: boolean;
  resolvePromise?: (value: any) => void;
}

type OpenedOverlay<T extends Component> = Omit<
  OverlayInstance<T>,
  'open' | 'close' | 'patch' | 'modelValue' | 'resolvePromise'
> & {
  result: Promise<CloseEventArgType<ComponentEmit<T>>>;
};
type OverlayInstance<T extends Component> = Omit<
  ManagedOverlayOptionsPrivate<T>,
  'component'
> & {
  id: symbol;
  open: (props?: ComponentProps<T>) => OpenedOverlay<T>;
  close: (value?: any) => void;
  patch: (props: Partial<ComponentProps<T>>) => void;
};
export function useModals() {
  const overlay = useOverlay();

  function open<
    K extends keyof typeof components,
    T extends (typeof components)[K],
  >(componentName: K, _options?: OverlayOptions<ComponentProps<T>>) {
    const component = components[componentName];
    const modal = overlay.create(component, _options);

    return modal.open();
  }

  const isOpen = (modalId: symbol) => {
    try {
      return overlay.isOpen(modalId);
    } catch {
      return false;
    }
  };

  return {
    open,
    isOpen,
    overlay,
  };
}
