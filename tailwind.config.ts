import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--color-on-surface)',
            'h1, h2, h3, h4, strong': { color: 'var(--color-on-surface)' },
            'p, li': { color: 'var(--color-on-surface)' },
            a: {
              color: 'var(--color-primary)',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            blockquote: {
              borderLeftColor: 'var(--color-primary)',
              color: 'var(--color-on-surface-variant)',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
