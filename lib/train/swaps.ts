// Alternatives for when the machine is taken.
//
// A busy gym is the most common way a planned session falls apart, and the
// usual outcomes are both bad: stand around waiting, or skip the exercise and
// quietly lose the volume. Offering a substitute that trains the same thing
// keeps the session intact.
//
// Ranking puts shared muscles well above shared movement pattern, because
// "isolation" covers everything from a leg extension to a triceps pushdown —
// pattern alone would happily offer her the wrong limb. Different equipment
// gets a nudge: if the machine is occupied, another machine of the same kind is
// often occupied too, and a dumbbell or cable version is usually free.

import { EXERCISES, getExercise } from './exercises';
import type { Exercise } from './types';

export interface Alternative {
  exercise: Exercise;
  /** Why it is a fair swap, in her words. */
  reason: string;
}

function score(a: Exercise, b: Exercise): number {
  let n = 0;
  for (const m of b.primary) if (a.primary.includes(m)) n += 4;
  for (const m of b.secondary) if (a.primary.includes(m)) n += 1;
  for (const m of b.primary) if (a.secondary.includes(m)) n += 1;
  if (a.pattern === b.pattern) n += 2;
  if (a.equipment !== b.equipment) n += 1;
  return n;
}

const EQUIPMENT_PHRASE: Record<string, string> = {
  machine: 'another machine',
  cable: 'on the cables',
  dumbbell: 'with dumbbells',
  barbell: 'with a barbell',
  bodyweight: 'no equipment needed',
};

function reasonFor(original: Exercise, alt: Exercise): string {
  const shared = alt.primary.filter((m) => original.primary.includes(m));
  if (shared.length > 0 && alt.equipment !== original.equipment) {
    return `Same target, ${EQUIPMENT_PHRASE[alt.equipment]}.`;
  }
  if (shared.length > 0) return 'Trains the same muscle.';
  if (alt.pattern === original.pattern) return 'Same movement, different setup.';
  return 'Closest available match.';
}

/**
 * Best substitutes for an exercise, strongest match first.
 *
 * @param excludeIds exercises already in today's session, so she is not offered
 *                   something she is about to do anyway
 */
export function alternativesFor(exerciseId: string, excludeIds: string[] = [], limit = 4): Alternative[] {
  const original = getExercise(exerciseId);
  const skip = new Set([exerciseId, ...excludeIds]);

  return EXERCISES
    .filter((e) => !skip.has(e.id))
    .map((e) => ({ e, s: score(original, e) }))
    // A shared primary muscle is the floor. Below that it is not a swap, it is
    // a different exercise, and offering it would be worse than offering none.
    .filter((x) => x.s >= 4)
    .sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name))
    .slice(0, limit)
    .map((x) => ({ exercise: x.e, reason: reasonFor(original, x.e) }));
}
