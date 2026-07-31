// VO2 max estimation from field tests.
//
// Both are ESTIMATES. Field tests carry a standard error around 10-15%, so the
// trend across repeated tests is the signal — a single number is not. Every
// surface that shows a result must label it as estimated and show the band.
//
// Metric-only note: the published Rockport equation takes body mass in pounds.
// The coefficient is pre-converted here (0.0769 x 2.20462 = 0.16953 per kg) so
// that no imperial unit is ever stored, computed or displayed. Distance is
// stated as 1.61 km throughout, which is directly settable on a treadmill.

import type { Sex } from './types';

export const ROCKPORT_DISTANCE_KM = 1.61;
export const VO2_ERROR_PCT = 12; // midpoint of the 10-15% standard error band

/**
 * Rockport 1.61 km walk test. Submaximal and walking-based, so it is safe as a
 * first test for someone with no training history.
 *
 * @param timeMin minutes taken to cover 1.61 km at a hard but sustainable walk
 * @param hrBpm   heart rate immediately on finishing
 */
export function rockportVo2(
  weightKg: number,
  age: number,
  sex: Sex,
  timeMin: number,
  hrBpm: number,
): number {
  return (
    132.853 -
    0.16953 * weightKg -
    0.3877 * age +
    6.315 * (sex === 'male' ? 1 : 0) -
    3.2649 * timeMin -
    0.1565 * hrBpm
  );
}

/**
 * Cooper 12-minute test. Requires a genuinely maximal effort, so the cardio page
 * recommends holding it until week 6 — that is advisory copy, not a gate, and
 * nothing here enforces it. Fully metric.
 */
export function cooperVo2(metres: number): number {
  return (metres - 504.9) / 44.73;
}

export function vo2Band(vo2: number): { low: number; high: number } {
  const d = (vo2 * VO2_ERROR_PCT) / 100;
  return { low: vo2 - d, high: vo2 + d };
}

// Population norms, Cooper Institute Aerobics Center Longitudinal Study bands
// as commonly republished. Context only — the athlete competes against her own
// last result, and a single estimate carrying 12% error is a weak thing to rank
// anyone by.
//
// This used to be one table: women aged 20-29, applied to everybody. It was
// right for the one person the app was built for and silently wrong for anyone
// else — a 45-year-old man was rated against a chart that was not his.
//
// Note these are the integer bands, where the previous single row carried one
// decimal place. Two renderings of the same study circulate and they disagree
// at the boundary. Using ONE of them for every athlete matters more than the
// decimal: two clients ranked on different tables is a worse defect than a
// threshold sitting half a point away from another publication's.
//
// COVERAGE GAP, deliberate: 20-49 only, because that is what could be sourced
// and checked. Outside it this returns null and the caller says nothing rather
// than inventing a band. Wrong context is worse than no context, and the number
// itself — which is what the programme actually tracks — is unaffected.
const NORM_BANDS: { sex: Sex; minAge: number; maxAge: number; cuts: { label: string; min: number }[] }[] = [
  { sex: 'female', minAge: 20, maxAge: 29, cuts: [
    { label: 'Superior', min: 50 }, { label: 'Excellent', min: 44 },
    { label: 'Good', min: 40 }, { label: 'Fair', min: 36 }, { label: 'Poor', min: -Infinity } ] },
  { sex: 'female', minAge: 30, maxAge: 39, cuts: [
    { label: 'Superior', min: 46 }, { label: 'Excellent', min: 41 },
    { label: 'Good', min: 37 }, { label: 'Fair', min: 34 }, { label: 'Poor', min: -Infinity } ] },
  { sex: 'female', minAge: 40, maxAge: 49, cuts: [
    { label: 'Superior', min: 45 }, { label: 'Excellent', min: 39 },
    { label: 'Good', min: 35 }, { label: 'Fair', min: 32 }, { label: 'Poor', min: -Infinity } ] },
  { sex: 'male', minAge: 20, maxAge: 29, cuts: [
    { label: 'Superior', min: 56 }, { label: 'Excellent', min: 51 },
    { label: 'Good', min: 46 }, { label: 'Fair', min: 42 }, { label: 'Poor', min: -Infinity } ] },
  { sex: 'male', minAge: 30, maxAge: 39, cuts: [
    { label: 'Superior', min: 54 }, { label: 'Excellent', min: 48 },
    { label: 'Good', min: 44 }, { label: 'Fair', min: 41 }, { label: 'Poor', min: -Infinity } ] },
  { sex: 'male', minAge: 40, maxAge: 49, cuts: [
    { label: 'Superior', min: 53 }, { label: 'Excellent', min: 46 },
    { label: 'Good', min: 42 }, { label: 'Fair', min: 38 }, { label: 'Poor', min: -Infinity } ] },
];

export interface Vo2Rating {
  /** Superior / Excellent / Good / Fair / Poor. */
  label: string;
  /** The group being compared against, for display: "women aged 30–39". */
  cohort: string;
}

/**
 * Rates an estimate against the published band for THIS athlete's sex and age.
 *
 * Returns null when no sourced band covers them, which the caller must handle
 * by showing nothing. Do not fall back to a neighbouring band to fill the hole:
 * that is exactly the bug this replaced.
 */
export function classifyVo2(vo2: number, sex: Sex, age: number): Vo2Rating | null {
  const band = NORM_BANDS.find((b) => b.sex === sex && age >= b.minAge && age <= b.maxAge);
  if (!band) return null;
  return {
    label: band.cuts.find((c) => vo2 >= c.min)!.label,
    cohort: `${sex === 'male' ? 'men' : 'women'} aged ${band.minAge}–${band.maxAge}`,
  };
}

/** Percentage change between two estimates. Positive is an improvement. */
export function vo2Delta(from: number, to: number): number {
  if (from <= 0) return 0;
  return ((to - from) / from) * 100;
}

/**
 * Whether a change is larger than test noise. Below this, a difference between
 * two tests says nothing — reporting it as progress would be false precision.
 */
export function isMeaningfulChange(from: number, to: number): boolean {
  return Math.abs(vo2Delta(from, to)) > VO2_ERROR_PCT / 2;
}
