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
        // Spellweb-aligned backgrounds
        background: '#06060e',
        panel: '#0c0c18',
        'panel-border': '#1a1a30',
        'bgin-bg': {
          primary: '#06060e',
          secondary: '#0c0c18',
          tertiary: '#12121a'
        },
        // Accent
        accent: {
          DEFAULT: '#ffd700',
          dim: 'rgba(255, 215, 0, 0.25)',
        },
        // Text
        text: {
          DEFAULT: '#c8c8d8',
          dim: '#666680',
          bright: '#e8e8f0',
        },
        // Working Group colors (preserved)
        'wg-ikp': '#7c6bff',
        'wg-fase': '#4ecdc4',
        'wg-cyber': '#ff6b6b',
        'wg-governance': '#ffd93d',
        // Domain colors
        swordsman: {
          DEFAULT: '#e94560',
          fill: '#8b1a2b',
        },
        mage: {
          DEFAULT: '#7b68ee',
          fill: '#3b2d7a',
        },
        'first-person': {
          DEFAULT: '#ffd700',
          fill: '#6b5a00',
        },
        shared: {
          DEFAULT: '#00d9ff',
          fill: '#0a4a5c',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 6px currentColor',
        'glow-strong': '0 0 12px currentColor',
      },
    },
  },
  plugins: [],
};
export default config;
