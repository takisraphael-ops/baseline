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
  sex: 'female' | 'male',
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
 * Cooper 12-minute test. Requires a genuinely maximal effort, so it is gated to
 * week 6 and later. Fully metric.
 */
export function cooperVo2(metres: number): number {
  return (metres - 504.9) / 44.73;
}

export function vo2Band(vo2: number): { low: number; high: number } {
  const d = (vo2 * VO2_ERROR_PCT) / 100;
  return { low: vo2 - d, high: vo2 + d };
}

/**
 * Population norms, women aged 20-29 (Cooper Institute reference ranges).
 * Shown as context only — the athlete competes against her own last result.
 */
const NORMS_F_20_29: { label: string; min: number }[] = [
  { label: 'Superior', min: 49.7 },
  { label: 'Excellent', min: 44.0 },
  { label: 'Good', min: 39.5 },
  { label: 'Fair', min: 35.5 },
  { label: 'Poor', min: 31.6 },
  { label: 'Very poor', min: -Infinity },
];

export function classifyVo2(vo2: number): string {
  return NORMS_F_20_29.find((n) => vo2 >= n.min)!.label;
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
