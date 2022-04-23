module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'pro',
  ],
  rules: {
    // 'no-extra-semi': 'error',
    // semi: ['error', 'never', {beforeStatementContinuationChars: 'always'}],
    // 'semi-spacing': [
    //   'warn',
    //   {
    //     before: false,
    //     after : true,
    //   },
    // ],
    // 'semi-style': ['error', 'first'],
    // 'linebreak-style': ["error", "unix"],
    //
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/explicit-module-boundary-types': 'off',
    // '@typescript-eslint/no-unsafe-assignment': 'off',
    // '@typescript-eslint/no-unsafe-call': 'off',
    // '@typescript-eslint/no-inferrable-types': 'off',
    // '@typescript-eslint/no-unsafe-return': 'off',
    // '@typescript-eslint/no-unsafe-member-access': 'off',
    // '@typescript-eslint/restrict-template-expressions': 'off',
    // '@typescript-eslint/ban-ts-comment': 'off',
    // '@typescript-eslint/no-floating-promises': 'off',
    // '@typescript-eslint/restrict-plus-operands': 'off',
    // '@typescript-eslint/no-empty-interface': 'off',
    // '@typescript-eslint/no-unused-vars': 'off',
    // '@typescript-eslint/await-thenable': 'off',
    // '@typescript-eslint/no-unsafe-argument': 'off',
    // 'no-constant-condition': 'off',
    'func-names': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-empty-function': 'off',
    'no-process-exit': 'off',
    'no-await-in-loop': 'off',
    'array-element-newline': 'off',
    'multiline-ternary': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: process.cwd(),
    project: ['./tsconfig.json'],
    extraFileExtensions: ['.svelte']
  },
  env: {
    es6: true
  },
  settings: {

  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['node_modules']
}
