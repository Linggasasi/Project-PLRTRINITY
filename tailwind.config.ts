import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(16,185,129,.10), 0 12px 40px rgba(0,0,0,.35)',
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at 1px 1px, rgba(148,163,184,.10) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;
