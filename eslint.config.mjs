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
  {
    rules: {
      // Off, and it should not stay off forever.
      //
      // Every page loads its state with `useEffect(() => setState(load()), [])`
      // — ten sites. That is not carelessness: the store is localStorage, the
      // server render and the first client render have to agree, and reading
      // storage during render would make them disagree and hydrate wrong. The
      // null-then-load shape is what keeps the first paint honest.
      //
      // The rule is still pointing at something true. The modern answer for an
      // external store is useSyncExternalStore, which would remove the extra
      // render — but it needs a stable snapshot, and lib/train/store.ts returns
      // a fresh object from every load(), so a naive swap loops forever. Doing
      // it properly means caching the snapshot in the store and invalidating on
      // write: a change to the persistence layer every screen depends on, and
      // not something to slip into a dependency bump.
      //
      // Tracked in SPEC.md as a known gap.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
