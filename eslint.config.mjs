import babelParser from '@babel/eslint-parser';
import reactHooks from 'eslint-plugin-react-hooks';

// ESLint here reports React Compiler diagnostics only — which components the
// compiler had to skip, and why. Biome owns everything else, including
// exhaustive-deps and rules-of-hooks, so those two stay off.
//
// The parser is Babel's, not typescript-eslint's, because typescript-eslint
// caps at `typescript <6.1.0` and this project builds with 7. Nothing here
// needs type information: the compiler rules re-parse the source with their
// own bundled Babel, so the ESLint parser only has to hand them the text.

function parserOptions(jsx) {
  return {
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
      parserOpts: { plugins: jsx ? ['typescript', 'jsx'] : ['typescript'] },
    },
  };
}

const rules = {
  ...Object.fromEntries(
    Object.keys(reactHooks.rules).map((rule) => [
      `react-hooks/${rule}`,
      'warn',
    ]),
  ),
  'react-hooks/exhaustive-deps': 'off',
  'react-hooks/rules-of-hooks': 'off',
};

export default [
  {
    // Generated: protobuf output and the synced locale files.
    ignores: ['src/features/gallery/model/pictures.ts', '**/*.messages.tsx'],
  },
  {
    plugins: { 'react-hooks': reactHooks },
    rules,
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: babelParser,
      parserOptions: parserOptions(false),
    },
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: parserOptions(true),
    },
  },
];
