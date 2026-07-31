/**
 * Fixture run — asserts the training maths against known values.
 * Pure logic, no DB, no network. Runs offline.
 *
 *   npm run fixture
 */
import { readFileSync } from 'node:fs';
import { getExercise } from '../lib/train/exercises';
import { SESSIONS, SESSION_ORDER, blockForWeek, intervalsForWeek, isDeloadWeek, scaleTarget } from '../lib/train/programme';
import { INCREMENT_CEILING, TEMPO_SEC, effortOf, nextTarget, progressed, stallCount, topKg, totalReps } from '../lib/train/progression';
import { classifyHr, karvonen, maxHrTanaka, zones } from '../lib/train/zones';
import { classifyVo2, cooperVo2, isMeaningfulChange, rockportVo2 } from '../lib/train/vo2';
import { plannedWeeklyVolume, weeklyWalkMinutes } from '../lib/train/volume';
import { MAX_INDEX, QUESTIONS, cautions, startingLoad, strengthFactor, strengthIndex } from '../lib/train/quiz';
import { EXERCISES, demoUrl, hasCuratedVideo } from '../lib/train/exercises';
import { drillDemoUrl, prepFor, rampSets } from '../lib/train/mobility';
import { alternativesFor } from '../lib/train/swaps';
import { historyFor } from '../lib/train/store';
import { THEME_BOOT_SCRIPT } from '../lib/train/theme';
import { FIGURE } from '../lib/train/figure';
import { BODY_REGIONS } from '../lib/train/body-regions';
import { TERMS, getTerm, termIdForMatch } from '../lib/train/glossary';
import { ARTICLES, LEARN_CATEGORIES, articlesIn, getArticle } from '../lib/train/learn';
import type { QuizAnswers } from '../lib/train/quiz';
import type { LoggedExercise, LoggedSet, SessionLog } from '../lib/train/types';

let failures = 0;
function expect(label: string, actual: unknown, expected: unknown) {
  const pass =
    actual === expected ||
    (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-6);
  if (!pass) failures++;
  console.log(`${pass ? '✓' : '✗'}  ${label}  →  actual=${String(actual)}  expected=${String(expected)}`);
}
function expectRange(label: string, actual: number, low: number, high: number) {
  const pass = actual >= low && actual <= high;
  if (!pass) failures++;
  console.log(`${pass ? '✓' : '✗'}  ${label}  →  actual=${actual}  expected=${low}..${high}`);
}

const sets = (spec: [number, number, number | null][]): LoggedSet[] =>
  spec.map(([kg, reps, rir]) => ({ kg, reps, rir }));
const log = (exerciseId: string, s: LoggedSet[]): LoggedExercise => ({ exerciseId, sets: s });

// --------------------------------------------------------------- heart rate
console.log('--- Heart-rate zones (age 25, resting 60) ---');
expect('Tanaka max HR', maxHrTanaka(25), 190.5);
expect('HR reserve', maxHrTanaka(25) - 60, 130.5);
expect('Karvonen 60% HRR', Math.round(karvonen(25, 60, 0.6)), 138);
expect('Karvonen 70% HRR', Math.round(karvonen(25, 60, 0.7)), 151);

const z = zones(25, 60);
expect('Zone 2 low', z[1].bpmLow, 138);
expect('Zone 2 high', z[1].bpmHigh, 151);
expect('Zone 2 named', z[1].name, 'Aerobic base');
expect('Zone 5 high is max HR', z[4].bpmHigh, Math.round(maxHrTanaka(25)));
// The same band expressed against max HR, which is what a treadmill console shows.
expectRange('Zone 2 as % of max HR (low)', z[1].pctMaxLow, 70, 76);
expectRange('Zone 2 as % of max HR (high)', z[1].pctMaxHigh, 77, 82);

expect('145 bpm classifies as zone 2', classifyHr(25, 60, 145)?.n, 2);
expect('180 bpm classifies as zone 5', classifyHr(25, 60, 180)?.n, 5);
expect('90 bpm is below zone 1', classifyHr(25, 60, 90), null);

// ------------------------------------------------------------------ VO2 max
console.log('\n--- VO2 max estimation ---');
// Rockport, 62 kg woman aged 25, 1.61 km in 15 min, HR 150 at the finish.
// 132.853 - 0.16953(62) - 0.3877(25) + 0 - 3.2649(15) - 0.1565(150)
const rock = rockportVo2(62, 25, 'female', 15, 150);
expect('Rockport estimate (2 dp)', Math.round(rock * 100) / 100, 40.2);
expect('Rockport classified', classifyVo2(rock), 'Good');
// Male coefficient adds exactly 6.315.
expect('Rockport sex term', Math.round((rockportVo2(62, 25, 'male', 15, 150) - rock) * 1000) / 1000, 6.315);

// Cooper: (2000 - 504.9) / 44.73
expect('Cooper 2000 m (2 dp)', Math.round(cooperVo2(2000) * 100) / 100, 33.42);
expect('Cooper 1500 m (2 dp)', Math.round(cooperVo2(1500) * 100) / 100, 22.25);

// A change smaller than half the error band must not be reported as progress.
expect('40.0 -> 41.0 is noise', isMeaningfulChange(40, 41), false);
expect('40.0 -> 45.0 is real', isMeaningfulChange(40, 45), true);

// ---------------------------------------------------------------- progression
console.log('\n--- Progression engine ---');
const legPress = getExercise('leg-press');
const legPressTarget = { sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 150 };

const first = nextTarget(legPress, legPressTarget, []);
expect('No history starts at startKg', first.kg, 40);
expect('No history starts at repMin', first.reps.join(','), '8,8,8');
expect('No history lever', first.lever, 'start');

