// The Learn section. Plain English, no jargon without a definition, and every
// article answers "why would I do this?" before "how do I do it?".
//
// Techniques are explained the moment she is curious and unlocked on a
// schedule. Understanding early, using later.

import { GROUP_LABELS, TERMS } from './glossary';
import type { TermGroup } from './glossary';

export interface Article {
  slug: string;
  title: string;
  oneLiner: string;
  /** Week this technique becomes part of the programme. Omitted for concepts that always apply. */
  unlocksWeek?: number;
  body: { h?: string; p?: string[]; list?: string[] }[];
}

/**
 * The glossary page is built from the same list that powers the tap-to-explain
 * popovers, so a definition can only ever be written once. Editing a term
 * updates the popover and this page together.
 */
function glossarySections(): Article['body'] {
  const groups: TermGroup[] = ['session', 'programme', 'cardio', 'exercise'];
  return [
    {
      p: [
        'Gyms have a lot of vocabulary, and most of it is never explained to anyone. Nothing here is complicated once someone says it plainly.',
        'You should not need this page often — every one of these words is tappable wherever it appears in the app, and tapping it gives you the same definition without losing your place.',
      ],
    },
    ...groups.map((g) => ({
      h: GROUP_LABELS[g],
      list: TERMS.filter((t) => t.group === g).map((t) => `${t.label} — ${lowerFirst(t.short)}`),
    })),
  ];
}

