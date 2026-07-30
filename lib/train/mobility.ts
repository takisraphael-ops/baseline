// Movement prep, ramp-up sets, and the cool-down.
//
// The session used to say "five minutes of specific prep" and then leave her to
// work out what that meant — which is the same failure as telling someone to
// "use the leg press" without saying which lever moves the seat.
//
// Two different jobs, deliberately separated:
//
//   Movement prep  opens the joints the session is about to load. Nothing here
//                  is tiring; if a drill leaves her out of breath it is wrong.
//   Ramp-up sets   rehearse the actual lift at rising loads. This is where the
//                  nervous system gets ready, and it is the part beginners skip
//                  because the light sets feel pointless.
//
// The cool-down is short and honest about what it does: it will not prevent
// soreness — nothing reliably does — but it feels good, it gets her breathing
// down before the walk home, and it keeps range at joints that lifting shortens.

export interface Drill {
  name: string;
  /** Reps, or a hold in seconds, written for a human. */
  dose: string;
  how: string;
  /** What it buys her in the session about to happen. */
  why: string;
  /**
   * Search that backs the demo link. A search never 404s, which matters more
   * than precision here — "90/90 hip switches" is impossible to picture from
   * words alone, and a dead link is worse than a results page.
   */
  videoSearch: string;
  /** A specific clip, once one has been verified. Empty means "use the search". */
  videoUrl?: string;
}

const ANKLE: Drill = {
  name: 'Ankle rocks',
  dose: '10 each side',
  how: 'Stand a foot from a wall, step one foot back. Drive the front knee forward over the toes until it touches the wall, heel glued to the floor. Rock in and out.',
  why: 'Ankle range is what lets you reach depth on the leg press and squat without your heels lifting.',
  videoSearch: 'ankle mobility knee to wall drill',
};

const HIP_90: Drill = {
  name: '90/90 hip switches',
  dose: '8 each side',
  how: 'Sit on the floor, both knees bent to right angles, one leg in front and one out to the side. Keeping your chest tall, rotate both knees over to the other side.',
  why: 'Opens the hips in both directions, so the squat and split squat stop feeling pinched.',
  videoSearch: '90 90 hip switches mobility drill',
};

const GLUTE_BRIDGE: Drill = {
  name: 'Glute bridge',
  dose: '15 reps',
  how: 'On your back, knees bent, feet flat. Push through your heels and lift your hips until your body is straight. Squeeze hard for one second at the top, then lower.',
  why: 'Wakes the glutes so they lead the hip thrust and the RDL instead of your lower back taking over.',
  videoSearch: 'glute bridge exercise proper form',
};

const BW_SQUAT: Drill = {
  name: 'Slow bodyweight squat',
  dose: '10 reps',
  how: 'Feet shoulder width, arms out in front. Three seconds down, pause at the bottom, stand up. No weight at all.',
  why: 'Rehearses the pattern and tells you what your depth is today before there is load on it.',
  videoSearch: 'slow bodyweight squat tempo form',
};

const CAT_COW: Drill = {
  name: 'Cat–cow',
  dose: '8 slow rounds',
  how: 'On all fours. Round your back to the ceiling, then let it sag and lift your chest. Move one vertebra at a time.',
  why: 'Gets the spine moving before you hinge, which is the movement it least likes to do cold.',
  videoSearch: 'cat cow exercise how to',
};

const HINGE_GROOVE: Drill = {
  name: 'Hip hinge, no weight',
  dose: '10 reps',
  how: 'Hands on the crease of your hips. Push your hips backwards, letting your chest come down, knees softly bent and unchanging. Stand up by squeezing your glutes.',
  why: 'The Romanian deadlift is the hardest pattern to learn. Ten free reps first is the difference between feeling it in your hamstrings and feeling it in your back.',
  videoSearch: 'hip hinge drill no weight beginner',
};

const ARM_SWINGS: Drill = {
  name: 'Arm circles',
  dose: '10 each direction',
  how: 'Big, slow circles forward, then backward. Let the shoulder blade move with the arm rather than holding it still.',
  why: 'Gets blood into the shoulder before you press anything overhead.',
  videoSearch: 'arm circles shoulder warm up',
};

const WALL_SLIDES: Drill = {
  name: 'Wall slides',
  dose: '10 reps',
  how: 'Back against a wall, elbows and wrists touching it. Slide your arms up overhead and back down, keeping every point in contact. It is harder than it sounds.',
  why: 'Teaches the shoulder blade to rotate properly, which is what keeps the shoulder press comfortable.',
  videoSearch: 'wall slides shoulder exercise form',
};

const OPEN_BOOK: Drill = {
  name: 'Open book',
  dose: '8 each side',
  how: 'Lie on your side, knees bent in front of you, arms stacked out straight. Keeping your knees down, sweep the top arm across and open your chest to the ceiling. Follow your hand with your eyes.',
  why: 'Rotates the upper back, which is what a day at a desk takes away and every pressing movement wants back.',
  videoSearch: 'open book thoracic rotation stretch',
};

const PULL_APART: Drill = {
  name: 'Band pull-apart',
  dose: '15 reps',
  how: 'A light band held at chest height, arms straight. Pull your hands apart until the band touches your chest, squeezing the shoulder blades. No band? Do the same motion against light cable or just squeeze.',
  why: 'Switches the upper back on before it has to hold your shoulders in place under load.',
  videoSearch: 'band pull apart proper form',
};

