import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bgin-bg': { primary: '#0a0a0f', secondary: '#12121a', tertiary: '#1a1a28' },
        'wg-ikp': '#7c6bff',
        'wg-fase': '#4ecdc4',
        'wg-cyber': '#ff6b6b',
        'wg-governance': '#ffd93d',
      },
    },
  },
  plugins: [],
};
export default config;
