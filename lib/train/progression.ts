// The progression engine. Pure functions — this is the part of the app that
// removes "what weight should I use today?" from the athlete entirely.
//
// Double progression: add reps until the top of the range is reached on every
// set, then add load and drop back to the bottom.
//
// The complication that matters for a beginner training on machines: weight
// stacks jump in 5-7 kg steps. On a lateral raise at 7 kg, one plate is a 70%
// increase — the textbook rule is simply unusable. When the next increment
// exceeds INCREMENT_CEILING of the current load, load is held and a different
// lever is pulled instead, with the reason shown rather than hidden.

import type { Exercise, LoggedExercise, LoggedSet, SetTarget } from './types';

/**
 * Above this share of current load, a plate jump is too big to take straight
 * away and a different lever is pulled first.
 *
 * This was 0.10, which was wrong in a way that disabled the whole app. Beginner
 * starting loads are low and gym plates are not: at a 40 kg leg press the only
 * available step is +5 kg, which is 12.5%. Every one of the 19 loaded exercises
 * started above the ceiling, so `add-load` could never fire for any of them —
 * an app whose entire purpose is progressive overload never once prescribed
 * more load. 0.25 clears the ordinary machine steps while still catching the
 * genuinely absurd ones, like +2.5 kg on a 2.5 kg lateral raise.
 */
export const INCREMENT_CEILING = 0.25;

/**
 * At or above this share the plate is close to doubling the weight, which is
 * worse than any alternative — so this stays a hold, and the advice is to go
 * and find smaller steps.
 *
 * Set high deliberately. A hold at the end of the lever list is permanent (the
 * percentage cannot change if the weight never moves), so anything that lands
 * here is parked for good. A 50% step after four sets of fourteen reps is a
 * step she can take; +2.5 kg on a 2.5 kg cable is not.
 */
const ABSURD_JUMP = 0.75;

/** Consecutive non-progressing sessions before a deload is prescribed. */
export const STALL_LIMIT = 2;

/** Consecutive non-progressing sessions before suggesting a variant swap. */
export const SWAP_LIMIT = 3;

export type Lever =
  | 'start'
  | 'add-reps'
  | 'add-load'
  | 'extend-range'
  | 'add-set'
  | 'tempo'
  | 'micro-load'
  | 'swap-variant'
  | 'deload';

export interface Decision {
  kg: number;
  /** Target reps, one entry per set. */
  reps: number[];
  lever: Lever;
  /** Plain-English explanation, shown inline in the session player. */
  reason: string;
  /** Set to a 3-second lowering when the tempo lever is active. */
  eccentricSec?: number;
}

export function topKg(e: LoggedExercise): number {
  return e.sets.reduce((m, s) => Math.max(m, s.kg), 0);
}

export function totalReps(e: LoggedExercise): number {
  return e.sets.reduce((n, s) => n + s.reps, 0);
}

/** Volume load — the tiebreaker when load and reps move in opposite directions. */
export function tonnage(e: LoggedExercise): number {
  return e.sets.reduce((n, s) => n + s.kg * s.reps, 0);
}

/** Did `curr` beat `prev`? Heavier wins; at equal load, more total reps wins. */
export function progressed(curr: LoggedExercise, prev: LoggedExercise): boolean {
  const ck = topKg(curr);
  const pk = topKg(prev);
  if (ck > pk) return true;
  if (ck < pk) return false;
  return totalReps(curr) > totalReps(prev);
}

/**
 * Consecutive sessions, counting back from the most recent, that failed to beat
 * the session before them.
 *
 * @param history most recent first
 */
export function stallCount(history: LoggedExercise[]): number {
  let n = 0;
  for (let i = 0; i + 1 < history.length; i++) {
    if (progressed(history[i], history[i + 1])) break;
    n++;
  }
  return n;
}

/** A set counts as taken to failure when she reported zero reps in reserve. */
export function wasTakenToFailure(sets: LoggedSet[]): boolean {
  return sets.some((s) => s.rir !== null && s.rir <= 0);
}

function allSetsAtCeiling(sets: LoggedSet[], repMax: number): boolean {
  if (sets.length === 0) return false;
  // Load only goes up when the top of the range was reached with something left
  // in the tank. Grinding out the last rep is not the same as earning the jump.
  return sets.every((s) => s.reps >= repMax && (s.rir === null || s.rir >= 1));
}

/**
 * Choose the next target for one exercise.
 *
 * @param history  previous sessions for this exercise, most recent first
 * @param startKg  first-session load from the quiz. Falls back to the library's
 *                 generic guess when no profile exists yet.
 */