// Mid-range: add one rep to the first set below the ceiling.
const mid = nextTarget(legPress, legPressTarget, [log('leg-press', sets([[40, 9, 2], [40, 8, 2], [40, 8, 2]]))]);
// The whole ladder climbs together. Adding a rep to only the first set below
// the ceiling took twelve sessions to fill three sets, and the main lifts are
// trained once a week — the programme ended on its opening weight.
expect('Mid-range adds a rep to every set below the ceiling', mid.reps.join(','), '10,9,9');
expect('Mid-range holds load', mid.kg, 40);
expect('Mid-range lever', mid.lever, 'add-reps');

// Top of range with reps in reserve, and a small plate relative to the load: take the jump.
// 5 kg on 60 kg is 8.3%, under the 10% ceiling.
const up = nextTarget(legPress, legPressTarget, [log('leg-press', sets([[60, 12, 2], [60, 12, 1], [60, 12, 1]]))]);
expect('Ceiling reached adds load', up.kg, 65);
expect('Ceiling reached resets reps', up.reps.join(','), '8,8,8');
expect('Ceiling reached lever', up.lever, 'add-load');

// Ground out to failure: no load increase, even at the top of the range.
const ground = nextTarget(legPress, legPressTarget, [log('leg-press', sets([[60, 12, 0], [60, 12, 0], [60, 12, 0]]))]);
expect('Failure blocks the load jump', ground.kg, 60);
expect('Failure lever', ground.lever, 'add-reps');

console.log('\n--- Effort steers the next prescription ---');
// The one piece of information only she has. A fixed +1 ignores it and is wrong
// in both directions: too slow with four reps spare, too fast with none.
const rated = (kg: number, reps: number, rir: number | null): LoggedExercise =>
  log('leg-press', [{ kg, reps, rir }, { kg, reps, rir: null }, { kg, reps, rir: null }]);

const lat0 = getExercise('cable-lateral-raise');
const easyMid = nextTarget(legPress, legPressTarget, [rated(40, 9, 3)]);
expect('Comfortable mid-ladder adds two reps', easyMid.reps.join(','), '11,11,11');
const hardMid = nextTarget(legPress, legPressTarget, [rated(40, 9, 2)]);
expect('Hard mid-ladder adds one rep', hardMid.reps.join(','), '10,10,10');
const maxedMid = nextTarget(legPress, legPressTarget, [rated(40, 9, 0)]);
expect('All out mid-ladder holds the reps', maxedMid.reps.join(','), '9,9,9');
expect('All out mid-ladder holds the load', maxedMid.kg, 40);
const unratedMid = nextTarget(legPress, legPressTarget, [rated(40, 9, null)]);
expect('Unrated is treated as an ordinary hard set', unratedMid.reps.join(','), '10,10,10');

// At the top of the range the same signal decides one plate or two.
const easyTop = nextTarget(legPress, legPressTarget, [rated(60, 12, 3)]);
expect('Comfortable at the ceiling takes two plates', easyTop.kg, 70);
const hardTop = nextTarget(legPress, legPressTarget, [rated(60, 12, 2)]);
expect('Hard at the ceiling takes one plate', hardTop.kg, 65);
const maxedTop = nextTarget(legPress, legPressTarget, [rated(60, 12, 0)]);
expect('All out at the ceiling does not add load', maxedTop.kg, 60);

// Never averages an honest "all out" away against unrated sets either side.
expect('Effort reads the hardest rated set', effortOf([{ kg: 40, reps: 10, rir: 3 }, { kg: 40, reps: 10, rir: 0 }]), 0);
expect('No rating at all reads as null', effortOf([{ kg: 40, reps: 10, rir: null }]), null);

// The double step must not compound into an absurd jump on a light lift.
const latEasy = nextTarget(lat0, { sets: 2, repMin: 12, repMax: 15, rir: 2, restSec: 45 },
  [log('cable-lateral-raise', [{ kg: 30, reps: 15, rir: 3 }, { kg: 30, reps: 15, rir: null }])]);
expect('Double step stays within the sane bound', latEasy.kg <= 30 + 2.5 * 2, true);

console.log('\n--- The machine-stack problem ---');
// Lateral raise: 2.5 kg plate on 5 kg is a 50% jump. Load must be held.
const lat = getExercise('cable-lateral-raise');
const latTarget = { sets: 2, repMin: 12, repMax: 15, rir: 2, restSec: 45 };
const small = nextTarget(lat, latTarget, [log('cable-lateral-raise', sets([[5, 15, 2], [5, 15, 2]]))]);
expect('Oversized jump holds load', small.kg, 5);
expect('Oversized jump extends the range', small.lever, 'extend-range');
expect('Extended reps', small.reps.join(','), '16,16');
expect('Ceiling is 25%', INCREMENT_CEILING, 0.25);

// Range already extended, and +2.5 kg on 2.5 kg is a doubling: an extra set is
// the only progression left, so that is what it offers.
const addSet = nextTarget(lat, latTarget, [log('cable-lateral-raise', sets([[2.5, 17, 2], [2.5, 17, 2]]))]);
expect('Doubling extends to an extra set', addSet.lever, 'add-set');
expect('Set count goes up', addSet.reps.length, 3);