/** "Easy aerobic effort." reads wrong after an em dash; "easy aerobic effort." does not. */
function lowerFirst(s: string): string {
  // Leave acronyms and proper nouns alone — "VO2", "Rockport", "Four minutes"
  // is fine but "VO2 max" must not become "vO2 max".
  const first = s.split(' ')[0];
  if (first.length > 1 && first[1] === first[1].toUpperCase() && /[A-Z]/.test(first[1])) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export const ARTICLES: Article[] = [
  {
    slug: 'glossary',
    title: 'Every word this app uses',
    oneLiner: 'One page. If a term on any screen is unfamiliar, it is defined here.',
    body: glossarySections(),
  },
  {
    slug: 'what-toned-means',
    title: 'What "toned" actually means',
    oneLiner: 'There is no toning tissue. Toned is muscle you can see.',
    body: [
      {
        p: [
          'This one matters more than anything else here, because it decides whether the rest of the plan makes sense to you.',
          'There is no such thing as a "toning" tissue. Your body has muscle, and it has fat on top of it. When people say someone looks toned, they mean two things are true at once: there is enough muscle to have a shape, and there is little enough fat on top for that shape to show.',
        ],
      },
      {
        h: 'Which means two jobs, not one',
        p: [
          'Build muscle. That comes from lifting progressively heavier weights over months. There is no other route.',
          'Keep body fat moderate. That comes from how you eat, and you already have this handled — it is why you are in good shape now.',
        ],
      },
      {
        h: 'So the missing half is the lifting',
        p: [
          'Dieting alone gets you smaller. It does not give you shape, because there is no extra muscle underneath to reveal. That is the gap this programme fills.',
        ],
      },
      {
        h: 'And no, you will not get bulky',
        p: [
          'This is the fear that keeps people using weights so light they achieve nothing, for years.',
          'A woman training naturally and eating at roughly maintenance builds muscle slowly. Slowly is the only speed available to you. The visible result of two solid years of hard training is exactly the thing you are calling "toned".',
          'You cannot accidentally overshoot. Nobody has ever woken up too muscular by surprise. If you ever decided you had built more than you wanted, it takes months of not training to lose it. You have an enormous amount of runway, and no risk to manage.',
        ],
      },
    ],
  },
  {
    slug: 'progressive-overload',
    title: 'Progressive overload',
    oneLiner: 'Your body only changes when you ask it to do something it has not done before.',
    body: [
      {
        p: [
          'Muscle is expensive for your body to build and to carry. It will not build any unless there is a reason. Doing the same workout with the same weights for the same reps is not a reason — after a few weeks your body has already handled that, and it stops adapting.',
          'Progressive overload just means: do slightly more than last time. That is the entire principle. Everything else in this app exists to make it happen automatically.',
        ],
      },
      {
        h: 'What "more" can mean',
        list: [
          'More reps at the same weight',
          'The same reps at a heavier weight',
          'An extra set',
          'The same set with a slower, more controlled lowering',
          'The same set with better technique and less momentum',
        ],
      },
      {
        h: 'The method: double progression',
        p: [
          'Each exercise has a rep range, say 8 to 12. You pick a weight you can do 8 solid reps with.',
          'Each session you try to add a rep. When you can do 12 on every set with something left in the tank, the weight goes up and you drop back to 8. Then it starts again.',
          'You never have to decide any of this. The app looks at what you did last time and tells you the target before you start the set.',
        ],
      },
      {
        h: 'Why it feels too slow',
        p: [
          'One extra rep a week sounds like nothing. Over twelve weeks it is the difference between lifting 20 kg for 8 and lifting 35 kg for 12. That is a completely different body.',
          'The people who get results are not the ones training hardest on any given day. They are the ones who added a rep, boringly, for a year.',
        ],
      },
    ],
  },
  {
    slug: 'rir',
    title: 'How hard is hard enough',
    oneLiner: 'Reps in reserve: how many more you could have done.',
    body: [
      {
        p: [
          'The most common reason a beginner sees no results is not doing too much. It is stopping a set well before it got hard, because nothing told them where hard was.',
          'RIR means "reps in reserve" — how many more reps you could have done if someone had made you. Finishing a set with 2 RIR means you could have managed roughly two more.',
        ],
      },
      {
        h: 'What each number feels like',
        list: [
          '4 RIR — comfortably hard. You could clearly do several more. This is where priming sets live.',
          '3 RIR — getting hard. The bar speed is still fast.',
          '2 RIR — hard. The last rep slowed down noticeably. This is the working target.',
          '1 RIR — very hard. One more, maybe.',
          '0 RIR — failure. You physically could not do another.',
        ],
      },
      {
        h: 'Why not just go to failure every set?',
        p: [
          'Because failure costs far more in recovery than it returns in stimulus. A set at 2 RIR builds almost exactly as much muscle as a set at 0 RIR, and leaves you able to train hard again in two days rather than four.',
          'Beginners also cannot judge their own limit accurately yet — most people who think they are at failure have three reps left. Yours will get calibrated over the first month, and the app will nudge you when your numbers look off.',
        ],
      },
      {
        h: 'How this ramps',
        list: [
          'Weeks 1-2: leave 3-4 in reserve. You are learning movements, not chasing fatigue.',
          'Weeks 3-4: leave 2-3.',
          'Weeks 5-8: leave 2. This is the sweet spot.',
          'Weeks 9-12: leave 1-2, and only on the last set of an exercise.',
        ],
      },
    ],
  },
  {
    slug: 'machines-vs-free-weights',
    title: 'Why start on machines',
    oneLiner: 'Machines fix the path so you can learn to push hard. Free weights come after.',
    body: [
      {
        p: [
          'There is a snobbery about machines that is worth ignoring for the next three months.',
          'A barbell squat asks you to do two things simultaneously: produce force with your legs, and balance a loaded bar while your body works out a movement it has never done. When you are new, the balance problem is the limit. You stop the set because you feel wobbly, not because your legs are done — so your legs never get the message that they need to grow.',
          'A leg press removes the balance problem entirely. All that is left is pushing hard. That is what builds the base.',
        ],
      },
      {
        h: 'What machines are genuinely better at',
        list: [
          'Letting you go close to failure safely, with no spotter and nothing to drop',
          'Teaching you what a specific muscle feels like when it works',
          'Being repeatable — same seat setting, same path, so the numbers actually compare week to week',
          'Being far less intimidating, which means you use them, which is the whole point',
        ],
      },
      {
        h: 'What free weights are better at',
        list: [
          'Training the stabilising muscles that hold you together',
          'Carrying over into ordinary life — lifting, carrying, sport',
          'Far more room to keep progressing over years',
        ],
      },
      {
        h: 'So the order is',
        p: [
          'Machines to build the base and learn the pattern. Then the free-weight version of the same pattern, once you can load it properly.',
          'Every exercise in the library shows its ladder — where it sits and what comes next. You move up a rung when you can hit the top of the rep range on every set with clean technique, not on a date.',
        ],
      },
    ],
  },
  {
    slug: 'lift-before-cardio',
    title: 'Why lifting comes before cardio',
    oneLiner: 'Hard cardio first measurably blunts the strength work. The other order costs you almost nothing.',
    body: [
      {
        p: [
          'Doing both in one session is efficient, and it is the right call given four trips a week. The order is not optional though.',
          'There is a well-documented interference effect: doing significant cardio immediately before lifting reduces the strength and muscle you get from that lifting. Your legs arrive at the leg press already tired, you use less weight, and less weight is less signal to grow.',
          'Doing the cardio afterwards causes far less interference. Zone 2 specifically is the least disruptive intensity there is.',
        ],
      },
      {
        h: 'So every session runs',
        list: [
          'Walk in — general warm-up, and free training volume',
          'Five minutes of specific prep and ramp-up sets',
          'The lifting, hardest work first while you are fresh',
          'Cardio finisher',
          'Walk home — cool-down',
        ],
      },
      {
        h: 'One exception worth knowing',
        p: [
          'Hard intervals go on an upper-body day, never after legs. Your legs do the intervals, and they have already worked on lower days. This is why the interval session is scheduled on Upper B.',
        ],
      },
    ],
  },
  {
    slug: 'why-the-walk-counts',
    title: 'Why the walk counts',
    oneLiner: 'Two twenty-minute walks, four days a week, is more training than any clever gym trick.',
    body: [
      {
        p: [
          'You walk to the gym and back. That is not commuting — it is roughly 160 minutes a week of low-intensity aerobic work, and it is doing more for you than anything you could engineer by rearranging your gym hour.',
          'The standard public health guideline is 150 minutes a week of moderate activity. You clear it on the walk alone, before touching a cardio machine.',
        ],
      },
      {
        h: 'What it does',
        list: [
          'Warms you up on the way in, so you arrive ready to lift rather than cold',
          'Flushes the legs on the way home, which genuinely helps you feel better the next day',
          'Adds real daily energy expenditure — and unlike a gym session, it costs you no extra time or recovery',
          'Builds the aerobic base that makes the hard intervals possible later',
        ],
      },
      {
        h: 'One correction',
        p: [
          'A walk is a general warm-up. It raises your body temperature, but it does not prepare the specific joints you are about to load. You still need five minutes of movement prep and ramp-up sets on the first lift. The app builds those in — do not skip them because you walked.',
          'And if you arrive cold or soaked, treat the walk as not having happened and take the longer warm-up option.',
        ],
      },
      {
        h: 'Make it count for more',
        p: [
          'If you can walk briskly enough to be in Zone 2 — breathing noticeably deeper, still able to talk in full sentences — that same walk becomes properly useful aerobic training rather than just movement. Check it once with the walk-pace test in the Cardio section, and then you will know.',
        ],
      },
    ],
  },
  {
    slug: 'zone-2',
    title: 'Zone 2',
    oneLiner: 'The easy cardio that builds the engine everything else runs on.',
    body: [
      {
        p: [
          'Zone 2 is deliberately easy aerobic work. It feels almost too easy to be doing anything, which is why most people skip it and go straight to hard sessions they cannot sustain.',
          'It builds your aerobic base: more capillaries, better fat use for fuel, a heart that pumps more per beat. That base is what lets you recover between hard sets, between sessions, and eventually do the intervals that raise VO2 max.',
        ],
      },
      {
        h: 'How to find it — the talk test comes first',
        p: [
          'You should be able to hold a conversation in full sentences, but you would not want to sing. Your breathing is noticeably deeper, and you could still just about breathe through your nose. Effort around 3 or 4 out of 10.',
          'That is the definition. Heart rate is a confirmation, not the target.',
        ],
      },
      {
        h: 'Why not lead with heart rate',
        p: [
          'Because the numbers disagree with each other. The "Zone 2" band on a treadmill display and the Zone 2 a coach means can differ by 20 beats. And the formula everyone uses for maximum heart rate is wrong by 10 to 12 beats for most people.',
          'Hand a beginner a wrong number and they will train at the wrong intensity with total confidence. The Cardio page shows your bands calculated properly, with both conventions side by side — but if the number and the talk test disagree, the talk test wins.',
        ],
      },
      {
        h: 'How much',
        p: [
          'You are already getting a large amount from the walk. The 12 to 15 minutes on the bike after your upper-body sessions is a top-up, not the main event. If you cannot hold it conversationally for the whole time, you started too hard.',
        ],
      },
    ],
  },
  {
    slug: 'vo2-max',
    title: 'VO2 max',
    oneLiner: 'The size of your aerobic engine — and the single best-evidenced number in fitness.',
    body: [
      {
        p: [
          'VO2 max is the most oxygen your body can use per minute when working as hard as it can. It is the best single measure of aerobic fitness, and it tracks long-term health more closely than almost anything else that can be measured.',
          'It is also a useful thing for you specifically, because it gives you a standard. Right now there is no number that says whether your cardio is improving. After week 1 there will be.',
        ],
      },
      {
        h: 'An honest caveat',
        p: [
          'A true VO2 max reading needs a lab, a mask and a metabolic cart. Everything else — this app, your watch, any gym test — is an estimate carrying roughly 10 to 15% error.',
          'That is completely fine, as long as you use it correctly. The trend across repeated tests is the signal. A single number is not, and neither is a small change between two tests. The app shows the error band on every result for exactly this reason.',
        ],
      },
      {
        h: 'How you will measure it',
        list: [
          'Week 1 — Rockport walk test. Walk 1.61 km as fast as you can sustain, record the time and your heart rate at the finish. Submaximal, safe, and it uses a skill you already have.',
          'Week 6 and week 12 — repeat the same test. Same protocol, so the comparison is clean.',
          'From week 6 you can also use the Cooper test — maximum distance in 12 minutes — if you want a harder, sharper measure.',
        ],
      },
      {
        h: 'What actually raises it',
        p: [
          'Not Zone 2. Zone 2 builds the base that makes the hard work possible, but the thing that moves VO2 max is time spent near your maximum.',
          'The best-established protocol is the Norwegian 4x4: four minutes at close to your maximum, three minutes easy, four times. That is not a week-1 prescription for someone with no training background, so the programme ramps to it — 30-second efforts from week 5, building to the full 4x4 by week 11.',
        ],
      },
    ],
  },
  {
    slug: 'supersets',
    title: 'Supersets',
    oneLiner: 'Two exercises back to back. Used correctly, they buy you time for free.',
    unlocksWeek: 1,
    body: [
      {
        p: [
          'A superset is two exercises done back to back with no rest in between. There are two kinds and they are not remotely the same thing.',
        ],
      },
      {
        h: 'Antagonist supersets — free time, no downside',
        p: [
          'Pair two exercises that work opposing muscles: a push with a pull, or the front of the leg with the back of it. While your triceps work, your biceps rest — so by the time you come back round, each muscle has had a normal rest without you standing around for it.',
          'You cut 20 to 30% off the session with essentially no cost to your strength. This is why your accessory work is paired from week 1.',
        ],
      },
      {
        h: 'Same-muscle supersets — a genuine intensity tool',
        p: [
          'Two exercises for the same muscle back to back — a chest press straight into a chest fly. This is not a time saver. It is a way to make a muscle work far harder than one exercise could, and it costs a lot in fatigue.',
          'It is held back to week 9 because until then you get everything you need from straight sets, and the extra fatigue would just eat into your recovery.',
        ],
      },
      {
        h: 'One practical note',
        p: [
          'Supersets need two pieces of equipment free at once. In a busy gym, do not stress it — do them as straight sets and take the extra few minutes. A missed superset costs you almost nothing. Hovering anxiously over someone else\'s machine costs you the session.',
        ],
      },
    ],
  },
  {
    slug: 'drop-sets',
    title: 'Drop sets',
    oneLiner: 'Take a set to the limit, strip the weight, keep going. Powerful and expensive.',
    unlocksWeek: 5,
    body: [
      {
        p: [
          'A drop set: you take a set close to failure, immediately reduce the weight by roughly 20 to 30%, and keep going without rest. Sometimes twice.',
          'The point is to keep a muscle working past where it would normally have to stop. Your strongest muscle fibres are the last to be called on, and they only get recruited when everything else is already tired — a drop set keeps you in that zone for longer.',
        ],
      },
      {
        h: 'Why not from day one',
        p: [
          'Because as a beginner you are already getting close to the maximum available adaptation from ordinary straight sets. Adding a technique like this early adds fatigue before it adds any benefit.',
          'Its real value arrives later, when straight sets stop producing progress — which is exactly when it will feel like a discovery rather than a chore.',
        ],
      },
      {
        h: 'The rules when it unlocks in week 5',
        list: [
          'Machines and cables only. Never a free-weight lift — stripping plates while exhausted is how technique falls apart.',
          'Last exercise of the session only. It should not affect anything that comes after it.',
          'One or two exercises maximum, once a week. Not on everything.',
          'Never on your main compound lift. That one needs you fresh.',
        ],
      },
    ],
  },
  {
    slug: 'pre-exhaustion',
    title: 'Pre-exhaustion, and why we do the opposite first',
    oneLiner: 'Tiring a muscle before the big lift. A real tool, but wrong for a first block.',
    unlocksWeek: 9,
    body: [
      {
        p: [
          'Pre-exhaustion means doing a hard isolation exercise immediately before a compound lift that uses the same muscle — leg extensions to failure, then straight onto the leg press.',
          'The idea is intuitive and appealing: tire out the target muscle first, so it is the thing that fails on the big lift rather than everything else giving out around it.',
        ],
      },
      {
        h: 'Why it is held back to week 9',
        list: [
          'It makes you weaker on the compound lift, and the compound lift is what builds the strength base you do not have yet.',
          'Fatiguing a muscle before a movement you are still learning makes your technique worse, exactly when technique matters most.',
          'The evidence does not really support the mechanism. Research measuring muscle activity found pre-exhaustion actually reduced activation of the target muscle during the following compound lift — the opposite of what it is supposed to do.',
        ],
      },
      {
        h: 'What the programme does instead',
        p: [
          'Prime, then compound, then isolate.',
          'You start with one or two very light isolation sets — enough to feel the muscle and switch it on, nowhere near enough to tire it. Then the compound lift while you are fresh. Then the isolation work properly, afterwards, when tiring the muscle out costs nothing.',
          'You keep everything you wanted from the isolation-first instinct — knowing which muscle you are meant to feel, which is genuinely the hardest thing about being new — without paying for it in the lift that matters.',
        ],
      },
      {
        h: 'When it does unlock',
        p: [
          'From week 9, on machine-based movements, on one exercise per session at most. By then you have the technique to handle it and straight sets have started to give less back.',
        ],
      },
    ],
  },
  {
    slug: 'warming-up',
    title: 'Warming up, and cooling down',
    oneLiner: 'Two different jobs. Only one of them is stretching.',
    body: [
      {
        p: [
          'Most people treat warming up as a formality — five minutes on a bike, a couple of arm swings, then straight to the heavy thing. That misses what a warm-up is actually for.',
          'There are two separate jobs, and they are not interchangeable.',
        ],
      },
      {
        h: '1. Movement prep — open the joints',
        p: [
          'Four drills, about three minutes, chosen for the session you are about to do. Ankle rocks before a leg press because ankle range is what lets you reach depth. Wall slides before a shoulder press because that is the movement the shoulder blade needs to be able to make.',
          'None of it should tire you. If a drill leaves you out of breath, it has stopped being a warm-up and started being a workout.',
        ],
      },
      {
        h: '2. Ramp-up sets — rehearse the lift',
        p: [
          'This is the part beginners skip, because light sets feel pointless. They are not. Roughly half your working weight for 8, then 70% for 5, then 85% for 3.',
          'What they buy you: your nervous system gets to practise the exact movement at rising loads, so the first working set feels like the third rather than a cold shock. You will lift more, with better technique, for the entire session.',
          'They are rehearsal, not work. The app never logs them and they never count toward your weekly sets.',
        ],
      },
      {
        h: 'What about static stretching first?',
        p: [
          'Holding a long stretch before lifting temporarily reduces how much force a muscle can produce. The effect is small and short-lived, but there is no reason to pay it — so the long holds go at the end, not the beginning.',
        ],
      },
      {
        h: 'And the cool-down',
        p: [
          'Here is the honest version: a cool-down will not prevent soreness. Nothing reliably does. Anyone selling you a stretch that stops next-day ache is overselling.',
          'What it does do is get your breathing and heart rate down before you walk home, and keep range at the joints that lifting quietly shortens — the front of the hips after leg day, the chest after pressing. Three stretches, two minutes. Worth it, for what it actually is rather than what it is usually claimed to be.',
        ],
      },
    ],
  },
  {
    slug: 'deloads',
    title: 'Deloads',
    oneLiner: 'Backing off on purpose, so the progress catches up.',
    body: [
      {
        p: [
          'Training does not make you stronger. Recovering from training makes you stronger. Training is just the request.',
          'If you keep making the request without ever letting your body fill it, fatigue stacks up until progress stops and everything starts to feel heavy — including weights you handled easily a fortnight ago.',
        ],
      },
      {
        h: 'What a deload is',
        p: [
          'A week where you keep the same weights but cut the sets by about 40%. It is not a week off, and it is not going through the motions — the loads stay heavy so your body has no reason to give up any of what it built. There is just far less of it.',
          'You will almost always come back stronger the following week. That is not a coincidence; it is the point.',
        ],
      },
      {
        h: 'When they happen',
        list: [
          'Scheduled — weeks 5 and 9, between training blocks.',
          'Triggered — if any lift fails to progress for two sessions in a row, the app deloads that lift on its own.',
        ],
      },
      {
        h: 'The hard part',
        p: [
          'Deload weeks feel like slacking, and the temptation to skip them is strong precisely when you most need one. Nobody has ever lost progress from an easy week. Plenty of people have lost months to pushing through one they should have taken.',
        ],
      },
    ],
  },
];

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export function getArticle(slug: string): Article | undefined {
  return BY_SLUG.get(slug);
}
