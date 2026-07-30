// Every piece of gym vocabulary the app uses, defined once.
//
// This is the single source of truth for three things: the tap-to-explain
// popovers on every screen, the auto-linking of jargon inside Learn articles,
// and the glossary article itself (which is generated from this list, so it
// can never drift out of step with what the popovers say).
//
// `auto` is the important flag. Distinctive strings like "Zone 2" or
// "progressive overload" can be linked automatically wherever they appear in
// prose. Ordinary English words that happen to have a gym meaning — set, rep,
// block, volume, machine — cannot, because auto-linking every "set" would
// turn a paragraph into a minefield. Those are marked `auto: false` and get
// placed by hand, once, where she first meets them.

export type TermGroup = 'session' | 'programme' | 'cardio' | 'exercise';

export interface Term {
  id: string;
  /** How the term is written when the app renders it itself. */
  label: string;
  /** One or two sentences. Plain English, no second piece of jargon inside it. */
  short: string;
  group: TermGroup;
  /** Slug of the Learn article that covers this properly, if there is one. */
  more?: string;
  /** Extra spellings to match in prose. `label` is always matched. */
  aliases?: string[];
  /** Safe to link automatically in prose. Off for ordinary words. */
  auto?: boolean;
}

export const GROUP_LABELS: Record<TermGroup, string> = {
  session: 'On the session screen',
  programme: 'About the programme',
  cardio: 'On the cardio screen',
  exercise: 'On the exercise pages',
};