// Sets are spent too. +2.5 kg on 2.5 kg doubles the weight, which no amount of
// earned reps justifies — so before sending her out to buy micro-plates the
// engine spends the one lever that needs no equipment at all, and slows the
// lowering. SPEC section 5 lists this third of four for exactly this case.
const tempo = nextTarget(lat, latTarget, [log('cable-lateral-raise', sets([[2.5, 17, 2], [2.5, 17, 2], [2.5, 17, 2]]))]);
expect('Doubling slows the eccentric before micro-loading', tempo.lever, 'tempo');
expect('Tempo prescribes 3 seconds', tempo.eccentricSec, TEMPO_SEC);
expect('Tempo does not move the load', tempo.kg, 2.5);
expect('Tempo does not add reps', tempo.reps.join(','), '17,17,17');

// Tempo already tried and logged, and the plate is still a doubling: now there
// is genuinely nothing left, so it says where smaller steps come from rather
// than parking her silently. This is the step that was unreachable while
// `eccentricSec` was never recorded.
const slowed: LoggedSet[] = sets([[2.5, 17, 2], [2.5, 17, 2], [2.5, 17, 2]]).map((s) => ({ ...s, eccentricSec: TEMPO_SEC }));
const stuck = nextTarget(lat, latTarget, [log('cable-lateral-raise', slowed)]);
expect('Doubling holds and advises once tempo is spent', stuck.lever, 'micro-load');
expect('Doubling does not move the load', stuck.kg, 2.5);

// Free weights skip the tempo lever — a 3-second eccentric there is a coaching
// cue, not something to prescribe blind — so a dumbbell lift goes straight to
// the micro-load advice.
const db = getExercise('db-lateral-raise');
const dbTarget = { sets: 3, repMin: 12, repMax: 15, rir: 2, restSec: 45 };
const dbStuck = nextTarget(db, dbTarget, [log('db-lateral-raise', sets([[2, 17, 2], [2, 17, 2], [2, 17, 2], [2, 17, 2]]))]);
expect('Free weights do not get the tempo lever', dbStuck.lever, 'micro-load');

// One step up the stack the same lift can progress — the hold is about the
// ratio, not the exercise.
const unstuck = nextTarget(lat, latTarget, [log('cable-lateral-raise', sets([[5, 17, 2], [5, 17, 2], [5, 17, 2]]))]);
expect('Half-again jump is taken once levers are spent', unstuck.lever, 'add-load');
expect('Half-again jump moves the load', unstuck.kg, 7.5);

// The same dead end on a heavier lift must NOT hold. Holding here is permanent:
// the percentage never changes if the weight never moves, which is exactly how
// all 19 loaded exercises ended up unable to progress.
const pressTarget = { sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 120 };
const chest = getExercise('chest-press-machine');
const exhausted = nextTarget(chest, pressTarget, [log('chest-press-machine', sets([[15, 14, 2], [15, 14, 2], [15, 14, 2], [15, 14, 2]]))]);
expect('Exhausted levers take the plate', exhausted.lever, 'add-load');
expect('Exhausted levers move the load', exhausted.kg, 20);

// Every loaded exercise must be able to reach add-load from its own starting
// weight. This is the assertion whose absence let the core mechanic ship dead.
let neverProgresses = 0;
for (const ex of EXERCISES) {
  if (ex.bwRatio <= 0) continue;
  const t0 = { sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 90 };
  let hist: LoggedExercise[] = [];
  let sawLoad = false;
  const start = startingLoad(ex, 62, 1.0);
  for (let i = 0; i < 40 && !sawLoad; i++) {
    const d = nextTarget(ex, t0, hist, start);
    if (d.lever === 'add-load' && d.kg > start) sawLoad = true;
    hist = [{ exerciseId: ex.id, sets: d.reps.map((r) => ({ kg: d.kg, reps: r, rir: 2 })) }, ...hist];
  }
  // The cable lateral raise is the one honest exception: its smallest plate is
  // 100% of its starting load, and the right answer is different equipment.
  if (!sawLoad && ex.id !== 'cable-lateral-raise') {
    neverProgresses++;
    console.log(`   x ${ex.id} never reaches add-load from ${start} kg`);
  }
}
expect('Every loaded exercise can add load', neverProgresses, 0);

console.log('\n--- Stalls and deloads ---');
const flat = sets([[40, 10, 2], [40, 10, 2], [40, 10, 2]]);
expect('Identical session did not progress', progressed(log('x', flat), log('x', flat)), false);
expect('Heavier session progressed', progressed(log('x', sets([[45, 8, 2]])), log('x', sets([[40, 10, 2]]))), true);
expect('More reps at same load progressed', progressed(log('x', sets([[40, 11, 2]])), log('x', sets([[40, 10, 2]]))), true);

expect('One flat session is not a stall', stallCount([log('x', flat), log('x', sets([[40, 9, 2]]))]), 0);
expect('Two flat sessions is a stall of 2', stallCount([log('x', flat), log('x', flat), log('x', flat)]), 2);

const stalled = nextTarget(legPress, legPressTarget, [log('leg-press', flat), log('leg-press', flat), log('leg-press', flat)]);
expect('Two stalls deloads', stalled.lever, 'deload');
expect('Deload holds the load', stalled.kg, 40);
expect('Deload cuts sets', stalled.reps.length, 2);

const swapped = nextTarget(legPress, legPressTarget, [
  log('leg-press', flat), log('leg-press', flat), log('leg-press', flat), log('leg-press', flat),
]);
expect('Three stalls suggests a swap', swapped.lever, 'swap-variant');

// A deload week asks for fewer sets than the session it follows. The rep array
// is seeded from that previous session, so without an explicit truncation it
// keeps the old count and prescribes three sets under a banner promising about
// 40% fewer. The same path covers a 2-set prime whose history was logged as a
// 3-set accessory — the block's target is what she is being asked to do.
const deloadTarget = { ...legPressTarget, sets: 2 };
const cutBack = nextTarget(legPress, deloadTarget, [log('leg-press', sets([[40, 10, 2], [40, 10, 2], [40, 10, 2]]))]);
expect('Fewer sets asked for means fewer sets prescribed', cutBack.reps.length, 2);

