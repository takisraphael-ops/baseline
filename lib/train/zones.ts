// Heart-rate zones. Pure math.
//
// Max HR uses Tanaka (208 - 0.7 x age) rather than the familiar 220 - age.
// 220 - age carries a standard deviation of 10-12 bpm and is systematically
// wrong for younger adults; Tanaka is the better-validated replacement.
//
// Bands use Karvonen (percentage of heart-rate RESERVE), which accounts for
// resting HR and so tracks perceived effort far better than a flat percentage
// of max. Cardio machines almost always display percentage of MAX instead,
// so both are exposed — a mismatch between the two is the single most common
// way a beginner ends up training at the wrong intensity.

export interface Zone {
  n: 1 | 2 | 3 | 4 | 5;
  name: string;
  hrrLow: number;
  hrrHigh: number;
  bpmLow: number;
  bpmHigh: number;
  /** Same band expressed as a share of max HR — what a treadmill console shows. */
  pctMaxLow: number;
  pctMaxHigh: number;
  talkTest: string;
  rpe: string;
}

export function maxHrTanaka(age: number): number {
  return 208 - 0.7 * age;
}

export function heartRateReserve(age: number, restingHr: number): number {
  return maxHrTanaka(age) - restingHr;
}

/** Karvonen: target = resting + fraction x (max - resting). */
export function karvonen(age: number, restingHr: number, fraction: number): number {
  return restingHr + fraction * heartRateReserve(age, restingHr);
}

const BANDS: { n: 1 | 2 | 3 | 4 | 5; name: string; low: number; high: number; talkTest: string; rpe: string }[] = [
  { n: 1, name: 'Recovery',    low: 0.50, high: 0.60, talkTest: 'Full conversation, no effort to speak.', rpe: '2-3 / 10' },
  { n: 2, name: 'Aerobic base', low: 0.60, high: 0.70, talkTest: 'Full sentences, but you would not want to sing.', rpe: '3-4 / 10' },
  { n: 3, name: 'Tempo',        low: 0.70, high: 0.80, talkTest: 'Short sentences only.', rpe: '5-6 / 10' },
  { n: 4, name: 'Threshold',    low: 0.80, high: 0.90, talkTest: 'A few words at a time.', rpe: '7-8 / 10' },
  { n: 5, name: 'VO2 max',      low: 0.90, high: 1.00, talkTest: 'Cannot speak.', rpe: '9-10 / 10' },
];

export function zones(age: number, restingHr: number): Zone[] {
  const max = maxHrTanaka(age);
  return BANDS.map((b) => {
    const bpmLow = karvonen(age, restingHr, b.low);
    const bpmHigh = karvonen(age, restingHr, b.high);
    return {
      n: b.n,
      name: b.name,
      hrrLow: Math.round(b.low * 100),
      hrrHigh: Math.round(b.high * 100),
      bpmLow: Math.round(bpmLow),
      bpmHigh: Math.round(bpmHigh),
      pctMaxLow: Math.round((bpmLow / max) * 100),
      pctMaxHigh: Math.round((bpmHigh / max) * 100),
      talkTest: b.talkTest,
      rpe: b.rpe,
    };
  });
}

export function zone(age: number, restingHr: number, n: 1 | 2 | 3 | 4 | 5): Zone {
  return zones(age, restingHr)[n - 1];
}

/**
 * Classify a measured heart rate into a zone. Returns null below zone 1 —
 * a walk that lands here is recovery, not training, and the app says so
 * rather than silently rounding it up.
 */
export function classifyHr(age: number, restingHr: number, bpm: number): Zone | null {
  const zs = zones(age, restingHr);
  if (bpm < zs[0].bpmLow) return null;
  for (const z of zs) if (bpm <= z.bpmHigh) return z;
  return zs[4];
}
