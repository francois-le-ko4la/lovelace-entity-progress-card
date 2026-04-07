import globals from 'globals';
import js from '@eslint/js';
import compat from 'eslint-plugin-compat';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  // Configuration de base recommandée
  js.configs.recommended,

  // Configuration pour les fichiers JS/MJS/CJS
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      compat,
      sonarjs,
    },
    settings: {
      browsers: ['Chrome >= 98', 'Edge >= 98', 'Firefox >= 94', 'Safari >= 15.4', 'Opera >= 84'],
    },
    rules: {
      'compat/compat': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-redundant-boolean': 'warn',
      'sonarjs/no-useless-catch': 'warn',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'warn',
      'eol-last': ['error', 'always'],
      'space-infix-ops': 'error',
      'class-methods-use-this': ['error', {
        exceptMethods: ['connectedCallback', 'disconnectedCallback', 'setConfig'],
        enforceForClassFields: true,
      }],
    },
  },

  // Configuration spécifique pour les fichiers CommonJS
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
];