// --------------------------------------------------------------- cool-down

const PEC_STRETCH: Drill = {
  name: 'Doorway chest stretch',
  dose: '30 seconds each side',
  how: 'Forearm on a doorframe, elbow at shoulder height. Step through gently until you feel a stretch across the front of the chest.',
  why: 'Opens what pressing tightens.',
  videoSearch: 'doorway chest stretch how to',
};

const COUCH_STRETCH: Drill = {
  name: 'Kneeling quad stretch',
  dose: '30 seconds each side',
  how: 'Half kneeling, back foot up on a bench behind you. Tuck your hips under and stand tall until the front of the back thigh stretches.',
  why: 'The quads shorten under a session of leg press. This gives the length back.',
  videoSearch: 'kneeling hip flexor quad stretch',
};

const HAMSTRING: Drill = {
  name: 'Hamstring stretch',
  dose: '30 seconds each side',
  how: 'One heel on a low bench, leg straight. Hinge forward from the hips with a flat back until you feel it behind the knee.',
  why: 'Keeps the range you need to hinge properly next session.',
  videoSearch: 'standing hamstring stretch on bench',
};

const FIGURE_4: Drill = {
  name: 'Figure-four glute stretch',
  dose: '30 seconds each side',
  how: 'On your back, cross one ankle over the opposite knee, then pull that knee towards your chest.',
  why: 'Settles the glutes down after hip thrusts.',
  videoSearch: 'figure four glute stretch lying down',
};

const CHILDS_POSE: Drill = {
  name: "Child's pose",
  dose: '45 seconds',
  how: 'Kneel, sit back on your heels, walk your hands forward and let your chest sink. Breathe slowly through your nose.',
  why: 'Gets your breathing down before you walk home. That is the actual point of a cool-down.',
  videoSearch: 'childs pose stretch how to',
};

/**
 * Where a drill's Watch link points. Same truthiness rule as the exercise
 * library: `videoUrl` unset or empty means fall back to the search, because an
 * href of "" is a link to nowhere that fails silently when tapped.
 */
export function drillDemoUrl(d: Drill): string {
  return d.videoUrl && d.videoUrl.trim() !== ''
    ? d.videoUrl
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(d.videoSearch)}`;
}

export interface Prep {
  warmUp: Drill[];
  coolDown: Drill[];
}

const LOWER_A: Prep = {
  warmUp: [ANKLE, HIP_90, GLUTE_BRIDGE, BW_SQUAT],
  coolDown: [COUCH_STRETCH, FIGURE_4, CHILDS_POSE],
};

const LOWER_B: Prep = {
  warmUp: [CAT_COW, HIP_90, GLUTE_BRIDGE, HINGE_GROOVE],
  coolDown: [HAMSTRING, FIGURE_4, CHILDS_POSE],
};

const UPPER: Prep = {
  warmUp: [ARM_SWINGS, OPEN_BOOK, WALL_SLIDES, PULL_APART],
  coolDown: [PEC_STRETCH, OPEN_BOOK, CHILDS_POSE],
};

const BY_SESSION: Record<string, Prep> = {
  'lower-a': LOWER_A,
  'upper-a': UPPER,
  'lower-b': LOWER_B,
  'upper-b': UPPER,
};

export function prepFor(sessionId: string): Prep {
  return BY_SESSION[sessionId] ?? UPPER;
}

export interface RampSet {
  kg: number;
  reps: number;
  note: string;
}

/**
 * Ramp-up sets for the main lift, at roughly 50 / 70 / 85 percent of the working
 * weight. These are rehearsal, not work — they are never logged and never count
 * toward weekly volume.
 *
 * Light working weights get one ramp set rather than three: stacking three
 * rehearsals onto a 15 kg lift is more faff than it is worth.
 */
export function rampSets(workingKg: number, incrementKg: number): RampSet[] {
  if (workingKg <= 0) {
    return [{ kg: 0, reps: 8, note: 'A slow set of the movement with no weight.' }];
  }
  const inc = incrementKg > 0 ? incrementKg : 2.5;
  const round = (x: number) => Math.max(inc, Math.round(x / inc) * inc);

  if (workingKg <= inc * 4) {
    return [{ kg: round(workingKg * 0.5), reps: 8, note: 'One easy set to feel the movement.' }];
  }
  // Each step is rounded to the equipment's own increment, and at low working
  // weights two of them can round to the same plate — a 25 kg leg press asked
  // for 50/70/85% gives 15, 20, 20, which reads as a misprint on the warm-up
  // screen. Keep only steps that actually climb, and that stay short of the
  // working weight; rounding up instead would let the last one land exactly on
  // it, which is not a warm-up.
  const candidates = [
    { kg: round(workingKg * 0.5), reps: 8, note: 'Easy. Just moving.' },
    { kg: round(workingKg * 0.7), reps: 5, note: 'Starting to feel like something.' },
    { kg: round(workingKg * 0.85), reps: 3, note: 'Almost your working weight. Then rest properly and begin.' },
  ];
  const ramp: typeof candidates = [];
  for (const step of candidates) {
    if (step.kg >= workingKg) continue;
    if (ramp.length > 0 && step.kg <= ramp[ramp.length - 1].kg) continue;
    ramp.push(step);
  }
  // Whichever step ends up last carries the instruction to start the real work.
  const last = ramp[ramp.length - 1];
  if (last) last.note = 'Almost your working weight. Then rest properly and begin.';
  return ramp;
}
