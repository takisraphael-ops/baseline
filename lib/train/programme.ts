// The 12-week programme.
//
// Split: Upper / Lower x 2. Every muscle trained twice a week, which is the
// best available structure for building a base at four sessions.
//
// Every session runs Prime -> Compound -> Isolate:
//   Prime     light isolation, 1-2 sets, RPE 4-5. Teaches which muscle to feel.
//             Near-zero fatigue cost, so the main lift is unaffected.
//   Compound  the main lift, done while fresh. This is what builds the base.
//   Isolate   the volume work, after the heavy lifting is banked.
//
// True pre-exhaustion (a hard isolation set immediately before the compound)
// is deliberately held back to Block 3. Done earlier it weakens the compound,
// degrades technique, and the published evidence does not support the intended
// mechanism. See SPEC section 2.1.
//
// Supersets are antagonist pairs only until week 9 — one muscle rests while the
// other works, so the session compresses without a strength cost.

import type { BlockSpec, SessionSpec, SetTarget } from './types';

export const TOTAL_WEEKS = 12;

export const BLOCKS: BlockSpec[] = [
  {
    id: 1,
    name: 'Technique',
    weekStart: 1,
    weekEnd: 4,
    focus: 'Learn the machines. Learn what "hard" feels like. Establish a reference weight for every lift.',
    intensity: '2 sets, 3-4 reps left in reserve',
    unlocks: ['Antagonist supersets'],
    setScale: 0.7,
    rir: 3,
  },
  {
    id: 2,
    name: 'Build',
    weekStart: 5,
    weekEnd: 8,
    focus: 'First real progressive overload. The weight goes up most weeks now.',
    intensity: '3 sets, 2 reps left in reserve',
    unlocks: ['Drop sets', 'Cardio intervals'],
    setScale: 1.0,
    rir: 2,
  },
  {
    id: 3,
    name: 'Intensify',
    weekStart: 9,
    weekEnd: 12,
    focus: 'Intensity techniques, and the first free-weight versions of each pattern.',
    intensity: '3-4 sets, 1-2 reps left in reserve on the last set',
    unlocks: ['Same-muscle supersets', 'Pre-exhaustion', 'Free-weight variants'],
    // 1.34 rather than 1.15: at 1.15 a 3-set slot rounds back to 3 and the block
    // adds no volume at all. This makes the step real (3 -> 4, 2 -> 3).
    setScale: 1.34,
    rir: 1,
  },
];

export function blockForWeek(week: number): BlockSpec {
  return BLOCKS.find((b) => week >= b.weekStart && week <= b.weekEnd) ?? BLOCKS[BLOCKS.length - 1];
}

/** Deload weeks. Volume drops, load is held. */
export const DELOAD_WEEKS = [5, 9];

export function isDeloadWeek(week: number): boolean {
  return DELOAD_WEEKS.includes(week);
}

const t = (sets: number, repMin: number, repMax: number, rir: number, restSec: number): SetTarget =>
  ({ sets, repMin, repMax, rir, restSec });

