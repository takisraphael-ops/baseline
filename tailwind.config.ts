import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Keep this in step with the config `demo/build.mjs` writes for the
      // single-file build (see the `twConfig` template there). The two are
      // separate files, so anything added here that the demo config lacks will
      // work in `next dev` and silently not exist in the artifact the client
      // opens. A palette that only one of them knows about is the trap.
      fontFamily: { sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};

export default config;
