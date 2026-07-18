import globals from 'globals';
import js from '@eslint/js';
import compat from 'eslint-plugin-compat';
import sonarjs from 'eslint-plugin-sonarjs';
import importX from 'eslint-plugin-import-x';

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
      'import-x': importX,
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
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'max-len': ['warn', {
        code: 120,
        comments: 80,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }],
      'eol-last': ['error', 'always'],
      'space-infix-ops': 'error',
      'lines-between-class-members': ['error', 'always'],
      eqeqeq: ['error', 'smart'],
      // console.log is banned (the usual accidental-debug-leftover offender);
      // everything else here has a deliberate, structured use (Logger,
      // EPB_DIAG, the startup banner, warnings/errors) - see one inline
      // eslint-disable for the banner's single console.log call.
      'no-console': ['error', { allow: ['debug', 'info', 'warn', 'error', 'groupCollapsed', 'groupEnd'] }],
      'import-x/no-cycle': 'error',
      'class-methods-use-this': ['error', {
        exceptMethods: ['connectedCallback', 'disconnectedCallback', 'setConfig', '_validate'],
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

  // Node build scripts (not browser runtime code).
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
];
