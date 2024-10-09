const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: false,
  },
  plugins: ['react', 'react-hooks', 'prettier', '@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    // 'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    project: path.resolve(__dirname, '../tsconfig.json'),
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
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    // '@typescript-eslint/explicit-function-return-type': 1,
    // '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/method-signature-style': [1, 'property'],
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-explicit-any': 0, // TODO remove one day
    '@typescript-eslint/no-use-before-define': 0,
    'array-callback-return': 1,
    // 'consistent-return': 1, // NOTE many useEffect hooks are inconsistent
    curly: [1, 'all'],
    eqeqeq: [1, 'allow-null'],
    'no-else-return': 1,
    'no-implicit-coercion': [
      1,
      {
        boolean: false,
        disallowTemplateShorthand: true,
      },
    ],
    'no-lonely-if': 1,
    // 'no-negated-condition': 1,
    'no-new-object': 1,
    'no-new-wrappers': 1,
    'no-param-reassign': 1,
    'no-return-assign': 1,
    'no-unneeded-ternary': 1,
    'no-unused-expressions': 1,
    'object-shorthand': [1, 'always'],
    'padding-line-between-statements': [
      1,
      {
        blankLine: 'always',
        next: '*',
        prev: '*',
      },
      {
        blankLine: 'any',
        next: '*',
        prev: 'import',
      },
      {
        blankLine: 'any',
        next: '*',
        prev: 'export',
      },
    ],
    'prefer-arrow-callback': 1,
    'prefer-spread': 1,
    'react-hooks/exhaustive-deps': 1,
    'react-hooks/rules-of-hooks': 1,
    'react/function-component-definition': 1,
    'react/jsx-boolean-value': 1,
    'react/jsx-curly-brace-presence': 1,
    'react/jsx-fragments': 1,
    'react/jsx-handler-names': 1,
    'react/jsx-no-constructed-context-values': 1,
    'react/jsx-no-useless-fragment': 1,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'react/self-closing-comp': [
      1,
      {
        component: true,
        html: true,
      },
    ],
    '@typescript-eslint/no-require-imports': 0,
  },
};
