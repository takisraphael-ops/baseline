'use client';

// React bindings for the stores.
//
// Separate from store.ts on purpose: scripts/fixture-run.ts imports that module
// under plain node, and pulling React into it would break the fixture run —
// which is the one gate that has caught the progression engine failing silently.
//
// What this replaces: `useEffect(() => setState(load()), [])` on every screen,
// plus a manual `setState(load())` after each write to keep it in step. That
// pattern renders once with nothing and again with the data, and it goes stale
// the moment somebody adds a write and forgets the re-read. Subscribing means
// the store pushes instead, so there is no second call to forget.

import { useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, subscribe } from './store';
import { readTheme, subscribeTheme } from './theme';
import type { ThemeChoice } from './theme';
import type { TrainState } from './types';

/**
 * The stored training state, or null before it is known.
 *
 * Null only ever appears during server render and hydration — see
 * getServerSnapshot. The single-file build mounts with createRoot and no
 * hydration, so it goes straight to real data on the first render.
 */
export function useTrainState(): TrainState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The saved theme choice, kept in step across tabs. */
export function useThemeChoice(): ThemeChoice | null {
  return useSyncExternalStore(subscribeTheme, readTheme, () => null);
}

// Nothing to subscribe to: the answer changes exactly once, when React swaps
// from the hydration render to a client one, and the hook re-reads then.
const noopSubscribe = () => () => {};

/**
 * False during server render and hydration, true afterwards.
 *
 * For anything that cannot exist until there is a DOM — a portal target, most
 * obviously. Replaces `useEffect(() => setMounted(true), [])`.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
