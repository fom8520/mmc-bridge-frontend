// https://nuxt.com/docs/api/configuration/nuxt-config
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineNuxtConfig({
  devServer: {
    port: 3185,
    host: '0.0.0.0',
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  plugins: [],
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
  nitro: {
    compressPublicAssets: false,
  },
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      if (isClient) {
        config.plugins = config.plugins || [];
        config.plugins.push(nodePolyfills({ globals: { Buffer: true } }));
      }
    },
  },
  ui: {
    colorMode: true,
  },
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
  image: { densities: [1, 2] },
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
});
