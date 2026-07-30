// Device-local persistence.
//
// Everything lives in localStorage on her phone: no account to create, no login
// before a set, works offline in a gym basement, and no personal data leaves
// the device. The trade-off is real and stated in the UI — no cross-device
// sync, and clearing browser data loses history, which is what Export is for.
//
// Every read and write goes through this one module, so a sync backend can be
// added later without touching a single component.

import type { CardioTest, LoggedExercise, Profile, SessionLog, TrainState } from './types';

const KEY = 'baseline.v1';
const VERSION = 1;

export const EMPTY: TrainState = { version: VERSION, profile: null, logs: [], tests: [] };

// Some browsers refuse localStorage entirely — private mode, blocked cookies, a
// sandboxed frame. Rather than silently dropping every set she logs, fall back
// to memory so the session still works, and say so in Settings.
let memory: string | null = null;
let storageBlocked = false;

function ls(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = window.localStorage;
    const probe = '__baseline_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    storageBlocked = true;
    return null;
  }
}

/** True when history lives only in memory and will not survive a reload. */
export function isEphemeral(): boolean {
  if (typeof window === 'undefined') return false;
  ls();
  return storageBlocked;
}

export function load(): TrainState {
  const store = ls();
  try {
    const raw = store ? store.getItem(KEY) : memory;
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as TrainState;
    if (typeof parsed?.version !== 'number') return EMPTY;
    return {
      version: parsed.version,
      profile: parsed.profile ?? null,
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      tests: Array.isArray(parsed.tests) ? parsed.tests : [],
    };
  } catch {
    // A corrupt blob must never brick the app mid-session.
    return EMPTY;
  }
}

export function save(state: TrainState): void {
  if (typeof window === 'undefined') return;
  const json = JSON.stringify(state);
  memory = json;
  const store = ls();
  if (!store) return;
  try {
    store.setItem(KEY, json);
  } catch {
    // Quota exceeded mid-session. The in-memory copy above still holds, so the
    // session survives; throwing here would lose it.
    storageBlocked = true;
  }
}

export function saveProfile(profile: Profile): TrainState {
  const s = load();
  const next = { ...s, profile };
  save(next);
  return next;
}

export function appendLog(log: SessionLog): TrainState {
  const s = load();
  const next = { ...s, logs: [...s.logs, log] };
  save(next);
  return next;
}

export function appendTest(test: CardioTest): TrainState {
  const s = load();
  const next = { ...s, tests: [...s.tests, test] };
  save(next);
  return next;
}

/** Previous sessions for one exercise, most recent first. Feeds the progression engine. */
export function historyFor(state: TrainState, exerciseId: string): LoggedExercise[] {
  return [...state.logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .flatMap((l) => l.exercises.filter((e) => e.exerciseId === exerciseId));
}

export function exportJson(state: TrainState): string {
  return JSON.stringify(state, null, 2);
}

export function importJson(text: string): TrainState | null {
  try {
    const parsed = JSON.parse(text) as TrainState;
    if (typeof parsed?.version !== 'number' || !Array.isArray(parsed?.logs)) return null;
    const next: TrainState = {
      version: VERSION,
      profile: parsed.profile ?? null,
      logs: parsed.logs,
      tests: Array.isArray(parsed.tests) ? parsed.tests : [],
    };
    save(next);
    return next;
  } catch {
    return null;
  }
}

export function clearAll(): TrainState {
  memory = null;
  const store = ls();
  if (store) {
    try {
      store.removeItem(KEY);
    } catch {
      // Nothing to do — the in-memory copy is already gone.
    }
  }
  return EMPTY;
}

/** Local date as YYYY-MM-DD. Training days are local days, never UTC. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