// historyFor promises most-recent-first. Sort is stable and the dates match, so
// without the completedAt tiebreak these come back in insertion order and the
// engine reads the wrong session as "last time".
const sameDay: SessionLog[] = [
  { date: '2026-07-20', sessionId: 'lower-a', week: 1, exercises: [log('leg-press', sets([[40, 10, 2]]))], cardioMinutes: 0, cardioKind: 'none', completedAt: '2026-07-20T08:00:00.000Z' },
  { date: '2026-07-20', sessionId: 'lower-a', week: 1, exercises: [log('leg-press', sets([[50, 10, 2]]))], cardioMinutes: 0, cardioKind: 'none', completedAt: '2026-07-20T18:00:00.000Z' },
];
const ordered = historyFor({ version: 1, profile: null, logs: sameDay, tests: [] }, 'leg-press');
expect('Same-day sessions come back newest first', topKg(ordered[0]), 50);

// -------------------------------------------------------------- programme
console.log('\n--- Programme shape ---');
expect('Four sessions', SESSIONS.length, 4);
expect('Week 1 is block 1', blockForWeek(1).id, 1);
expect('Week 4 is block 1', blockForWeek(4).id, 1);
expect('Week 5 is block 2', blockForWeek(5).id, 2);
expect('Week 12 is block 3', blockForWeek(12).id, 3);
expect('Week 5 is a deload', isDeloadWeek(5), true);
expect('Week 6 is not', isDeloadWeek(6), false);

// Every session opens with a prime and contains exactly one main lift.
for (const s of SESSIONS) {
  expect(`${s.name} opens with a prime`, s.slots[0].role, 'prime');
  expect(`${s.name} has one main lift`, s.slots.filter((x) => x.role === 'main').length, 1);
  const mainIdx = s.slots.findIndex((x) => x.role === 'main');
  const primeIdx = s.slots.findIndex((x) => x.role === 'prime');
  expect(`${s.name} primes before the compound`, primeIdx < mainIdx, true);
  // Superset partners must point back at each other.
  s.slots.forEach((slot, i) => {
    if (slot.supersetWith !== undefined) {
      expect(`${s.name} superset ${i} is mutual`, s.slots[slot.supersetWith].supersetWith, i);
    }
  });
  // Every referenced exercise must exist.
  for (const slot of s.slots) getExercise(slot.exerciseId);
  // No session may use the same exercise twice: the session player keys logged
  // sets by exercise id, so a repeat would have two slots writing over each other.
  const ids = s.slots.map((x) => x.exerciseId);
  expect(`${s.name} has no repeated exercise`, new Set(ids).size, ids.length);
}

// Block scaling: fewer sets early, more later, fewer again on a deload.
const base = SESSIONS[0].slots[1].target;
expect('Block 1 scales sets down', scaleTarget(base, 2).sets, 2);
expect('Block 2 runs the base', scaleTarget(base, 6).sets, 3);
expect('Block 3 scales up', scaleTarget(base, 12).sets, 4);
expect('Block 1 RIR', scaleTarget(base, 2).rir, 3);
expect('Block 3 RIR', scaleTarget(base, 12).rir, 1);
expect('Deload cuts sets', scaleTarget(base, 5).sets, 2);
expect('Deload raises RIR', scaleTarget(base, 5).rir, 4);

console.log('\n--- Cardio ramp ---');
expect('Week 1 has no intervals', intervalsForWeek(1).kind, 'zone2');
expect('Week 5 starts 30/30', intervalsForWeek(5).intervals?.workSec, 30);
expect('Week 7 moves to 60s', intervalsForWeek(7).intervals?.workSec, 60);
expect('Week 9 moves to 2 min', intervalsForWeek(9).intervals?.workSec, 120);
expect('Week 11 is the 4x4', intervalsForWeek(11).intervals?.workSec, 240);
expect('4x4 is four rounds', intervalsForWeek(11).intervals?.rounds, 4);
expect('4x4 rests 3 min', intervalsForWeek(11).intervals?.restSec, 180);
expect('4x4 targets zone 5', intervalsForWeek(11).intervals?.zone, 5);

console.log('\n--- Weekly volume ---');
const v2 = plannedWeeklyVolume(6);
// Bias is deliberate: glutes, back and hamstrings lead, nothing is skipped.
expectRange('Glute sets in block 2', v2.glutes ?? 0, 12, 20);
expectRange('Quad sets in block 2', v2.quads ?? 0, 7, 14);
expectRange('Hamstring sets in block 2', v2.hamstrings ?? 0, 7, 14);
expectRange('Lat sets in block 2', v2.lats ?? 0, 6, 14);
expectRange('Chest sets in block 2', v2.chest ?? 0, 4, 10);
// The side delt is primed at the top of Upper A and must also be worked hard
// later — priming alone leaves it with almost no real volume.
expectRange('Side delt sets in block 2', v2['side-delts'] ?? 0, 4, 12);
expect('Glutes get more than quads', (v2.glutes ?? 0) > (v2.quads ?? 0), true);
// Volume must actually step up across the blocks, not round back to the same number.
const v1 = plannedWeeklyVolume(2);
const v3 = plannedWeeklyVolume(12);
expect('Block 2 has more glute volume than block 1', (v2.glutes ?? 0) > (v1.glutes ?? 0), true);
expect('Block 3 has more glute volume than block 2', (v3.glutes ?? 0) > (v2.glutes ?? 0), true);
expect('Block 3 has more quad volume than block 2', (v3.quads ?? 0) > (v2.quads ?? 0), true);
// Priming sets are deliberately easy and must not be counted as hard sets.
// Leg extension primes Lower A; its only other appearance is an accessory in Lower B.
expectRange('Priming does not inflate quad volume', v2.quads ?? 0, 7, 12);
// Nothing in the body is skipped.
for (const m of ['glutes', 'quads', 'hamstrings', 'calves', 'lats', 'upper-back', 'lower-back', 'chest', 'front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps', 'core'] as const) {
  expect(`${m} gets trained`, (v2[m] ?? 0) > 0, true);
}

