// https://nuxt.com/docs/api/configuration/nuxt-config
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { displayName, description } from './package.json';

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    // '@nuxt/image',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
  ],
  plugins: [],
  ssr: true,
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
    {
      path: '~/blocks',
      pathPrefix: false,
    },
  ],
  imports: { autoImport: true },
  devtools: { enabled: false },
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
          name: 'apple-mobile-web-app-title',
          content: displayName,
        },
        {
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
  css: ['~/assets/css/main.css'],
  ui: { colorMode: false },
  spaLoadingTemplate: './spa-loading-template.html',
  // build: {
  //   transpile: [
  //     (ctx) => {
  //       return ctx.isDev ? false : 'jayson';
  //     },
  //   ],
  // },
  routeRules: {
    '/': { ssr: false },
    '/rpc-api/**': { proxy: 'http://222.128.23.254:23134/**' },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/chain/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  devServer: {
    port: 3185,
    host: '0.0.0.0',
  },
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2025-07-15',
  // nitro: {
  //   compressPublicAssets: false,
  //   devProxy: {
  //     '/rpc-api': {
  //       target: 'http://222.128.23.254:23134',
  //       changeOrigin: true,
  //       // prependPath: false,
  //     },
  //   },
  // },
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      // if (isClient) {
      //   config.plugins = config.plugins || [];
      //   config.plugins.push(nodePolyfills({ globals: { Buffer: true } }));
      // }

      if (isClient) {
        config.plugins = config.plugins || [];
        config.plugins.push(nodePolyfills({
          include: ['buffer'], // ✅ 只 polyfill buffer
          exclude: ['crypto', 'stream', 'path', 'fs', 'util', 'process'],
          globals: { Buffer: true },
        }));
      }
    },
  },
  eslint: {
    config: {
      stylistic: {
        semi: true,
        indent: 2,
        commaDangle: 'always-multiline',
        braceStyle: '1tbs',
        arrowParens: false,
      },
      autoInit: false,
    },
  },
  i18n: {
    langDir: './locales',
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English',
      },
      // {
      //   code: 'zh',
      //   iso: 'zh-CN',
      //   file: 'zh.json',
      //   name: '中文',
      // },
    ],
  },
  // pinia: {
  //   storesDirs: ['./stores/**'],
  // },
  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
  },
});
