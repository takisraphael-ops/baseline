// How the app addresses the athlete.
//
// This lives here rather than inline in a page because the interesting case is
// the ABSENCE of a name, and that case has been got wrong twice. The profile
// used to be seeded with a hardcoded 'Diva' — one client's name, shipped to a
// public URL — and the fallback for a blank one was the literal string 'you',
// substituted straight into sentences written for a name. That produced
// "Ready when you are, you" and "Nothing logged yet, you."
//
// So: a name is a `string | null`, never a placeholder word, and every line
// that can carry one has a version that reads correctly without it. Fixtures
// assert both forms, because the empty case is the one nobody clicks through.

/**
 * The athlete's name for display, or null when there is not one.
 *
 * Whitespace counts as absent — a name of "   " must not render as a comma
 * followed by nothing.
 */
export function displayName(profile: { name?: string } | null | undefined): string | null {
  const n = profile?.name?.trim();
  return n ? n : null;
}

/**
 * Varies with where she is in the programme, so it never reads like a form
 * letter, and drops the name cleanly when there is not one.
 */
export function greeting(name: string | null, sessionsDone: number): string {
  if (sessionsDone === 0) return name ? `Ready when you are, ${name}` : 'Ready when you are';
  if (sessionsDone === 1) return 'Second one — nice';
  if (sessionsDone < 8) return name ? `Next up, ${name}` : 'Next up';
  return 'Next up';
}

/** Shown once the twelfth week is behind her. */
export function finishedLine(name: string | null): string {
  return name ? `Twelve weeks done, ${name}` : 'Twelve weeks done';
}

/** The empty state on Progress, before anything has been logged. */
export function nothingLoggedLine(name: string | null): string {
  return name ? `Nothing logged yet, ${name}.` : 'Nothing logged yet.';
}
