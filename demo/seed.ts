// Sample history for the hosted demo, so Progress and the progression engine
// have something to show rather than an empty state.
//
// Three completed weeks of real-looking sessions: loads creep up, one lift
// stalls deliberately so the deload path is visible, and a walk test is on
// record so the VO2 card is populated.

import { SESSION_ORDER, SESSIONS, scaleTarget } from '@/lib/train/programme';
import { strengthIndex } from '@/lib/train/quiz';
import { rockportVo2 } from '@/lib/train/vo2';
import { load, save } from '@/lib/train/store';
import type { LoggedSet, Profile, SessionLog, TrainState } from '@/lib/train/types';

const PROFILE: Profile = {
  name: 'Diva',
  age: 25,
  weightKg: 62,
  restingHr: 60,
  sex: 'female',
  startDate: '2026-07-08',
  parqCleared: true,
  walkMinutesEachWay: 20,
  quiz: {
    experience: 'dabbled',
    activity: 'walker',
    pressUps: 'few',
    squats: '20to40',
    plank: '20to45',
    hang: '10to30',
    confidence: 'some',
    niggles: ['none'],
  },
  strengthIndex: 0, // filled below from the answers themselves
};
PROFILE.strengthIndex = strengthIndex(PROFILE.quiz!);

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Loads climb week on week, except the leg press in week 3 which stalls. */
function setsFor(exerciseId: string, week: number, sets: number, repMin: number): LoggedSet[] {
  const bases: Record<string, number> = {
    'leg-press': 40, 'hip-thrust-machine': 30, 'seated-leg-curl': 15, 'lying-leg-curl': 15, 'leg-extension': 15,
    'hip-abduction': 20, 'standing-calf-raise': 20, plank: 0,
    'chest-press-machine': 15, 'machine-shoulder-press': 10, 'lat-pulldown': 20,
    'triceps-pushdown': 10, 'cable-curl': 7.5, 'face-pull': 10, 'cable-lateral-raise': 2.5,
    'db-lateral-raise': 4, 'db-rdl': 8, 'bulgarian-split-squat': 0, 'back-extension': 0,
    'seated-cable-row': 20, 'incline-db-press': 6, 'chest-supported-row': 7, 'cable-woodchop': 7.5,
    'dead-bug': 0,
  };
  const base = bases[exerciseId] ?? 10;
  // The leg press repeats week 2 in week 3, so the chart shows a flat segment
  // rather than a uniformly rising line. One flat session is not yet a stall —
  // that needs two in a row, which is asserted in scripts/fixture-run.ts.
  const effWeek = exerciseId === 'leg-press' && week === 3 ? 2 : week;
  const kg = base > 0 ? base + (effWeek - 1) * (base >= 20 ? 5 : 2) : 0;
  const reps = repMin + Math.min(2, effWeek - 1);
  return Array.from({ length: sets }, (_, i) => ({ kg, reps: Math.max(repMin, reps - (i > 1 ? 1 : 0)), rir: 2 }));
}

function buildLogs(): SessionLog[] {
  const logs: SessionLog[] = [];
  let n = 0;
  for (let week = 1; week <= 3; week++) {
    for (const sessionId of SESSION_ORDER) {
      const spec = SESSIONS.find((s) => s.id === sessionId)!;
      const cardio = spec.cardio;
      logs.push({
        date: isoDaysAgo(23 - n * 2),
        sessionId,
        week,
        exercises: spec.slots
          // Priming sets are rehearsal, not logged work.
          .filter((slot) => slot.role !== 'prime')
          .map((slot) => {
            const t = scaleTarget(slot.target, week);
            return { exerciseId: slot.exerciseId, sets: setsFor(slot.exerciseId, week, t.sets, slot.target.repMin) };
          }),
        cardioMinutes: cardio.kind === 'none' ? 0 : cardio.minutes,
        cardioKind: cardio.kind,
        completedAt: new Date().toISOString(),
      });
      n++;
    }
  }
  return logs;
}

export const SEEDED_FLAG = 'baseline.demo-seeded';
/** Present while the preview is still showing the sample history. */
export const SAMPLE_FLAG = 'baseline.demo-sample';

/**
 * Seeds once, ever. The flag survives "Delete all data" in Settings, which is
 * deliberate: without it the sample history would immediately reappear and the
 * quiz and onboarding could never be reached from the hosted demo.
 */
export function seedIfEmpty(): void {
  try {
    if (window.localStorage.getItem(SEEDED_FLAG)) return;
  } catch {
    // Storage blocked — seed into memory so the demo still has content.
  }
  const existing = load();
  if (existing.profile || existing.logs.length > 0) return;

  const state: TrainState = {
    version: 1,
    profile: PROFILE,
    logs: buildLogs(),
    tests: [
      { date: isoDaysAgo(23), kind: 'rockport', timeMin: 15.4, hrBpm: 152, vo2max: rockportVo2(62, 25, 'female', 15.4, 152) },
      { date: isoDaysAgo(2), kind: 'rockport', timeMin: 14.2, hrBpm: 146, vo2max: rockportVo2(62, 25, 'female', 14.2, 146) },
    ],
  };
  save(state);
  try {
    window.localStorage.setItem(SEEDED_FLAG, '1');
    window.localStorage.setItem(SAMPLE_FLAG, '1');
  } catch {
    // Nothing to do; the demo just re-seeds next reload.
  }
}
