module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'unused-imports'],
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'unused-imports/no-unused-imports': 'error',
    'comma-dangle': ['error', 'only-multiline'],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: '@nestjs/**',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['nestjs'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'no-else-return': ['error', { allowElseIf: false }],
    'no-useless-return': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
        memberSyntaxSortOrder: ['all', 'single', 'multiple', 'none'],
        allowSeparatedGroups: true,
      },
    ],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'never', prev: 'if', next: 'if' },
      {
        blankLine: 'always',
        prev: '*',
        next: ['block-like', 'const', 'export', 'let', 'return', 'throw'],
      },
      { blankLine: 'always', prev: ['block-like', 'const', 'let'], next: '*' },
      { blankLine: 'never', prev: 'const', next: 'const' },
      { blankLine: 'never', prev: 'let', next: 'let' },
      {
        blankLine: 'always',
        prev: ['multiline-const', 'multiline-let'],
        next: '*',
      },
    ],
    yoda: 'error',
    'sonarjs/no-duplicate-string': ['error', 5],
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['.'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
