// Chrome 92 is best effort, not a promised floor - the main config lints
// against the matrix actually supported (Chrome 98+, see
// docs/development.md#browser-compatibility-matrix). This one asks a different
// question: what in src/ would break below it. Run: npm run check:chrome92
//
// Limitations, so a green run is not read as proof: eslint-plugin-compat sees
// globals and static methods (Object.hasOwn, structuredClone) reliably, and
// prototype methods on an untyped receiver (arr.findLast) not at all. It reads
// source, not the bundle. Treat a finding as real and a pass as encouraging.

import compat from 'eslint-plugin-compat';
import sonarjs from 'eslint-plugin-sonarjs';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

// The two modules allowed to call a post-Chrome-92 API: each does it behind
// IN_SUPPORTED_MATRIX, with a fallback for older engines (has.own, deepClone).
// Anywhere else is a call site that should have gone through them - which is
// how a schema default built at load time took every card down on a kiosk
// panel, months after the API itself had quietly slipped in.
const GUARDED = ['src/utils/common-checks.ts', 'src/utils/browser-support.ts'];

export default [
  {
    files: ['src/**/*.js', 'src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
    },
    // sonarjs is registered but silent: src/ carries eslint-disable comments
    // naming its rules, and an unknown rule name in a disable comment is an
    // error of its own.
    plugins: { compat, sonarjs },
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    settings: { browsers: ['Chrome >= 92'] },
    rules: { 'compat/compat': 'error' },
  },
  {
    files: GUARDED,
    rules: { 'compat/compat': 'off' },
  },
];
