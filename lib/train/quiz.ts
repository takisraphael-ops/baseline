// The starting-strength quiz.
//
// The problem it solves: a fixed "start at 40 kg on the leg press" is a guess
// about a person the app has never met. Guess too high and the first session is
// frightening and the technique falls apart; guess too low and three weeks are
// spent climbing back to a real working weight.
//
// So instead: ask about things she can answer honestly without a gym, score
// them into a single strength index, and set every starting load as a fraction
// of her bodyweight scaled by that index.
//
// The bodyweight-strength questions carry the most weight because they are the
// best available predictors — a press-up is a real load test, and someone who
// can hang from a bar for thirty seconds has a back and grip that will handle a
// meaningful pulldown on day one.
//
// None of this is precision. It is a better first guess than a fixed number,
// and the progression engine corrects it from real data after one session.

import type { Exercise } from './types';

export type Experience = 'never' | 'dabbled' | 'lapsed' | 'current';
export type Activity = 'sedentary' | 'walker' | 'active-job' | 'sporty';
export type PressUps = 'none' | 'knees' | 'few' | 'several' | 'many';
export type Squats = 'under10' | '10to20' | '20to40' | 'over40';
export type Plank = 'under20' | '20to45' | '45to90' | 'over90';
export type Hang = 'under10' | '10to30' | 'over30';
export type Confidence = 'never' | 'some' | 'comfortable';
export type Niggle = 'knee' | 'shoulder' | 'lower-back' | 'wrist' | 'none';

export interface QuizAnswers {
  experience: Experience;
  activity: Activity;
  pressUps: PressUps;
  squats: Squats;
  plank: Plank;
  hang: Hang;
  confidence: Confidence;
  niggles: Niggle[];
}

export interface QuizQuestion {
  id: keyof Omit<QuizAnswers, 'niggles'> | 'niggles';
  title: string;
  help?: string;
  multi?: boolean;
  options: { value: string; label: string; sub?: string }[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'experience',
    title: 'Have you lifted weights before?',
    help: 'Be honest — there is no wrong answer, and guessing high just makes week one unpleasant.',
    options: [
      { value: 'never', label: 'Never', sub: 'Machines and weights are new to me' },
      { value: 'dabbled', label: 'A little', sub: 'A handful of sessions, nothing consistent' },
      { value: 'lapsed', label: 'I used to', sub: 'Trained properly at some point, then stopped' },
      { value: 'current', label: 'On and off now', sub: 'I lift sometimes, without a plan' },
    ],
  },
  {
    id: 'activity',
    title: 'How active is the rest of your life?',
    options: [
      { value: 'sedentary', label: 'Mostly sitting', sub: 'Desk work, not much walking' },
      { value: 'walker', label: 'I walk a lot', sub: 'On my feet and walking most days' },
      { value: 'active-job', label: 'Physically busy', sub: 'Job or life keeps me moving and lifting things' },
      { value: 'sporty', label: 'I play a sport', sub: 'Something regular and demanding' },
    ],
  },
  {
    id: 'pressUps',
    title: 'How many press-ups can you do in one go?',
    help: 'The single most useful thing you can tell me. Try a few now if you are not sure.',
    options: [
      { value: 'none', label: 'None yet', sub: 'Not even on my knees' },
      { value: 'knees', label: 'A few on my knees', sub: 'Knees down, but I can do them' },
      { value: 'few', label: '1–5 full ones', sub: 'On my toes, chest to the floor' },
      { value: 'several', label: '6–15 full ones' },
      { value: 'many', label: 'More than 15' },
    ],
  },
  {
    id: 'squats',
    title: 'How many bodyweight squats before your legs complain?',
    help: 'Down until your thighs are roughly parallel to the floor, no weight.',
    options: [
      { value: 'under10', label: 'Fewer than 10' },
      { value: '10to20', label: '10 to 20' },
      { value: '20to40', label: '20 to 40' },
      { value: 'over40', label: 'More than 40' },
    ],
  },
  {
    id: 'plank',
    title: 'How long can you hold a plank?',
    help: 'Straight line from shoulders to heels. It stops counting when your hips sag.',
    options: [
      { value: 'under20', label: 'Under 20 seconds' },
      { value: '20to45', label: '20 to 45 seconds' },
      { value: '45to90', label: '45 to 90 seconds' },
      { value: 'over90', label: 'Over 90 seconds' },
    ],
  },
  {
    id: 'hang',
    title: 'How long can you hang from a bar?',
    help: 'Just hanging, arms straight, feet off the floor. This tells me about your back and grip.',
    options: [
      { value: 'under10', label: 'Under 10 seconds', sub: 'Or I have never tried' },
      { value: '10to30', label: '10 to 30 seconds' },
      { value: 'over30', label: 'More than 30 seconds' },
    ],
  },
  {
    id: 'confidence',
    title: 'How do you feel about the gym machines?',
    help: 'This changes how much setup detail I put in front of you, not how heavy you start.',
    options: [
      { value: 'never', label: 'No idea what I am doing', sub: 'Show me everything' },
      { value: 'some', label: 'I can use a few', sub: 'Some are familiar, most are not' },
      { value: 'comfortable', label: 'Fairly comfortable', sub: 'I can work most of them out' },
    ],
  },
  {
    id: 'niggles',
    title: 'Anything that currently hurts?',
    help: 'Pick any that apply. I will flag the movements worth easing into.',
    multi: true,
    options: [
      { value: 'none', label: 'Nothing at all' },
      { value: 'knee', label: 'Knees' },
      { value: 'shoulder', label: 'Shoulders' },
      { value: 'lower-back', label: 'Lower back' },
      { value: 'wrist', label: 'Wrists' },
    ],
  },
];

