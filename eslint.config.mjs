import withNuxt from './.nuxt/eslint.config.mjs';
import prettierConfig from 'eslint-config-prettier';

export default withNuxt({
  // ignores: ['app/types/swagger.ts'],
})
  .prepend()
  .override('nuxt/typescript/rules', {
    rules: {
      ...prettierConfig.rules,
      '@stylistic/max-len': ['off', { code: 80 }],
      'max-len': ['off', { code: 80, ignoreUrls: true, ignoreStrings: false }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      'operator-linebreak': ['off', 'after'],
      '@typescript-eslint/no-empty-object-type': ['off'],
      '@stylistic/arrow-parens': ['off'],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 1,
          multiline: 1,
        },
      ],
      'vue/html-closing-bracket-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'always',
        },
      ],
      'object-curly-newline': ['error', { multiline: true }],
      'object-property-newline': [
        'error',
        { allowMultiplePropertiesPerLine: false },
      ],
      'function-paren-newline': ['error', 'multiline'],
      'comma-dangle': ['error', 'always-multiline'],
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'const', next: 'return' },
      ],
    },
  });