export const TERMS: Term[] = [
  // ---------------------------------------------------------------- session
  {
    id: 'rep',
    label: 'Rep',
    short: 'One repetition. Lifting the weight and lowering it once.',
    group: 'session',
  },
  {
    id: 'set',
    label: 'Set',
    short: 'A group of reps done back to back, then a rest. "3 × 10" means three sets of ten reps.',
    group: 'session',
  },
  {
    id: 'primer',
    label: 'Primer',
    short:
      'One or two deliberately light sets at the start, to find the muscle before you load it. Not meant to be hard, and never counted.',
    group: 'session',
    more: 'pre-exhaustion',
  },
  {
    id: 'main-lift',
    label: 'Main lift',
    short: 'The most important exercise of the session, done while you are freshest.',
    group: 'session',
  },
  {
    id: 'accessory',
    label: 'Accessory',
    short: 'Supporting work after the main lifts. Smaller muscles, usually a bit lighter.',
    group: 'session',
  },
  {
    id: 'finisher',
    label: 'Finisher',
    short: 'The last exercise for a muscle, done when you are already tired.',
    group: 'session',
  },
  {
    id: 'superset',
    label: 'Superset',
    short:
      'Two exercises done back to back with no rest between them. Yours pair opposite muscles, so each one rests while the other works — which saves you time for free.',
    group: 'session',
    more: 'supersets',
    aliases: ['supersets', 'superset them', 'supersetted'],
    auto: true,
  },
  {
    id: 'drop-set',
    label: 'Drop set',
    short:
      'Take a set close to your limit, immediately strip 20 to 30% of the weight, and keep going without resting. A way to make a muscle work past where it would normally stop.',
    group: 'session',
    more: 'drop-sets',
    aliases: ['drop sets', 'dropset', 'dropsets'],
    auto: true,
  },
  {
    id: 'ramp-up-sets',
    label: 'Ramp-up sets',
    short:
      'Light rehearsal sets before your first real one — roughly half the weight, then 70%, then 85%. Never logged, never counted.',
    group: 'session',
    more: 'warming-up',
    aliases: ['ramp-up set', 'ramp up sets', 'warm-up sets'],
    auto: true,
  },
  {
    id: 'movement-prep',
    label: 'Movement prep',
    short:
      'Three minutes of drills that open the specific joints you are about to load. Different from a walk, which only warms you up in general.',
    group: 'session',
    more: 'warming-up',
    auto: true,
  },
  {
    id: 'hard-set',
    label: 'Hard set',
    short:
      'A working set taken close to your limit. The count of these per week is the number that predicts whether muscle gets built — not calories burned.',
    group: 'session',
    more: 'progressive-overload',
    aliases: ['hard sets'],
    auto: true,
  },
  {
    id: 'rir',
    label: 'Reps in reserve',
    short:
      'How many more reps you could have done if someone made you. Stopping with about 2 in reserve is the target — hard, but not to failure.',
    group: 'session',
    more: 'rir',
    aliases: ['RIR'],
    auto: true,
  },
  {
    id: 'pre-exhaustion',
    label: 'Pre-exhaustion',
    short:
      'Tiring a muscle with an isolation exercise immediately before a big lift that uses it. A real technique, but it makes you weaker on the lift that matters, so it waits until week 9.',
    group: 'session',
    more: 'pre-exhaustion',
    aliases: ['pre-exhausting', 'pre-exhaust', 'pre-exhausted'],
    auto: true,
  },

  // -------------------------------------------------------------- programme
  {
    id: 'block',
    label: 'Block',
    short:
      'A four-week chunk of the twelve. Each one has a different job, and new techniques unlock as you reach it.',
    group: 'programme',
  },
  {
    id: 'deload',
    label: 'Deload',
    short:
      'A deliberately easier week — same weights, about 40% fewer sets — so your body catches up and comes back stronger. Not a week off.',
    group: 'programme',
    more: 'deloads',
    aliases: ['deloads', 'deloaded', 'deload week', 'deloading'],
    auto: true,
  },
  {
    id: 'progressive-overload',
    label: 'Progressive overload',
    short:
      'Doing slightly more than last time — one more rep, or a little more weight. The single idea the whole plan runs on.',
    group: 'programme',
    more: 'progressive-overload',
    auto: true,
  },
  {
    id: 'double-progression',
    label: 'Double progression',
    short:
      'The method behind your targets. Add reps until you hit the top of the range on every set, then add weight and drop back to the bottom. The app does this for you.',
    group: 'programme',
    more: 'progressive-overload',
    auto: true,
  },
  {
    id: 'volume',
    label: 'Volume',
    short: 'How many hard sets a muscle gets in a week. More is better, up to a point.',
    group: 'programme',
    more: 'progressive-overload',
  },
  {
    id: 'stall',
    label: 'Stall',
    short:
      'Two sessions in a row on a lift with no progress. When it happens the app drops that one lift back and builds it up again — it does not wait for a deload week.',
    group: 'programme',
    more: 'deloads',
    aliases: ['stalls', 'stalled', 'stalling'],
    auto: true,
  },

  // ----------------------------------------------------------------- cardio
  {
    id: 'zone-2',
    label: 'Zone 2',
    short:
      'Easy aerobic effort. You can hold a conversation in full sentences, but would not want to sing. It builds the base everything else runs on.',
    group: 'cardio',
    more: 'zone-2',
    auto: true,
  },
  {
    id: 'zone-4-5',
    label: 'Zones 4 and 5',
    short: 'Hard, and very hard. A few words at a time, then none. Where intervals live.',
    group: 'cardio',
    more: 'vo2-max',
    aliases: ['zone 4 and 5', 'zone 4', 'zone 5'],
    auto: true,
  },
  {
    id: 'intervals',
    label: 'Intervals',
    short:
      'Short hard efforts with easy recovery between them. The thing that actually raises VO2 max — steady easy work does not.',
    group: 'cardio',
    more: 'vo2-max',
    aliases: ['interval'],
    auto: true,
  },
  {
    id: 'vo2-max',
    label: 'VO2 max',
    short:
      'The most oxygen your body can use per minute when working flat out — the size of your aerobic engine, and the best single measure of cardio fitness. Estimated here, never measured exactly.',
    group: 'cardio',
    more: 'vo2-max',
    aliases: ['VO2max', 'VO₂ max'],
    auto: true,
  },
  {
    id: 'talk-test',
    label: 'Talk test',
    short:
      'Judging your effort by how easily you can speak. More reliable than any number on a screen — when the two disagree, the talk test wins.',
    group: 'cardio',
    more: 'zone-2',
    auto: true,
  },
  {
    id: 'resting-heart-rate',
    label: 'Resting heart rate',
    short:
      'Your pulse on waking, before you get up. Used to work out your zones, and it drops as your fitness improves.',
    group: 'cardio',
    aliases: ['resting pulse'],
    auto: true,
  },
  {
    id: 'max-heart-rate',
    label: 'Maximum heart rate',
    short:
      'The fastest your heart can beat. Estimated from your age, and the estimate is wrong by 10 to 12 beats for most people — which is why the talk test comes first.',
    group: 'cardio',
    more: 'zone-2',
    aliases: ['max heart rate'],
    auto: true,
  },
  {
    id: 'heart-rate-reserve',
    label: 'Heart-rate reserve',
    short:
      'The gap between your resting and maximum heart rate. Zones worked out from this fit you better than zones taken as a flat share of maximum.',
    group: 'cardio',
    aliases: ['heart rate reserve'],
    auto: true,
  },
  {
    id: 'rockport',
    label: 'Walk test',
    short:
      'Walk 1.61 km as fast as you can sustain, then record your time and heart rate. Gives a VO2 max estimate without ever going flat out. Also called the Rockport test.',
    group: 'cardio',
    more: 'vo2-max',
    aliases: ['Rockport test', 'Rockport walk test', 'Rockport'],
    auto: true,
  },
  {
    id: 'cooper-test',
    label: 'Cooper test',
    short:
      'Cover as much distance as you can in exactly twelve minutes. Sharper than the walk test, but it needs a genuinely maximal effort — save it for week 6 or later.',
    group: 'cardio',
    more: 'vo2-max',
    aliases: ['12-minute test'],
    auto: true,
  },
  {
    id: 'norwegian-4x4',
    label: 'Norwegian 4×4',
    short:
      'Four minutes near your maximum, three minutes easy, four times through. The best-established way to raise VO2 max — which is why the intervals build towards it.',
    group: 'cardio',
    more: 'vo2-max',
    aliases: ['4×4', '4x4'],
    auto: true,
  },
  {
    id: 'interference-effect',
    label: 'Interference effect',
    short:
      'Hard cardio done immediately before lifting measurably reduces what you get from the lifting. The reverse order costs you almost nothing — which is why cardio always comes last here.',
    group: 'cardio',
    more: 'lift-before-cardio',
    auto: true,
  },

  // --------------------------------------------------------------- exercise
  {
    id: 'machine',
    label: 'Machine',
    short:
      'A fixed-path piece of equipment. The path is chosen for you, so you can push hard without also having to balance the weight. This is why you start here.',
    group: 'exercise',
    more: 'machines-vs-free-weights',
  },
  {
    id: 'cable',
    label: 'Cable',
    short: 'A weight stack pulled through a pulley. Keeps tension on the muscle the whole way through the rep.',
    group: 'exercise',
  },
  {
    id: 'free-weight',
    label: 'Free weight',
    short:
      'Dumbbells and barbells. Nothing guides the path, so you balance it yourself — more useful in the long run, harder to learn.',
    group: 'exercise',
    more: 'machines-vs-free-weights',
    aliases: ['free weights'],
  },
  {
    id: 'compound',
    label: 'Compound',
    short: 'A movement using several joints and muscles at once, like a leg press.',
    group: 'exercise',
    more: 'machines-vs-free-weights',
    aliases: ['compound lift', 'compound movement', 'compound exercise'],
    auto: true,
  },
  {
    id: 'isolation',
    label: 'Isolation',
    short: 'A movement using one joint, targeting one muscle, like a leg extension.',
    group: 'exercise',
    aliases: ['isolation exercise', 'isolation work', 'isolation movement'],
  },
  {
    id: 'eccentric',
    label: 'Eccentric',
    short: 'The lowering half of a rep. Slowing it down makes the same weight harder, at no extra cost.',
    group: 'exercise',
    aliases: ['eccentrics'],
    auto: true,
  },
  {
    id: 'ladder',
    label: 'Ladder',
    short:
      'The order to learn a movement in, from the machine version up to the free-weight one. You move up a rung when you have earned it, not on a date.',
    group: 'exercise',
    more: 'machines-vs-free-weights',
  },
];

