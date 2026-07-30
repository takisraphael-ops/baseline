// Weekly training volume, counted in hard sets per muscle.
//
// This is the metric that replaces "calories burned in the session". Calories
// burned in a gym hour is a small number, badly measured, and it is not what
// produces the result she is after. Hard sets completed is the number that
// actually predicts whether muscle gets built. See SPEC section 2.2.
//
// Direct sets count as one. Sets where a muscle assists count as a half — the
// usual convention, and close enough for programming decisions.

import { getExercise } from './exercises';
import { SESSIONS, scaleTarget } from './programme';
import type { Muscle, SessionLog } from './types';

export type VolumeMap = Partial<Record<Muscle, number>>;

function add(map: VolumeMap, m: Muscle, n: number) {
  map[m] = (map[m] ?? 0) + n;
}

/** Hard sets per muscle scheduled for a given week. */
export function plannedWeeklyVolume(week: number): VolumeMap {
  const map: VolumeMap = {};
  for (const session of SESSIONS) {
    for (const slot of session.slots) {
      const ex = getExercise(slot.exerciseId);
      const sets = scaleTarget(slot.target, week).sets;
      // Priming sets are deliberately easy and do not count as hard sets.
      const counted = slot.role === 'prime' ? 0 : sets;
      for (const m of ex.primary) add(map, m, counted);
      for (const m of ex.secondary) add(map, m, counted * 0.5);
    }
  }
  return map;
}

/** Hard sets per muscle actually completed, from logged sessions. */
export function actualWeeklyVolume(logs: SessionLog[], week: number): VolumeMap {
  const map: VolumeMap = {};
  for (const log of logs.filter((l) => l.week === week)) {
    const spec = SESSIONS.find((s) => s.id === log.sessionId);
    for (const le of log.exercises) {
      const ex = getExercise(le.exerciseId);
      const slot = spec?.slots.find((s) => s.exerciseId === le.exerciseId);
      if (slot?.role === 'prime') continue;
      const sets = le.sets.length;
      for (const m of ex.primary) add(map, m, sets);
      for (const m of ex.secondary) add(map, m, sets * 0.5);
    }
  }
  return map;
}

/**
 * The week's target is simply what the programme schedules for that week.
 *
 * Derived rather than kept as a hand-written table: a second copy of the numbers
 * drifts out of step the moment an exercise or a set count changes, and then the
 * progress bars quietly start lying. The programme is the single source of truth.
 */
export function targetWeeklyVolume(week: number): VolumeMap {
  return plannedWeeklyVolume(week);
}

export function totalSets(map: VolumeMap): number {
  return Object.values(map).reduce((n: number, v) => n + (v ?? 0), 0);
}

/** Total minutes of walking prescribed per training week. */
export function weeklyWalkMinutes(minutesEachWay: number, sessionsPerWeek = 4): number {
  return minutesEachWay * 2 * sessionsPerWeek;
}

/**
 * Structured cardio minutes for a week, excluding walking.
 * Kept separate so the walk is never used to flatter the machine work, or the
 * other way round.
 */
export function weeklyCardioMinutes(logs: SessionLog[], week: number): number {
  return logs.filter((l) => l.week === week).reduce((n, l) => n + l.cardioMinutes, 0);
}
