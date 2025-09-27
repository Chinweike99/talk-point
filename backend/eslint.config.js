// import js from '@eslint/js';
// import tseslint from '@typescript-eslint/eslint-plugin';
// import tsparser from '@typescript-eslint/parser';
// import globals from 'globals';

// export default [
//   js.configs.recommended,
//   {
//     files: ['**/*.ts', '**/*.tsx'],
//     languageOptions: {
//       parser: tsparser,
//       parserOptions: {
//         ecmaVersion: 'latest',
//         sourceType: 'module',
//       },
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//       },
//     },
//     plugins: {
//       '@typescript-eslint': tseslint,
//     },
//     rules: {
//       '@typescript-eslint/no-unused-vars': 'error',
//       '@typescript-eslint/no-explicit-any': 'off',
//       'no-unused-vars': 'off',
//       'no-case-declarations': 'off',
//     },
//   },
//   {
//     // Configuration for ES module .js files (config files that use import/export)
//     files: ['eslint.config.js', 'jest.config.js'],
//     languageOptions: {
//       sourceType: 'module',
//       globals: {
//         ...globals.node,
//       },
//     },
//   },
//   {
//     // Configuration for other CommonJS .js files
//     files: ['**/*.js'],
//     ignores: ['eslint.config.js', 'jest.config.js'],
//     languageOptions: {
//       sourceType: 'commonjs',
//       globals: {
//         ...globals.node,
//       },
//     },
//   },
//   {
//     // Ignore compiled JavaScript files
//     ignores: ['dist/**/*', 'node_modules/**/*'],
//   },
// ];