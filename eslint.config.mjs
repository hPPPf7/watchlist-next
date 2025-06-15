// eslint.config.mjs

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import jsxA11y from 'eslint-plugin-jsx-a11y'; // 🆕 a11y 檢查
import tailwindcss from 'eslint-plugin-tailwindcss'; // 🆕 Tailwind 檢查
import typescriptEslint from '@typescript-eslint/eslint-plugin'; // 🆕 TypeScript 規則

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals', // Next.js 官方建議
    'next/typescript', // Next.js TypeScript 設定
  ),
  {
    plugins: {
      'jsx-a11y': jsxA11y,
      tailwindcss: tailwindcss,
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules, // a11y 推薦
      ...tailwindcss.configs.recommended.rules, // Tailwind 推薦
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'tailwindcss/no-custom-classname': 'off',
    },
  },
];

export default eslintConfig;
