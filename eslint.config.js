import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';
import tencentEslintConfig from 'eslint-config-tencent/flat';

const GlobalConstants = {
  __API_ENDPOINT__: 'readonly',
  __CDN_URL__: 'readonly',
};

export default tseslint.config([
  globalIgnores(['dist', 'vite.config.ts']),
  ...tencentEslintConfig({
    tsconfigRootDir: process.cwd(), // eslint-disable-line no-undef
    project: './tsconfig.app.json',
  }),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...GlobalConstants,
      },
    },
  },
  reactHooks.configs.flat.recommended,
]);
