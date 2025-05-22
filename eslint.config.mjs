import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

// Import the necessary plugins and parser
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

const cfg = tseslint.config(
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/method-signature-style': [1, 'property'],
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-explicit-any': 1, // TODO remove one day
      '@typescript-eslint/no-use-before-define': 0,
      'array-callback-return': 1,
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
      'no-new-object': 1,
      'no-new-wrappers': 1,
      'no-param-reassign': 1,
      'no-return-assign': 1,
      'no-unneeded-ternary': 1,
      'no-unused-expressions': 1,
      'object-shorthand': [1, 'always'],
      'padding-line-between-statements': [
        1,
        // {
        //   blankLine: 'always',
        //   next: '*',
        //   prev: '*',
        // },
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
      'prefer-arrow-callback': 'warn',
      'prefer-spread': 'warn',
      // 'no-console': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react/function-component-definition': 'warn',
      'react/jsx-boolean-value': 'warn',
      'react/jsx-curly-brace-presence': 'warn',
      'react/jsx-fragments': 'warn',
      'react/jsx-handler-names': 'warn',
      'react/jsx-no-constructed-context-values': 'warn',
      'react/jsx-no-useless-fragment': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': [
        1,
        {
          component: true,
          html: true,
        },
      ],
      '@typescript-eslint/no-require-imports': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
);

export default cfg;
