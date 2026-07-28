import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import jestPlugin from 'eslint-plugin-jest'

export default [
  { ignores: ['allure-results/', 'allure-report/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
    rules: {
      complexity: ['error', 2],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['tests/**/*.ts'],
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'jest/expect-expect': 'off',
    },
  },
]
