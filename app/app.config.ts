import { displayName, description } from '../package.json';

export const walletConfig = {
  projectId: '9d43f1ed793686bae2241e23f5294746',
  metadata: {
    name: displayName,
    description: description,
    url: 'https://example.com',
    icons: ['https://exmaple.com/icon.png'],
  },
};

export default defineAppConfig({
  wallet: {
    // Get projectId at https://cloud.walletconnect.com
    projectId: walletConfig.projectId,
  },
  metadata: walletConfig.metadata,
  app: {
    head: {
      title: displayName,
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width,initial-scale=1.0,user-scalable=no,minimum-scale=1,maximum-scale=1',
        },
        {
          name: 'apple-mobile-web-app-capable',
          content: 'yes',
        },
        {
          name: 'apple-mobile-web-app-title',
          content: displayName,
        },
        {
          hid: 'description',
          name: 'description',
          content: description,
        },
        {
          name: 'format-detection',
          content: 'telephone=no',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          href: '/favicon.ico',
        },
      ],
    },
  },
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'neutral',
    },
    icons: { loading: 'i-tdesign-loading' },
    input: {
      slots: {
        root: 'relative inline-flex items-center bg-secondary-800',
        base: [
          'w-full !text-white rounded-[4px] border-0 placeholder:font-normal placeholder:text-[#8C8C8C] focus:outline-none disabled:cursor-not-allowed disabled:opacity-75',
          'transition-colors',
          ' !ring-primary-800',
          ' !bg-[#232323]',
        ],
        leading: 'absolute inset-y-0 start-0 flex items-center !ps-2',
        leadingIcon: 'shrink-0 text-dimmed ',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailing: 'absolute inset-y-0 end-0 flex items-center !p-1',
        trailingIcon: 'shrink-0 text-dimmed',
      },
    },
    avatar: { slots: { root: 'bg-white/20' } },
    formField: {
      slots: {
        label: ' text-elevated text-xs font-normal',
        container: 'mt-2',
        hint: ' text-xs leading-4 text-elevated',
        error: 'text-xs font-normal mt-1',
      },
    },
    button: {
      slots: {
        base: [
          'cursor-pointer rounded-md font-normal inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75',
          'transition-colors font-sans',
        ],
        label: 'truncate text-xs',
        leadingIcon: 'shrink-0',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailingIcon: 'shrink-0',
      },

      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'text-white bg-primary-700 hover:bg-primary-700/75 active:bg-primary-700/75 disabled:bg-primary-700 aria-disabled:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700',
        },
        {
          color: 'primary',
          variant: 'outline',
          class: 'ring ring-inset ring-primary/50 text-primary hover:bg-primary/10 active:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        },
        {
          color: 'primary',
          variant: 'soft',
          class: 'text-primary bg-primary/10 hover:bg-primary/15 active:bg-primary/15 focus:outline-none focus-visible:bg-primary/15 disabled:bg-primary/10 aria-disabled:bg-primary/10',
        },
        {
          color: 'primary',
          variant: 'subtle',
          class: 'text-primary ring ring-inset ring-primary/25 bg-primary/10 hover:bg-primary/15 active:bg-primary/15 disabled:bg-primary/10 aria-disabled:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        },
        {
          color: 'primary',
          variant: 'ghost',
          class: 'text-primary hover:bg-primary/10 active:bg-primary/10 focus:outline-none focus-visible:bg-primary/10 disabled:bg-transparent aria-disabled:bg-transparent dark:disabled:bg-transparent dark:aria-disabled:bg-transparent',
        },
        {
          color: 'primary',
          variant: 'link',
          class: 'text-primary hover:text-primary/75 active:text-primary/75 disabled:text-primary aria-disabled:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'text-inverted bg-inverted hover:bg-inverted/90 active:bg-inverted/90 disabled:bg-inverted aria-disabled:bg-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted',
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'ring ring-inset ring-accented text-default bg-default hover:bg-elevated active:bg-elevated disabled:bg-default aria-disabled:bg-default focus:outline-none focus-visible:ring-2 focus-visible:ring-inverted',
        },
        {
          color: 'neutral',
          variant: 'soft',
          class: 'text-default bg-elevated hover:bg-accented/75 active:bg-accented/75 focus:outline-none focus-visible:bg-accented/75 disabled:bg-elevated aria-disabled:bg-elevated',
        },
        {
          color: 'neutral',
          variant: 'subtle',
          class: 'ring ring-inset ring-accented text-default bg-elevated hover:bg-accented/75 active:bg-accented/75 disabled:bg-elevated aria-disabled:bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-inverted',
        },
        {
          color: 'neutral',
          variant: 'ghost',
          class: 'text-default hover:bg-elevated active:bg-elevated focus:outline-none focus-visible:bg-elevated hover:disabled:bg-transparent dark:hover:disabled:bg-transparent hover:aria-disabled:bg-transparent dark:hover:aria-disabled:bg-transparent',
        },
        {
          color: 'neutral',
          variant: 'link',
          class: 'text-muted hover:text-default active:text-default disabled:text-muted aria-disabled:text-muted focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-inverted',
        },
      ],
    },
    select: {
      slots: {
        base: [
          'relative group rounded-md inline-flex items-center focus:outline-none disabled:cursor-not-allowed disabled:opacity-75',
          'transition-colors',
        ],
        leading: 'absolute inset-y-0 start-0 flex items-center',
        leadingIcon: 'shrink-0 text-dimmed',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailing: 'absolute inset-y-0 end-0 flex items-center',
        trailingIcon: 'shrink-0 text-dimmed',
        value: 'truncate pointer-events-none',
        placeholder: 'truncate text-dimmed',
        arrow: 'fill-default',
        content: 'max-h-60 w-(--reka-select-trigger-width) bg-secondary-800 shadow-lg rounded-md ring ring-primary-800 overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-select-content-transform-origin) pointer-events-auto flex flex-col',
        viewport: 'relative divide-y divide-default scroll-py-1 overflow-y-auto flex-1',
        group: 'p-1 isolate',
        empty: 'text-center text-muted',
        label: 'font-semibold text-highlighted',
        separator: '-mx-1 my-1 h-px bg-border',
        item: [
          'group relative w-full flex items-start select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75 text-default data-highlighted:not-data-disabled:text-white data-highlighted:not-data-disabled:before:bg-primary-800/50 cursor-pointer',
          'transition-colors before:transition-colors',
        ],
        itemLeadingIcon: [
          'shrink-0 text-dimmed group-data-highlighted:not-group-data-disabled:text-default',
          'transition-colors',
        ],
        itemLeadingAvatar: 'shrink-0',
        itemLeadingAvatarSize: '',
        itemLeadingChip: 'shrink-0',
        itemLeadingChipSize: '',
        itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
        itemTrailingIcon: 'shrink-0',
        itemWrapper: 'flex-1 flex flex-col min-w-0',
        itemLabel: 'truncate',
        itemDescription: 'truncate text-muted',
      },
      variants: {
        fieldGroup: {
          horizontal: 'not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]',
          vertical: 'not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]',
        },
        variant: {
          outline: 'text-white bg-secondary-800 ring ring-inset ring-primary-800',
          soft: 'text-highlighted bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50',
          subtle: 'text-highlighted bg-elevated ring ring-inset ring-accented',
          ghost: 'text-highlighted bg-transparent hover:bg-elevated focus:bg-elevated disabled:bg-transparent dark:disabled:bg-transparent',
          none: 'text-highlighted bg-transparent',
        },
        type: { file: 'file:me-1.5 file:font-medium file:text-muted file:outline-none' },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: [
            'outline',
            'subtle',
          ],
          class: 'focus:ring-1 focus:ring-inset focus:ring-primary-800',
        },
        {
          color: 'primary',
          highlight: true,
          class: 'ring ring-inset ring-primary',
        },
        {
          color: 'neutral',
          variant: [
            'outline',
            'subtle',
          ],
          class: 'focus:ring-2 focus:ring-inset focus:ring-inverted',
        },
        {
          color: 'neutral',
          highlight: true,
          class: 'ring ring-inset ring-inverted',
        },
      ],
    },
  },
});
