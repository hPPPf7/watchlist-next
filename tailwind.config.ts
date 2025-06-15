import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-day-picker/dist/**/*.js',
  ],
  safelist: [
    'w-8',
    'h-8',
    'p-0',
    'text-sm',
    'text-[0.8rem]',
    'font-normal',
    'rounded',
    'rounded-md',
    'rounded-full',
    'bg-primary',
    'text-primary-foreground',
    'bg-accent',
    'text-accent-foreground',
    'text-muted-foreground',
    'opacity-50',
    'hover:opacity-100',
    'flex',
    'justify-center',
    'items-center',
    'space-x-1',
    'space-y-4',
    'space-y-0',
    'absolute',
    'left-1',
    'right-1',
    'mt-2',
    'mx-auto',
    'invisible',
    // 🔥 關鍵補充
    'row', // <-- 日期列的 row
    'head_row', // <-- 星期列的 row
    'cell', // <-- 每個日期格子
    'head_cell', // <-- 星期格子
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
    },
  },

  plugins: [tailwindcssAnimate],
};

export default config;
