// Flat config, which is what ESLint 9 reads and what replaced .eslintrc.json.
//
// `next lint` no longer exists in Next 16 — it was removed rather than
// deprecated, and it fails by interpreting "lint" as a directory name, which
// looks nothing like a missing command. The lint script now calls eslint
// directly, so the rules live here instead of behind Next's wrapper.
//
// eslint-config-next ships CommonJS with an interop default, so the array has
// to be unwrapped before it can be spread.

import nextConfig from 'eslint-config-next/core-web-vitals';

const next = nextConfig.default ?? nextConfig;

const config = [
  {
    // `next lint` scoped itself to the app automatically. Running eslint
    // directly does not, and linting build output is both slow and meaningless.
    ignores: ['.next/**', 'demo/dist/**', 'node_modules/**', 'out/**'],
  },
  ...next,
];

export default config;
