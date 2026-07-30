// Banker's rounding (round half to even). Used for ALL displayed kcal integers,
// BMR, TDEE, and goal targets.
export function bankersRound(x: number): number {
  if (!Number.isFinite(x)) return 0;
  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x);
  const floor = Math.floor(abs);
  const diff = abs - floor;
  const EPS = 1e-9;
  let rounded: number;
  if (Math.abs(diff - 0.5) < EPS) {
    rounded = floor % 2 === 0 ? floor : floor + 1;
  } else {
    rounded = Math.round(abs);
  }
  return sign * rounded;
}

export function round1(x: number): number {
  // 1 dp half-to-even on the first decimal
  return bankersRound(x * 10) / 10;
}
