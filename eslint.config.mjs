import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';


export default defineConfig([
  { files: ['**/*.{js,mjs,cjs}'] },
  { files: ['**/*.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs' } },
  { files: ['**/*.{js,mjs,cjs}'], languageOptions: { globals: globals.browser } },
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'warn',
      'eol-last': ['error', 'always'],
      semi: ['error', 'always'],
      'space-infix-ops': 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      'max-len': ['error', { code: 150, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreComments: true }],
    },
  },
]);
