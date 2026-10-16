import globals from 'globals';
import js from '@eslint/js';
import compat from 'eslint-plugin-compat';
import sonarjs from 'eslint-plugin-sonarjs';
import importX, { createNodeResolver } from 'eslint-plugin-import-x';
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
  'max-params': ['warn', 5],
  'sonarjs/no-selector-parameter': 'warn',
  'sonarjs/no-duplicated-branches': 'warn',
  'sonarjs/no-all-duplicated-branches': 'warn',
  'sonarjs/no-identical-conditions': 'warn',
  'sonarjs/no-element-overwrite': 'warn',
  'sonarjs/no-redundant-assignments': 'warn',
  'sonarjs/max-lines-per-function': ['warn', { maximum: 80 }],
  'sonarjs/no-commented-code': 'warn',
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
  // DeepSource JS-W1042, caught before the push rather than after it: at any
  // argument position, where eslint-plugin-unicorn only sees the last one.
  'no-restricted-syntax': [
    'error',
    {
      selector: ':matches(CallExpression, NewExpression) > Identifier.arguments[name="undefined"]',
      message: 'No literal undefined as an argument (JS-W1042): omit it, or read the absent value off an object.',
    },
  ],
  // console.log is banned (the usual accidental-debug-leftover offender);
  // everything else here has a deliberate, structured use (Logger,
  // EPB_DIAG, the startup banner, warnings/errors) - see one inline
  // eslint-disable for the banner's single console.log call.
  'no-console': ['error', { allow: ['debug', 'info', 'warn', 'error', 'groupCollapsed', 'groupEnd'] }],
  'import-x/no-cycle': 'error',
  'class-methods-use-this': ['error', {
    exceptMethods: ['connectedCallback', 'disconnectedCallback', 'setConfig', '_validate', '_settle'],
    enforceForClassFields: true,
  }],
};

// Folder -> the folders above it, which it must not import. Bottom-up:
// utils < values < config < color < history < view < dom < core < elements.
const CARD_ABOVE = {
  config: ['color', 'history', 'view', 'dom', 'core', 'elements', 'diagnostics'],
  values: ['config', 'color', 'history', 'view', 'dom', 'core', 'elements', 'diagnostics'],
  color: ['history', 'view', 'dom', 'core', 'elements', 'diagnostics'],
  history: ['view', 'dom', 'core', 'elements', 'diagnostics'],
  view: ['dom', 'core', 'elements', 'diagnostics'],
  dom: ['core', 'elements', 'diagnostics'],
  core: ['elements', 'diagnostics'],
  diagnostics: ['elements'],
};
const LAYER_ZONES = [
  { target: ['./src/utils/!(types).*', './src/utils/styles'], from: ['./src/card', './src/editor'] },
  ...Object.entries(CARD_ABOVE).flatMap(([folder, above]) => [
    { target: `./src/card/${folder}`, from: above.map((name) => `./src/card/${name}`) },
  ]),
  { target: './src/card', from: './src/editor' },
];

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

  // Layer rule (docs/development.md#object-architecture): a folder never
  // imports from one above it. utils/types.ts is exempt: it derives Config
  // from the schema.
  {
    files: ['src/**/*.ts'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [
        createNodeResolver({ extensions: ['.ts', '.js'], extensionAlias: { '.js': ['.ts', '.js'] } }),
      ],
    },
    rules: {
      'import-x/no-restricted-paths': ['error', { zones: LAYER_ZONES }],
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
