import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import tencentEslintConfig from 'eslint-config-tencent/flat';

export default tseslint.config([
  globalIgnores(['dist']),
  ...tencentEslintConfig({
    tsconfigRootDir: process.cwd(), // eslint-disable-line no-undef
    project: './tsconfig.app.json',
  }),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  reactHooks.configs.flat.recommended,
]);
