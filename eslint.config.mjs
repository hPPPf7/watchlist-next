// eslint.config.mjs

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import jsxA11y from 'eslint-plugin-jsx-a11y'; // 🆕 a11y 檢查
import tailwindcss from 'eslint-plugin-tailwindcss'; // 🆕 Tailwind 檢查
import typescriptEslint from '@typescript-eslint/eslint-plugin'; // 🆕 TypeScript 規則
import unusedImports from 'eslint-plugin-unused-imports'; // 🆕 自動清理未使用 import

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // ✅ 新增 ignore 路徑
    ignores: ['node_modules', '.next', 'dist'],
  },
  ...compat.extends(
    'next/core-web-vitals', // Next.js 官方建議
    'next/typescript', // TypeScript 設定
  ),
  {
    plugins: {
      'jsx-a11y': jsxA11y,
      tailwindcss: tailwindcss,
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...tailwindcss.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'tailwindcss/no-custom-classname': 'off',

      // ✅ 自動清除未使用的 import / 變數
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];

export default eslintConfig;