expect('Walk minutes at 20 each way', weeklyWalkMinutes(20), 160);
expect('Walk alone clears the 150 min guideline', weeklyWalkMinutes(20) >= 150, true);

console.log('\n--- Starting-strength quiz ---');
const weakest: QuizAnswers = {
  experience: 'never', activity: 'sedentary', pressUps: 'none',
  squats: 'under10', plank: 'under20', hang: 'under10',
  confidence: 'never', niggles: ['none'],
};
const strongest: QuizAnswers = {
  experience: 'current', activity: 'sporty', pressUps: 'many',
  squats: 'over40', plank: 'over90', hang: 'over30',
  confidence: 'comfortable', niggles: ['none'],
};
const middling: QuizAnswers = {
  experience: 'dabbled', activity: 'walker', pressUps: 'few',
  squats: '20to40', plank: '20to45', hang: '10to30',
  confidence: 'some', niggles: ['knee'],
};

expect('Weakest answers score 0', strengthIndex(weakest), 0);
expect('Strongest answers score 100', strengthIndex(strongest), MAX_INDEX);
expect('Scale tops out at exactly 100', MAX_INDEX, 100);
expectRange('Middling answers land mid-scale', strengthIndex(middling), 30, 60);

expect('Factor floor', strengthFactor(0), 0.7);
expect('Factor ceiling', Math.round(strengthFactor(100) * 100) / 100, 1.4);
expect('Factor is monotonic', strengthFactor(80) > strengthFactor(40), true);
expect('Out-of-range index is clamped', strengthFactor(500), strengthFactor(100));

// Every question must be answerable, and every option must map to a real score.
expect('Quiz has 8 questions', QUESTIONS.length, 8);
for (const q of QUESTIONS) {
  expect(`${String(q.id)} has options`, q.options.length > 1, true);
}

// Starting loads: bodyweight-relative, rounded to something the stack can make.
const legPressEx = getExercise('leg-press');
const weakStart = startingLoad(legPressEx, 62, strengthFactor(0));
const strongStart = startingLoad(legPressEx, 62, strengthFactor(100));
expect('Weak start is a multiple of the increment', weakStart % legPressEx.incrementKg, 0);
expect('Strong start is a multiple of the increment', strongStart % legPressEx.incrementKg, 0);
expect('Stronger answers start heavier', strongStart > weakStart, true);
expectRange('Leg press start, untrained 62 kg', weakStart, 20, 35);
expectRange('Leg press start, strong 62 kg', strongStart, 45, 60);
// A heavier person starts heavier on the same machine.
expect('Load scales with bodyweight', startingLoad(legPressEx, 80, 1) > startingLoad(legPressEx, 55, 1), true);
// Never below one plate, and bodyweight movements stay at zero.
expect('Never below one increment', startingLoad(getExercise('cable-lateral-raise'), 45, 0.7) >= 2.5, true);
expect('Bodyweight movements have no load', startingLoad(getExercise('plank'), 62, 1), 0);

// Every exercise must be loadable or explicitly bodyweight — no silent zeros.
for (const ex of EXERCISES) {
  const ok = ex.bwRatio > 0 ? startingLoad(ex, 62, 1) > 0 : startingLoad(ex, 62, 1) === 0;
  expect(`${ex.id} produces a sane start`, ok, true);
}

expect('A sore knee produces advice', cautions(['knee']).length, 1);
expect('No niggles produces none', cautions(['none']).length, 0);
expect('Two niggles produce two', cautions(['knee', 'shoulder']).length, 2);

console.log('\n--- Exercise library integrity ---');
for (const ex of EXERCISES) {
  expect(`${ex.id} has a search fallback`, ex.videoSearch.length > 0, true);
  // A curated link must be a real watch URL, never a half-built string.
  const curatedOk = ex.videoUrl === '' || ex.videoUrl.startsWith('https://www.youtube.com/watch?v=');
  expect(`${ex.id} curated link is well formed`, curatedOk, true);
  expect(`${ex.id} ladder contains itself`, ex.ladder.includes(ex.id), true);
  for (const rung of ex.ladder) getExercise(rung);
}

console.log('\n--- Warm-up and ramp sets ---');
for (const id of SESSION_ORDER) {
  const prep = prepFor(id);
  expect(`${id} has warm-up drills`, prep.warmUp.length >= 3, true);
  expect(`${id} has cool-down stretches`, prep.coolDown.length >= 3, true);
  for (const d of [...prep.warmUp, ...prep.coolDown]) {
    expect(`${id}/${d.name} explains itself`, d.how.length > 20 && d.why.length > 20, true);
  }
}
// Lower and upper days must not share a warm-up — the whole point is specificity.
expect('Lower and upper prep differ', prepFor('lower-a').warmUp[0].name !== prepFor('upper-a').warmUp[0].name, true);
expect('The two lower days differ', prepFor('lower-a').warmUp[0].name !== prepFor('lower-b').warmUp[0].name, true);

