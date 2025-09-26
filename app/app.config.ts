import { displayName, description } from '../package.json';

export const walletConfig = {
  projectId: '07556f4c9346cbd23fa53dde19889e99',
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
        root: 'relative inline-flex items-center bg-transparent',
        base: [
          'w-full rounded-[2px] border-0 placeholder:text-base placeholder:leading-tight placeholder:text-primary/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-75',
          'transition-colors',
          'h-[45px] !ring-primary',
          ' !bg-transparent',
        ],
        leading: 'absolute inset-y-0 start-0 flex items-center',
        leadingIcon: 'shrink-0 text-dimmed',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailing: 'absolute inset-y-0 end-0 flex items-center',
        trailingIcon: 'shrink-0 text-dimmed',
      },
    },
  },
});