export const SESSIONS: SessionSpec[] = [
  {
    id: 'lower-a',
    day: 'A',
    name: 'Lower A',
    focus: 'Quads and glutes',
    slots: [
      { exerciseId: 'leg-extension', role: 'prime', target: t(2, 12, 15, 4, 45), note: 'Light. This is a rehearsal, not a set — you are teaching yourself where the quad is.' },
      { exerciseId: 'leg-press', role: 'main', target: t(3, 8, 12, 2, 150), note: 'The most important lift of the session. Take the full rest.' },
      { exerciseId: 'hip-thrust-machine', role: 'secondary', target: t(3, 8, 12, 2, 120), note: 'The single best glute exercise there is. Squeeze hard at the top.' },
      { exerciseId: 'lying-leg-curl', role: 'accessory', target: t(3, 10, 15, 2, 75), supersetWith: 4 },
      { exerciseId: 'hip-abduction', role: 'accessory', target: t(3, 12, 20, 2, 75), supersetWith: 3, note: 'Paired with the leg curl — alternate straight between them with no rest.' },
      { exerciseId: 'standing-calf-raise', role: 'finisher', target: t(3, 10, 15, 1, 60) },
      { exerciseId: 'plank', role: 'core', target: t(3, 20, 45, 2, 45), note: 'Reps are seconds here.' },
    ],
    cardio: {
      kind: 'none',
      minutes: 0,
      note: 'No machine cardio today — your legs have done enough. The walk home is the cool-down.',
    },
  },
  {
    id: 'upper-a',
    day: 'B',
    name: 'Upper A',
    focus: 'Push bias',
    slots: [
      { exerciseId: 'cable-lateral-raise', role: 'prime', target: t(2, 12, 15, 4, 45), note: 'Very light. Shoulder width is built here, and it needs almost no weight.' },
      { exerciseId: 'chest-press-machine', role: 'main', target: t(3, 8, 12, 2, 120) },
      { exerciseId: 'machine-shoulder-press', role: 'secondary', target: t(3, 8, 12, 2, 120) },
      { exerciseId: 'lat-pulldown', role: 'accessory', target: t(3, 8, 12, 2, 90), note: 'Here to balance the pressing. Skipping it is how shoulders start to ache.' },
      { exerciseId: 'triceps-pushdown', role: 'finisher', target: t(2, 10, 15, 1, 60), supersetWith: 5 },
      { exerciseId: 'cable-curl', role: 'finisher', target: t(2, 10, 15, 1, 60), supersetWith: 4, note: 'Paired with the pushdown — opposite muscles, so no rest needed between them.' },
      // The isolate half of the sandwich the cable raise primed at the top of the
      // session. Without it the side delt is woken up and then never worked hard,
      // and it is the muscle that does most for how the upper body looks.
      { exerciseId: 'db-lateral-raise', role: 'finisher', target: t(3, 12, 20, 1, 60), note: 'You primed these first thing. Now actually work them — light weight, high reps, no swinging.' },
      { exerciseId: 'face-pull', role: 'core', target: t(2, 15, 20, 2, 45) },
    ],
    cardio: {
      kind: 'zone2',
      minutes: 12,
      note: 'Bike or incline treadmill walk. Conversational the whole way — if you could not speak a full sentence, ease off.',
    },
  },
  {
    id: 'lower-b',
    day: 'C',
    name: 'Lower B',
    focus: 'Hamstrings and glutes',
    slots: [
      { exerciseId: 'lying-leg-curl', role: 'prime', target: t(2, 12, 15, 4, 45), note: 'Light. Find the hamstring before you load it.' },
      { exerciseId: 'db-rdl', role: 'main', target: t(3, 8, 12, 2, 150), note: 'The hip hinge. The most useful thing you will learn in twelve weeks.' },
      { exerciseId: 'bulgarian-split-squat', role: 'secondary', target: t(3, 8, 12, 2, 120), note: 'Reps are per leg. Bodyweight only until the balance is solid.' },
      { exerciseId: 'back-extension', role: 'accessory', target: t(3, 12, 15, 2, 75), supersetWith: 4 },
      { exerciseId: 'leg-extension', role: 'accessory', target: t(3, 12, 15, 2, 75), supersetWith: 3, note: 'Paired with the back extension — front of the leg against the back of it.' },
      { exerciseId: 'hip-abduction', role: 'finisher', target: t(3, 15, 20, 1, 60) },
      { exerciseId: 'dead-bug', role: 'core', target: t(3, 8, 12, 2, 45), note: 'Reps are per side.' },
    ],
    cardio: {
      kind: 'none',
      minutes: 0,
      note: 'No machine cardio. Walk home and let the legs recover.',
    },
  },
  {
    id: 'upper-b',
    day: 'D',
    name: 'Upper B',
    focus: 'Pull bias',
    slots: [
      { exerciseId: 'face-pull', role: 'prime', target: t(2, 15, 20, 4, 45), note: 'Light. Wakes up the upper back before you pull anything heavy.' },
      { exerciseId: 'lat-pulldown', role: 'main', target: t(3, 8, 12, 2, 120), note: 'Lead with the elbows. This is the lift that builds the V shape.' },
      { exerciseId: 'seated-cable-row', role: 'secondary', target: t(3, 8, 12, 2, 120) },
      { exerciseId: 'incline-db-press', role: 'accessory', target: t(3, 8, 12, 2, 90), supersetWith: 4 },
      { exerciseId: 'chest-supported-row', role: 'accessory', target: t(3, 8, 12, 2, 90), supersetWith: 3, note: 'Paired with the incline press — push against pull.' },
      { exerciseId: 'cable-curl', role: 'finisher', target: t(2, 10, 15, 1, 60) },
      { exerciseId: 'cable-woodchop', role: 'core', target: t(2, 10, 12, 2, 45), note: 'Reps are per side.' },
    ],
    cardio: {
      kind: 'intervals',
      minutes: 14,
      intervals: { workSec: 30, restSec: 30, rounds: 8, zone: 4 },
      note: 'The hard cardio day, and the one that moves VO2 max. Upper-body session only — never after legs.',
    },
  },
];