const BY_ID = new Map(TERMS.map((t) => [t.id, t]));

export function getTerm(id: string): Term | undefined {
  return BY_ID.get(id);
}

/** Every spelling that should resolve to a term, longest first so "Zone 2" beats "zone". */
const MATCHABLE: { pattern: string; id: string }[] = TERMS.filter((t) => t.auto)
  .flatMap((t) => [t.label, ...(t.aliases ?? [])].map((pattern) => ({ pattern, id: t.id })))
  .sort((a, b) => b.pattern.length - a.pattern.length);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * One regex matching any auto-linkable term. Built once at module load.
 *
 * `\b` on its own is not enough at the tail: "interval" would match inside
 * "intervals" and leave a stray "s", so the trailing boundary is an explicit
 * lookahead for a non-word character.
 */
export const TERM_PATTERN = new RegExp(
  `\\b(${MATCHABLE.map((m) => escape(m.pattern)).join('|')})(?![\\w-])`,
  'gi',
);

const BY_PATTERN = new Map(MATCHABLE.map((m) => [m.pattern.toLowerCase(), m.id]));

export function termIdForMatch(match: string): string | undefined {
  return BY_PATTERN.get(match.toLowerCase());
}

/**
 * Resolves a piece of UI text to a term. Unlike the prose matcher this searches
 * every term, `auto` or not — the caller has already decided this string is a
 * term, so the ambiguity that rules out auto-linking does not apply.
 */
const BY_LABEL = new Map(
  TERMS.flatMap((t) => [t.label, ...(t.aliases ?? [])].map((s) => [s.toLowerCase(), t.id] as const)),
);

export function termIdForLabel(label: string): string | undefined {
  return BY_LABEL.get(label.trim().toLowerCase());
}

/**
 * Resolves a short label that *contains* a term as well as one that is a term:
 * the unlock chips read "Antagonist supersets" and "Same-muscle supersets", and
 * both should open the superset explanation.
 */
export function termIdInLabel(label: string): string | undefined {
  const exact = termIdForLabel(label);
  if (exact) return exact;
  for (const m of label.matchAll(TERM_PATTERN)) {
    const id = termIdForMatch(m[0]);
    if (id) return id;
  }
  return undefined;
}

/**
 * Works out, for an ordered run of strings, which terms have already been
 * linked by the time each one renders — so a term is linked once per article
 * rather than once per paragraph.
 *
 * Returned as skip lists rather than applied in place, because the alternative
 * (a mutable set shared across components during render) silently links nothing
 * at all under React's development double-render.
 */
export function firstUseSkips(strings: string[], initial: string[] = []): string[][] {
  const used = new Set(initial);
  return strings.map((s) => {
    const before = [...used];
    for (const m of s.matchAll(TERM_PATTERN)) {
      const id = termIdForMatch(m[0]);
      if (id) used.add(id);
    }
    return before;
  });
}
