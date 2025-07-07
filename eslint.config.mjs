import globals from 'globals';
import js from '@eslint/js';
import compat from 'eslint-plugin-compat';

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
    },
    settings: {
      browsers: ['Chrome >= 98', 'Edge >= 98', 'Firefox >= 94', 'Safari >= 15.4', 'Opera >= 84'],
    },
    rules: {
      'compat/compat': 'warn',
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'warn',
      'eol-last': ['error', 'always'],
      semi: ['error', 'always'],
      'space-infix-ops': 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      'max-len': [
        'error',
        {
          code: 150,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],
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
