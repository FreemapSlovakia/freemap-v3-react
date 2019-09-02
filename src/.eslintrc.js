const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: false,
  },
  plugins: ['react', 'react-hooks', 'prettier'],
  extends: [
    // TODO enable one day
    // 'plugin:@typescript-eslint/recommended',
    // 'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/interface-name-prefix': 0,
  },
  globals: {
    L: true,
    __ENV__: true,
  },
};