// 50 / 70 / 85 percent, rounded to the equipment's increment, always ascending.
const ramp = rampSets(60, 5);
expect('Three ramp sets at a real working weight', ramp.length, 3);
expect('Ramp set 1', ramp[0].kg, 30);
expect('Ramp set 2', ramp[1].kg, 40);
expect('Ramp set 3', ramp[2].kg, 50);
expect('Ramp reps descend', ramp.map((r) => r.reps).join(','), '8,5,3');
expect('Ramp never reaches the working weight', ramp[2].kg < 60, true);
for (let i = 1; i < ramp.length; i++) {
  expect(`Ramp set ${i + 1} is heavier than the one before`, ramp[i].kg > ramp[i - 1].kg, true);
}
// Light lifts get one rehearsal rather than three pieces of faff.
expect('Light working weight gets one ramp set', rampSets(10, 2.5).length, 1);
expect('Bodyweight gets an unloaded rehearsal', rampSets(0, 2.5)[0].kg, 0);
// Every ramp weight must be loadable on the equipment.
for (const inc of [2, 2.5, 5]) {
  for (const r of rampSets(80, inc)) {
    expect(`Ramp weight ${r.kg} is a multiple of ${inc}`, Math.round((r.kg / inc) * 1e6) % 1e6, 0);
  }
}

console.log('\n--- Swaps for a busy machine ---');
// Every exercise must have somewhere to go, or the feature is a dead button.
let noAlt = 0;
for (const ex of EXERCISES) {
  const alts = alternativesFor(ex.id);
  if (alts.length === 0) { noAlt++; console.log(`   ✗ no alternative for ${ex.id}`); }
  // A swap that does not share a primary muscle is a different exercise.
  for (const a of alts) {
    const shares = a.exercise.primary.some((m) => ex.primary.includes(m))
      || a.exercise.primary.some((m) => ex.secondary.includes(m))
      || a.exercise.secondary.some((m) => ex.primary.includes(m));
    expect(`${ex.id} -> ${a.exercise.id} shares a muscle`, shares, true);
  }
  expect(`${ex.id} never offers itself`, alts.every((a) => a.exercise.id !== ex.id), true);
}
expect('Every exercise has at least one alternative', noAlt, 0);

// Spot-checks on the ones she is most likely to find occupied.
const legPressAlts = alternativesFor('leg-press').map((a) => a.exercise.id);
expect('Leg press offers a squat pattern', legPressAlts.some((id) => ['goblet-squat', 'hack-squat', 'barbell-back-squat'].includes(id)), true);
const latAlts = alternativesFor('lat-pulldown').map((a) => a.exercise.id);
expect('Lat pulldown offers a pull-up variant', latAlts.some((id) => ['assisted-pull-up', 'pull-up', 'seated-cable-row', 'chest-supported-row'].includes(id)), true);
const chestAlts = alternativesFor('chest-press-machine').map((a) => a.exercise.id);
expect('Chest press offers a dumbbell option', chestAlts.some((id) => ['db-bench-press', 'incline-db-press'].includes(id)), true);
expect('Lateral raise swaps to the other lateral raise', alternativesFor('cable-lateral-raise')[0].exercise.id, 'db-lateral-raise');

// Anything already in today's session is not offered as a substitute for it.
const excluded = alternativesFor('leg-press', ['goblet-squat', 'hack-squat']).map((a) => a.exercise.id);
expect('Excluded ids are withheld', excluded.includes('goblet-squat') || excluded.includes('hack-squat'), false);