/** Points per answer. They sum to 100 at the top of every scale. */
const POINTS = {
  experience: { never: 0, dabbled: 8, lapsed: 14, current: 20 },
  activity: { sedentary: 0, walker: 4, 'active-job': 8, sporty: 12 },
  pressUps: { none: 0, knees: 6, few: 12, several: 18, many: 24 },
  squats: { under10: 0, '10to20': 6, '20to40': 12, over40: 16 },
  plank: { under20: 0, '20to45': 4, '45to90': 8, over90: 12 },
  hang: { under10: 0, '10to30': 8, over30: 16 },
} as const;

export const MAX_INDEX = 100;

/** 0–100. Higher means more capable of handling load on day one. */
export function strengthIndex(a: QuizAnswers): number {
  return (
    POINTS.experience[a.experience] +
    POINTS.activity[a.activity] +
    POINTS.pressUps[a.pressUps] +
    POINTS.squats[a.squats] +
    POINTS.plank[a.plank] +
    POINTS.hang[a.hang]
  );
}

/**
 * Converts the index into a multiplier on every starting load.
 *
 * The floor is deliberately not far below the ceiling. Beginners differ less in
 * what they can *lift* on a fixed-path machine than in how confident they feel
 * doing it, and a wider spread would mostly produce silly numbers at both ends.
 */
export function strengthFactor(index: number): number {
  const clamped = Math.max(0, Math.min(MAX_INDEX, index));
  return 0.7 + (clamped / MAX_INDEX) * 0.7; // 0.70 .. 1.40
}

export function strengthBand(index: number): { label: string; blurb: string } {
  if (index < 20) {
    return {
      label: 'Starting from scratch',
      blurb: 'Which is genuinely the best place to start from — the first twelve weeks will move faster for you than for anyone else in the gym.',
    };
  }
  if (index < 45) {
    return {
      label: 'Some base to build on',
      blurb: 'You are not starting from nothing. Expect the weights to climb quickly for the first month or so.',
    };
  }
  if (index < 70) {
    return {
      label: 'A decent foundation',
      blurb: 'You can handle real load from day one, so the starting weights below are not token numbers.',
    };
  }
  return {
    label: 'Already strong',
    blurb: 'You will start heavier than most people beginning a programme, and the technique work will come quickly.',
  };
}

/**
 * Starting load for one exercise, in kg, rounded to something the equipment can
 * actually make. Returns 0 for bodyweight movements.
 */
export function startingLoad(ex: Exercise, bodyweightKg: number, factor: number): number {
  if (ex.bwRatio <= 0) return 0;
  const raw = bodyweightKg * ex.bwRatio * factor;
  const inc = ex.incrementKg > 0 ? ex.incrementKg : 2.5;
  const rounded = Math.round(raw / inc) * inc;
  // Never below one increment — a machine cannot be loaded with less than a plate.
  return Math.max(inc, Math.round(rounded * 10) / 10);
}

/** Movements worth easing into, given what she said hurts. */
export function cautions(niggles: Niggle[]): { area: string; advice: string }[] {
  const out: { area: string; advice: string }[] = [];
  if (niggles.includes('knee')) {
    out.push({
      area: 'Knees',
      advice: 'Go shallower on the leg press and split squats to begin with — stop above the depth that pinches. Leg extensions can aggravate a sore knee, so start very light and build up slowly.',
    });
  }
  if (niggles.includes('shoulder')) {
    out.push({
      area: 'Shoulders',
      advice: 'Keep pressing elbows tucked to about 45 degrees rather than flared, and stop lateral raises at shoulder height. Face pulls are the one to do religiously — they tend to help.',
    });
  }
  if (niggles.includes('lower-back')) {
    out.push({
      area: 'Lower back',
      advice: 'Be strict on the Romanian deadlift: stop the moment your back wants to round, and keep the weight brushing your legs. Use the chest-supported row rather than a bent-over one.',
    });
  }
  if (niggles.includes('wrist')) {
    out.push({
      area: 'Wrists',
      advice: 'Machine handles and cables will be kinder than a straight barbell. Keep your wrist in line with your forearm rather than bent back.',
    });
  }
  return out;
}

/** How much setup detail to show by default, from her confidence answer. */
export function defaultSetupOpen(confidence: Confidence): boolean {
  return confidence !== 'comfortable';
}
