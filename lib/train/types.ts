// Shared types for the training system. No I/O, no framework imports.

import type { QuizAnswers } from './quiz';

export type Muscle =
  | 'glutes' | 'quads' | 'hamstrings' | 'calves' | 'adductors' | 'abductors'
  | 'lats' | 'upper-back' | 'lower-back' | 'traps'
  | 'chest' | 'front-delts' | 'side-delts' | 'rear-delts'
  | 'biceps' | 'triceps' | 'core';

export type Pattern =
  | 'squat' | 'hinge' | 'lunge'
  | 'push-h' | 'push-v' | 'pull-h' | 'pull-v'
  | 'isolation' | 'core';

export type Equipment = 'machine' | 'cable' | 'dumbbell' | 'barbell' | 'bodyweight';

/** Where an exercise sits inside a session. Drives the Prime -> Compound -> Isolate order. */
export type Role = 'prime' | 'main' | 'secondary' | 'accessory' | 'finisher' | 'core';

export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  equipment: Equipment;
  primary: Muscle[];
  secondary: Muscle[];
  /** Numbered setup steps. Machine adjustments named explicitly — this is the anti-intimidation surface. */
  setup: string[];
  /** What a correct rep should feel like. */
  cues: string[];
  /** Beginner failure modes, each paired with its fix. */
  mistakes: { wrong: string; fix: string }[];
  /**
   * Curated demo, opened in a new tab — never embedded (see SPEC §7.4).
   * Empty when no specific video was found; the search fallback is always
   * present in the UI, so a dead link costs one extra tap rather than
   * stranding her at a machine.
   */
  videoUrl: string;
  videoLabel: string;
  /** Query behind the always-works "search instead" link. */
  videoSearch: string;
  /** Progression chain, easiest first. Ids from this library. */
  ladder: string[];
  /** Smallest load jump actually available on this equipment, in kg. Drives the increment fallback. */
  incrementKg: number;
  /**
   * Starting load as a fraction of bodyweight, before the quiz's strength
   * factor is applied. 0 for bodyweight movements. See lib/train/quiz.ts.
   */
  bwRatio: number;
  /** Fallback absolute start, used only when there is no profile yet. */
  startKg: number;
}

export interface SetTarget {
  sets: number;
  repMin: number;
  repMax: number;
  /** Reps in reserve to leave on each set. */
  rir: number;
  /** Rest between sets, seconds. */
  restSec: number;
}

export interface SlotSpec {
  exerciseId: string;
  role: Role;
  target: SetTarget;
  /** Superset partner slot index within the same session, if paired. */
  supersetWith?: number;
  note?: string;
}

export type CardioKind = 'none' | 'zone2' | 'intervals';

export interface CardioSpec {
  kind: CardioKind;
  minutes: number;
  /** Interval shape, when kind === 'intervals'. */
  intervals?: { workSec: number; restSec: number; rounds: number; zone: 4 | 5 };
  note: string;
}

export interface SessionSpec {
  id: string;
  /** A | B | C | D */
  day: string;
  name: string;
  focus: string;
  slots: SlotSpec[];
  cardio: CardioSpec;
}

export interface BlockSpec {
  id: number;
  name: string;
  weekStart: number;
  weekEnd: number;
  focus: string;
  intensity: string;
  unlocks: string[];
  /** Multiplier applied to the base set count for every slot in this block. */
  setScale: number;
  /** RIR override for this block. */
  rir: number;
}

// ---------------------------------------------------------------- logged data

export interface LoggedSet {
  /** Load used, kg. 0 for bodyweight. */
  kg: number;
  reps: number;
  /** Reps in reserve she reported. null when not recorded. */
  rir: number | null;
  /**
   * Seconds spent lowering, when the tempo lever was prescribed for this set.
   * Absent on every set that was not, including all sets logged before the
   * lever existed — which is why it is optional rather than defaulted.
   * `nextTarget` reads it to tell "already slowed the eccentric and still
   * cannot take the plate" apart from "has not tried that yet".
   */
  eccentricSec?: number;
}

export interface LoggedExercise {
  exerciseId: string;
  sets: LoggedSet[];
}

export interface SessionLog {
  /** ISO local date, YYYY-MM-DD. */
  date: string;
  sessionId: string;
  week: number;
  exercises: LoggedExercise[];
  cardioMinutes: number;
  cardioKind: CardioKind;
  /** Free text. Never interpreted, never scored. */
  howItFelt?: string;
  completedAt: string;
}

export interface CardioTest {
  date: string;
  kind: 'rockport' | 'cooper';
  /** Rockport: minutes to walk 1.61 km. Cooper: unused. */
  timeMin?: number;
  /** Rockport: heart rate immediately on finishing. */
  hrBpm?: number;
  /** Cooper: metres covered in 12 minutes. */
  metres?: number;
  vo2max: number;
}

export interface Profile {
  name: string;
  age: number;
  weightKg: number;
  /** Measured on waking. Feeds the Karvonen zone bands. */
  restingHr: number;
  /** Used by the Rockport estimate only. */
  sex: 'female' | 'male';
  startDate: string;
  parqCleared: boolean;
  walkMinutesEachWay: number;
  /** Quiz answers and the score derived from them. Null until the quiz is done. */
  quiz: QuizAnswers | null;
  strengthIndex: number;
}

export interface TrainState {
  version: number;
  profile: Profile | null;
  logs: SessionLog[];
  tests: CardioTest[];
}