export const SESSION_ORDER = ['lower-a', 'upper-a', 'lower-b', 'upper-b'];

export function getSession(id: string): SessionSpec {
  const s = SESSIONS.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown session: ${id}`);
  return s;
}

/**
 * Interval prescription ramps across the programme. The 4x4 protocol is the
 * canonical VO2 max session, but it is not a week-1 prescription for someone
 * with no training history — this is the on-ramp to it.
 */
export function intervalsForWeek(week: number): SessionSpec['cardio'] {
  if (week <= 4) {
    return { kind: 'zone2', minutes: 15, note: 'Zone 2 for now. Intervals start in week 5, once you have an aerobic base to spend.' };
  }
  if (week <= 6) {
    return { kind: 'intervals', minutes: 14, intervals: { workSec: 30, restSec: 30, rounds: 8, zone: 4 }, note: '30 seconds hard, 30 easy, eight times. Hard means you can manage a couple of words, no more.' };
  }
  if (week <= 8) {
    return { kind: 'intervals', minutes: 18, intervals: { workSec: 60, restSec: 90, rounds: 6, zone: 4 }, note: 'One minute hard, ninety seconds easy, six times.' };
  }
  if (week <= 10) {
    return { kind: 'intervals', minutes: 22, intervals: { workSec: 120, restSec: 120, rounds: 5, zone: 5 }, note: 'Two minutes hard, two easy, five times. The last round should be genuinely difficult.' };
  }
  return { kind: 'intervals', minutes: 28, intervals: { workSec: 240, restSec: 180, rounds: 4, zone: 5 }, note: 'The 4x4. Four minutes near maximum, three minutes easy, four times. This is the protocol that raises VO2 max.' };
}

/** Apply the block's set scaling and RIR to a slot's base target. */
export function scaleTarget(base: SetTarget, week: number): SetTarget {
  const block = blockForWeek(week);
  const deload = isDeloadWeek(week);
  const scale = deload ? block.setScale * 0.6 : block.setScale;
  return {
    ...base,
    sets: Math.max(1, Math.round(base.sets * scale)),
    rir: deload ? block.rir + 2 : block.rir,
  };
}

/** Which session comes next, given how many have been completed. */
export function nextSessionId(completedCount: number): string {
  return SESSION_ORDER[completedCount % SESSION_ORDER.length];
}

export function weekForSessionCount(completedCount: number): number {
  return Math.min(TOTAL_WEEKS, Math.floor(completedCount / SESSION_ORDER.length) + 1);
}