console.log('\n--- Effort control matches the engine ---');
// The three buttons write the numbers the engine branches on. If the control
// and the engine drift, the app quietly stops doing what the copy promises.
{
  const picker = readFileSync(new URL('../components/set-row.tsx', import.meta.url), 'utf8');
  const rirs = (picker.match(/\{ rir: (\d+),/g) ?? []).map((m) => Number(m.match(/\d+/)![0]));
  expect('Picker offers exactly three ratings', rirs.length, 3);
  expect('Picker writes 3 / 2 / 0', rirs.join(','), '3,2,0');
  // 3 must trigger the fast path, 0 must block a load increase entirely.
  const fast = nextTarget(legPress, legPressTarget, [rated(40, 9, rirs[0])]);
  expect('The "comfortable" button really does accelerate', fast.reps.join(','), '11,11,11');
  const held = nextTarget(legPress, legPressTarget, [rated(60, 12, rirs[2])]);
  expect('The "all out" button really does hold the load', held.kg, 60);
}

console.log('\n--- Splash markup ---');
// The launch animation is duplicated: JSX in app/layout.tsx for the Next build,
// a string in demo/build.mjs so the hosted single file can paint it before the
// bundle parses. Two copies is the price of a first-frame splash; drifting is
// not, so the class list must match exactly.
{
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  const demo = readFileSync(new URL('../demo/build.mjs', import.meta.url), 'utf8');
  const classes = (src: string) =>
    (src.match(/(?:className|class)="(splash[\w-]*)"/g) ?? []).map((m) => m.split('"')[1]).sort().join(',');
  const want = 'splash,splash-bars,splash-inner,splash-ring,splash-track,splash-word';
  expect('layout.tsx splash classes', classes(layout), want);
  expect('build.mjs splash classes', classes(demo), want);
  expect('layout.tsx has three bars', (layout.match(/<i \/>/g) ?? []).length, 3);
  expect('build.mjs has three bars', (demo.match(/<i><\/i>/g) ?? []).length, 3);
  // Every class the markup uses has to actually be styled.
  // The theme boot script is duplicated for the same reason the splash markup
  // is: it has to run before any bundle parses, and demo/build.mjs cannot import
  // TypeScript. Drift means the hosted build ignores a saved theme and flashes
  // the wrong colours on launch — silent, and only visible on a real phone.
  // Compare the RESOLVED script, not the source text: theme.ts builds it with
  // a template placeholder for the storage key, so the two files never match
  // character for character even when they behave identically.
  const demoBoot = (demo.match(/\(function\(\)\{try\{var t=localStorage[^`]*\}\)\(\);/) ?? ['(not found)'])[0];
  expect('demo/build.mjs runs the same theme boot script', demoBoot, THEME_BOOT_SCRIPT);
  // It must come before the bundle, or the flash it exists to prevent happens.
  expect('Boot script precedes the app bundle', demo.indexOf('THEME_BOOT') < demo.indexOf('<div id="root">'), true);

  const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  for (const c of want.split(',')) expect(`.${c} is styled`, css.includes(`.${c}`), true);
  // The brief was two seconds. Keep it honest.
  expect('splash runs for 2s', /animation: splash-exit 2s /.test(css), true);
}

console.log('\n--- Build targets ---');
// The artifact host injects <!doctype>, <head> and the viewport meta around
// whatever file it is given. Every other host injects nothing. A build with no
// viewport meta is laid out by phones at 980px and zoomed out, so the same
// bytes that look right inside the host are unusable emailed or on a static
// host — which is exactly how this shipped once.
{
  const build = readFileSync(new URL('../demo/build.mjs', import.meta.url), 'utf8');
  const doc = build.slice(build.indexOf('const document = `'), build.indexOf('const html = isStandalone'));
  const frag = build.slice(build.indexOf('const fragment = `'), build.indexOf('const document = `'));
  expect('standalone build has a doctype', doc.includes('<!doctype html>'), true);
  expect('standalone build sets the viewport', /name="viewport" content="width=device-width/.test(doc), true);
  expect('standalone build has <html lang>', doc.includes('<html lang="en">'), true);
  expect('standalone build declares a charset', doc.includes('charset="utf-8"'), true);
  // The artifact fragment must stay a fragment; a nested document breaks the host.
  expect('artifact build has no doctype', frag.includes('<!doctype'), false);
  expect('artifact build has no <html>', frag.includes('<html'), false);
  expect('artifact build has no <body>', frag.includes('<body'), false);
  expect('--standalone writes index.html', build.includes("? 'index.html'"), true);
}

console.log('\n--- Demo links ---');
// Every Watch button must go somewhere. `videoUrl: ''` is how "not curated
// yet" is spelled, and an href of "" is a link to nowhere that fails silently
// when tapped — which is exactly how this shipped once.
let curated = 0;
for (const ex of EXERCISES) {
  const url = demoUrl(ex);
  expect(`${ex.id} demo link is not empty`, url.length > 0, true);
  expect(`${ex.id} demo link is absolute`, url.startsWith('https://www.youtube.com/'), true);
  expect(`${ex.id} has a search fallback`, ex.videoSearch.trim().length > 0, true);
  if (hasCuratedVideo(ex)) {
    curated++;
    expect(`${ex.id} curated link is a watch url`, ex.videoUrl.startsWith('https://www.youtube.com/watch?v='), true);
    expect(`${ex.id} curated link has an id`, ex.videoUrl.split('v=')[1]?.length >= 8, true);
  } else {
    expect(`${ex.id} falls back to search`, url.includes('/results?search_query='), true);
  }
}
console.log(`   ${curated} curated, ${EXERCISES.length - curated} on search fallback`);

// Warm-up and cool-down drills carry demo links on the same terms.
const allDrills = SESSION_ORDER.flatMap((id) => {
  const p = prepFor(id);
  return [...p.warmUp, ...p.coolDown];
});
const uniqueDrills = [...new Map(allDrills.map((d) => [d.name, d])).values()];
for (const d of uniqueDrills) {
  const url = drillDemoUrl(d);
  expect(`drill "${d.name}" link is absolute`, url.startsWith('https://www.youtube.com/'), true);
  expect(`drill "${d.name}" has a search`, d.videoSearch.trim().length > 0, true);
}
console.log(`   ${uniqueDrills.length} drills, all with a demo link`);

console.log('\n--- Glossary ---');
// Every "read more" must land on a real article, or a tap dead-ends on a 404.
for (const t of TERMS) {
  if (t.more) expect(`${t.id} -> /learn/${t.more} exists`, getArticle(t.more) !== undefined, true);
  expect(`${t.id} has a definition`, t.short.length > 20, true);
  // Definitions get read on a phone, mid-session, one-handed.
  expect(`${t.id} definition stays short`, t.short.length < 300, true);
}
expect('Term ids are unique', new Set(TERMS.map((t) => t.id)).size, TERMS.length);

// The auto-linker must not match the same string for two different terms —
// whichever sorted first would silently win everywhere.
const patterns = TERMS.filter((t) => t.auto).flatMap((t) => [t.label, ...(t.aliases ?? [])].map((s) => s.toLowerCase()));
expect('No duplicate auto-link patterns', new Set(patterns).size, patterns.length);

// Round-trip: anything the matcher finds must resolve back to a real term.
for (const p of patterns) {
  expect(`"${p}" resolves`, termIdForMatch(p) !== undefined, true);
}

// The glossary article is generated, so it must cover every term exactly once.
const glossaryText = (getArticle('glossary')?.body ?? []).flatMap((s) => s.list ?? []).join('\n');
for (const t of TERMS) {
  expect(`Glossary page lists ${t.id}`, glossaryText.includes(`${t.label} —`), true);
}

// Ids referenced from JSX are spelled correctly. Cheap, and the failure mode
// without it is a term silently rendering as bare text.
const usedIds = [
  'zone-2', 'zone-4-5', 'vo2-max', 'superset', 'drop-set', 'progressive-overload',
  'rir', 'hard-set', 'deload', 'block', 'primer', 'main-lift', 'accessory',
  'finisher', 'rep', 'set', 'machine', 'cable', 'free-weight', 'compound',
  'isolation', 'eccentric', 'ladder', 'intervals', 'talk-test', 'max-heart-rate',
  'heart-rate-reserve', 'resting-heart-rate', 'rockport', 'cooper-test',
  'norwegian-4x4', 'interference-effect', 'pre-exhaustion', 'stall',
];
for (const id of usedIds) expect(`Term "${id}" exists`, getTerm(id) !== undefined, true);

// Techniques that unlock mid-programme must be explained before they appear.
for (const a of ARTICLES) {
  if (a.unlocksWeek !== undefined) expect(`${a.slug} unlocks within the programme`, a.unlocksWeek >= 1 && a.unlocksWeek <= 12, true);
}

// The Learn index offers four categories and nothing else, so an article that
// falls outside them would be unreachable from that page — the filter has no
// "everything else" bucket to catch it.
const catIds = LEARN_CATEGORIES.map((c) => c.id);
const binned = catIds.flatMap((id) => articlesIn(id));
expect('Every article lands in exactly one category', binned.length, ARTICLES.length);
expect('No article is binned twice', new Set(binned.map((a) => a.slug)).size, ARTICLES.length);
for (const id of catIds) expect(`Category "${id}" is not empty`, articlesIn(id).length > 0, true);

// The ring shows a count per wedge; it comes from the same helper the list does.
const techniques = articlesIn('techniques');
expect(
  'Techniques are ordered by the week they unlock',
  techniques.map((a) => a.unlocksWeek).join(','),
  [...techniques].sort((a, b) => a.unlocksWeek! - b.unlocksWeek!).map((a) => a.unlocksWeek).join(','),
);

// ------------------------------------------------------------------- figure
console.log('\n--- Body map figure ---');
// The artwork is ported from FitForge and regenerated by a script, so the two
// things worth pinning are that every muscle still resolves to a region that
// exists, and that bilateral muscles are drawn on both sides.
//
// The second check is the one that earns its keep. Two faults came over with
// the artwork: the right latissimus was filed under `midback`, so a lat
// exercise lit up half a back; and the back view's right calf carried a shape
// the left one did not, so a calf raise lit one leg and part of the other.
// Upstream measures the first and has it baselined as "known, tracked"; the
// second it never checks at all.
//
// Area rather than path count — one side legitimately drawn as two shapes and
// the other as one is fine, and counting would miss a sliver standing in for a
// whole muscle. The threshold is deliberately loose: hand-drawn artwork never
// mirrors exactly (the front calves differ by 24% purely in shape), while the
// faults this exists to catch were 88% and 46%.
const FIGURE_AXIS = 110.8;
const SYMMETRY_TOLERANCE = 30;

const figurePoints = (d: string): number[][] => {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const p: number[][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) p.push([n[i], n[i + 1]]);
  return p;
};
/** Shoelace. Every path is a closed polyline of M/L segments. */
const figureArea = (p: number[][]): number => {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const j = (i + 1) % p.length;
    a += p[i][0] * p[j][1] - p[j][0] * p[i][1];
  }
  return Math.abs(a) / 2;
};

const claimed = new Set(
  Object.values(BODY_REGIONS).flatMap((r) => [...(r.front ?? []), ...(r.back ?? [])]),
);

for (const [muscle, r] of Object.entries(BODY_REGIONS)) {
  for (const view of ['front', 'back'] as const) {
    for (const id of r[view] ?? []) {
      expect(`${muscle} -> ${view}.${id} exists`, FIGURE[view].regions[id] !== undefined, true);
    }
  }
}
// Every exercise must light something up, or its page shows a blank body.
for (const ex of EXERCISES) {
  const lit = ex.primary.flatMap((m) => [
    ...(BODY_REGIONS[m]?.front ?? []),
    ...(BODY_REGIONS[m]?.back ?? []),
  ]);
  expect(`${ex.id} highlights at least one region`, lit.length > 0, true);
}

for (const view of ['front', 'back'] as const) {
  for (const [id, paths] of Object.entries(FIGURE[view].regions)) {
    if (!claimed.has(id)) continue; // never rendered, so never seen
    let left = 0;
    let right = 0;
    for (const d of paths) {
      const pts = figurePoints(d);
      const xs = pts.map((q) => q[0]);
      const lo = Math.min(...xs);
      const hi = Math.max(...xs);
      // A single wide shape spanning the spine belongs to neither side.
      if (lo < FIGURE_AXIS && hi > FIGURE_AXIS && hi - lo > 20) continue;
      if ((lo + hi) / 2 < FIGURE_AXIS) left += figureArea(pts);
      else right += figureArea(pts);
    }
    if (left + right === 0) continue;
    const apart = (Math.abs(left - right) / Math.max(left, right)) * 100;
    expect(`${view}.${id} drawn on both sides`, apart < SYMMETRY_TOLERANCE, true);
  }
}

console.log('\n--- Log helpers ---');
expect('topKg', topKg(log('x', sets([[40, 8, 2], [45, 6, 1]]))), 45);
expect('totalReps', totalReps(log('x', sets([[40, 8, 2], [45, 6, 1]]))), 14);

console.log(`\n${failures === 0 ? '✓ all fixtures pass' : `✗ ${failures} failure(s)`}`);
process.exit(failures === 0 ? 0 : 1);
