import globals from 'globals';
import js from '@eslint/js';
import compat from 'eslint-plugin-compat';
import sonarjs from 'eslint-plugin-sonarjs';
import importX from 'eslint-plugin-import-x';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

// Shared between the JS and TS blocks below so the two don't drift apart -
// only the identifier-resolution rules differ (no-unused-vars/no-undef have
// TypeScript-aware equivalents that understand type-only constructs).
const sharedRules = {
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
  // Fields stay grouped (no forced blank line between two consecutive
  // fields); every method (including get/set pairs for the same
  // property) always gets a blank line before and after.
  'lines-between-class-members': [
    'error',
    {
      enforce: [
        { blankLine: 'always', prev: '*', next: 'method' },
        { blankLine: 'always', prev: 'method', next: '*' },
        { blankLine: 'never', prev: 'field', next: 'field' },
      ],
    },
  ],
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
};

export default [
  // Global ignore (a config object with only `ignores`, no `files`, applies
  // to every block in this array) - dist/ is esbuild's own build output
  // (including the now-unminified dev build), never hand-written source, and
  // was only ever excluded from linting by accident of the npm script's own
  // glob ("src/**/*.{js,ts}"); editors running ESLint on whatever file is
  // open don't respect that glob, so this keeps dist/ out of scope everywhere.
  { ignores: ['dist/**'] },

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
      ...sharedRules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Configuration pour les fichiers TypeScript (src/utils/*.ts) - même
  // règles que le bloc JS ci-dessus, sauf la résolution d'identifiants
  // (déléguée aux équivalents TS-aware, qui comprennent les constructions
  // type-only que les règles JS de base ne connaissent pas).
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      compat,
      sonarjs,
      'import-x': importX,
      '@typescript-eslint': tsPlugin,
    },
    settings: {
      browsers: ['Chrome >= 98', 'Edge >= 98', 'Firefox >= 94', 'Safari >= 15.4', 'Opera >= 84'],
    },
    rules: {
      ...sharedRules,
      // TypeScript itself (tsc, see npm run type-check) already catches
      // undefined-identifier errors, more reliably than no-undef (which
      // doesn't understand type-only constructs like interfaces/generics).
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
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
