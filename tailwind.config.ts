import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        bmba: {
          bg: '#F7F7F8',
          fg: '#1D1D1F',
          accent: '#007AFF',
          success: '#34C759',
          warning: '#FF9500',
          danger: '#FF3B30',
          'bg-dark': '#0A0A0A',
          'fg-dark': '#F5F5F7',
        },
      },
      borderRadius: { card: '12px', input: '8px', modal: '24px' },
      transitionTimingFunction: { 'ease-out-bmba': 'cubic-bezier(0,0,0.2,1)' },
      spacing: { '0.5x': '4px', '1x': '8px', '2x': '16px', '3x': '24px', '4x': '32px', '6x': '48px' },
    },
  },
  plugins: [],
};

export default config;
