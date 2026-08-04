// Light / dark, and the third option that most apps forget: follow the phone.
//
// The stylesheet has supported all three since the start — `:root[data-theme]`
// beats the `prefers-color-scheme` block in both directions — but nothing ever
// set the attribute, so there was no way to choose. This is that missing half.
//
// Kept out of store.ts deliberately. The preference has to be read and applied
// before the first paint, from a tiny inline script, and store.ts pulls in the
// whole training state to do it.

export type ThemeChoice = 'system' | 'light' | 'dark';

export const THEME_KEY = 'baseline.theme';

export function isThemeChoice(v: unknown): v is ThemeChoice {
  return v === 'system' || v === 'light' || v === 'dark';
}

export function readTheme(): ThemeChoice {
  try {
    if (typeof window === 'undefined') return 'system';
    const v = window.localStorage.getItem(THEME_KEY);
    return isThemeChoice(v) ? v : 'system';
  } catch {
    // Private mode with storage blocked. Following the phone is the right
    // fallback, and it is what the stylesheet does with no attribute set.
    return 'system';
  }
}

/**
 * Put the choice on `<html>`. 'system' removes the attribute rather than
 * writing a value, so the `prefers-color-scheme` media query takes back over —
 * which also means a phone switching to night mode is picked up live, with no
 * listener to register and nothing to keep in sync.
 */
export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
}

export function saveTheme(choice: ThemeChoice): void {
  try {
    if (choice === 'system') window.localStorage.removeItem(THEME_KEY);
    else window.localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Nothing to do — the choice still applies for this session.
  }
  emitTheme();
}

// ---------------------------------------------------------------- subscription
// The choice is a plain string, so unlike the training state there is nothing to
// cache: a string compares by value, which is all useSyncExternalStore asks for.
const themeListeners = new Set<() => void>();

function emitTheme(): void {
  for (const l of [...themeListeners]) l();
}

function onThemeStorage(e: StorageEvent): void {
  if (e.key !== null && e.key !== THEME_KEY) return;
  // Applied here rather than from a component, because the attribute lives on
  // <html> — outside React's tree entirely. Changing theme in one tab now
  // follows in the others instead of leaving them on the old colours until a
  // reload.
  applyTheme(readTheme());
  emitTheme();
}

export function subscribeTheme(onChange: () => void): () => void {
  themeListeners.add(onChange);
  if (typeof window !== 'undefined' && themeListeners.size === 1) {
    window.addEventListener('storage', onThemeStorage);
  }
  return () => {
    themeListeners.delete(onChange);
    if (typeof window !== 'undefined' && themeListeners.size === 0) {
      window.removeEventListener('storage', onThemeStorage);
    }
  };
}

/**
 * Runs before anything renders, from a <script> in the document head.
 *
 * Without it there is a flash: the page paints with the OS colours, then React
 * hydrates and swaps to her actual choice. On a dark-mode phone that is a white
 * flash in a dim gym, which is exactly the moment it is least welcome.
 *
 * Written as a self-contained string because it is inlined verbatim into both
 * build targets, and because it must not depend on anything the bundle exports.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;