export function nextTarget(
  ex: Exercise,
  target: SetTarget,
  history: LoggedExercise[],
  startKg?: number,
): Decision {
  const last = history[0];

  if (!last || last.sets.length === 0) {
    const kg = startKg ?? ex.startKg;
    return {
      kg,
      reps: Array(target.sets).fill(target.repMin),
      lever: 'start',
      reason: `First time on this one. ${kg > 0 ? `Start around ${kg} kg` : 'Start with bodyweight'} and treat it as a rehearsal — the goal today is a clean, repeatable rep, not a hard set. The weight corrects itself next time.`,
    };
  }

  const kg = topKg(last);
  const stalls = stallCount(history);

  if (stalls >= SWAP_LIMIT) {
    return {
      kg,
      reps: last.sets.map((s) => s.reps),
      lever: 'swap-variant',
      reason: `Three sessions without progress. That is the movement, not you — swap to another rung on the ladder and come back to this one later.`,
    };
  }

  if (stalls >= STALL_LIMIT) {
    return {
      kg,
      reps: Array(Math.max(1, Math.ceil(last.sets.length * 0.6))).fill(target.repMin),
      lever: 'deload',
      reason: `Two sessions without progress. Back off this week — same weight, about 40% fewer sets. Backing off is how the progress catches up.`,
    };
  }

  if (allSetsAtCeiling(last.sets, target.repMax)) {
    const jump = kg > 0 ? ex.incrementKg / kg : 0;

    // The plate is small enough relative to the load — take it.
    if (kg === 0 || jump <= INCREMENT_CEILING) {
      const nextKg = kg + ex.incrementKg;
      return {
        kg: nextKg,
        reps: Array(target.sets).fill(target.repMin),
        lever: 'add-load',
        reason: `You hit ${target.repMax} on every set with something left over. Up to ${nextKg} kg, back down to ${target.repMin} reps — it should feel hard again.`,
      };
    }

    // The plate is too big. Pull a different lever instead, in order.
    const pct = Math.round(jump * 100);
    const maxReps = Math.max(...last.sets.map((s) => s.reps));
    const extendedCeiling = target.repMax + 2;

    if (maxReps < extendedCeiling) {
      return {
        kg,
        reps: last.sets.map((s) => Math.min(s.reps + 1, extendedCeiling)),
        lever: 'extend-range',
        reason: `Next plate is +${ex.incrementKg} kg — a ${pct}% jump, too big to take cleanly. Staying at ${kg} kg and extending to ${extendedCeiling} reps instead.`,
      };
    }

    // Reps are maxed out. From here it depends on how big the plate really is.
    //
    // Extra sets are a consolation prize, not a progression: they are only the
    // right answer for a lift that genuinely cannot take its next plate. Handing
    // them out more widely is how this used to deadlock — the block scaling
    // raises `target.sets` every four weeks, which re-armed the add-set lever
    // faster than it could ever be exhausted, so the load step below was
    // unreachable and the weight never moved for the whole twelve weeks.
    if (jump >= ABSURD_JUMP) {
      if (last.sets.length < target.sets + 1) {
        return {
          kg,
          reps: Array(last.sets.length + 1).fill(target.repMax),
          lever: 'add-set',
          reason: `The next plate is +${ex.incrementKg} kg — a ${pct}% jump, near enough to doubling. Same weight, one extra set instead; more total work is progress just as much as more load is.`,
        };
      }
      return {
        kg,
        reps: last.sets.map((s) => s.reps),
        lever: 'micro-load',
        reason: `+${ex.incrementKg} kg would be a ${pct}% jump, and you have run out of other levers. You need smaller steps than this equipment has: magnetic micro-plates if the gym stocks them, or the dumbbell version where the jumps are 1-2 kg.`,
      };
    }

    // A bigger step than the textbook likes, but she has earned it — top of an
    // extended range on every set with something still in reserve.
    const nextKg = kg + ex.incrementKg;
    return {
      kg: nextKg,
      reps: Array(target.sets).fill(target.repMin),
      lever: 'add-load',
      reason: `You have taken ${kg} kg as far as it goes — ${extendedCeiling} reps on every set with something left over. Up to ${nextKg} kg. It is a ${pct}% step, so expect ${target.repMin} hard reps rather than ${extendedCeiling}; that is the jump working, not you going backwards.`,
    };
  }

  // The ordinary case: add a rep to every set that is below the ceiling, so the
  // whole ladder climbs together — 8/8/8, 9/9/9, 10/10/10, then load.
  //
  // This used to add one rep to the first set below the ceiling only, which
  // sounds gentler and is actually a trap: filling three sets from 8 to 12 that
  // way takes twelve sessions, and the main lifts are trained once a week. The
  // whole twelve weeks would go by on the opening weight.
  const reps = last.sets.map((s) => s.reps);
  // A set added because the block stepped volume up inherits where the other
  // sets already are. Starting it at the bottom of the range instead reads as
  // cautious and behaves as a stall: the "all sets at the ceiling" test can
  // never pass again, so the load stops moving every time a block changes.
  while (reps.length < target.sets) reps.push(reps[reps.length - 1] ?? target.repMin);
  for (let i = 0; i < reps.length; i++) {
    if (reps[i] < target.repMax) reps[i] += 1;
  }

  const failed = wasTakenToFailure(last.sets);
  return {
    kg,
    reps,
    lever: 'add-reps',
    reason: failed
      ? `Last time you went to failure. Same ${kg} kg, one more rep — but stop with ${target.rir} in the tank this time. Failure costs more in recovery than it pays back.`
      : `Same ${kg} kg, one more rep than last time. That is the whole method: small, boring, relentless.`,
  };
}

/** Human-readable target, e.g. "3 x 8-12 @ 20 kg". */
export function formatTarget(d: Decision): string {
  const load = d.kg > 0 ? ` @ ${d.kg} kg` : ' (bodyweight)';
  const same = d.reps.every((r) => r === d.reps[0]);
  const reps = same ? `${d.reps.length} x ${d.reps[0]}` : d.reps.join(' / ');
  return `${reps}${load}`;
}
