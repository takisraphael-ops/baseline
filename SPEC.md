# Baseline — design and reasoning

Why the programme is shaped the way it is, including where it deliberately
departs from what was originally asked for.

---

## 1. The athlete

| Attribute | Value |
|---|---|
| Age / sex | Mid-20s, female |
| Training background | None. No sports history. |
| Current condition | Good — driven almost entirely by diet, not training |
| Stated goal | A more toned body |
| Gym frequency | 4× / week, committed |
| Commute | Walks to and from the gym |

Observed gaps: no plan, so nothing accumulates. Unfamiliar with the machines.
No strength base and no reference loads. No cardio standard.

The second one is the real bottleneck. Someone unsure which lever adjusts what
will never push a set close enough to failure to trigger adaptation. Everything
below is downstream of fixing that, which is why `Exercise.setup` is the most
carefully written field in the codebase.

---

## 2. Evaluation of the original concepts

Three survive intact. One is reframed, one has its ordering inverted.

### 2.1 "Isolate a muscle, then follow with the related compound"

**Right instinct, wrong order for a beginner. Reframed, not discarded.**

This is *pre-exhaustion*. It is a real technique, but a poor fit here:

- It deliberately weakens the compound lift — the main driver of the strength
  base she does not yet have.
- Fatiguing a muscle before a movement she is still learning degrades technique
  exactly when technique matters most.
- The evidence does not support the mechanism. Augustsson et al. (2003) found
  pre-exhaustion *reduced* activation of the target muscle during the subsequent
  compound lift.

The instinct behind it is correct though: a beginner genuinely cannot feel which
muscle is working, and isolation on a fixed-path machine teaches that better
than anything else.

**So: Prime → Compound → Isolate.**

| Step | Load | Purpose |
|---|---|---|
| Prime — isolation, 1-2 sets | RPE 4-5 | Teach the target muscle. Near-zero fatigue cost. |
| Compound — 3-4 sets | RPE 7-8 | Build the base while fresh. |
| Isolate — 2-3 sets | RPE 8-9 | Volume, after the heavy work is banked. |

Everything she wanted, without the strength tax. True pre-exhaustion unlocks in
Block 3 as an intensity tool, with the reasoning on the page
(`/learn/pre-exhaustion`).

### 2.2 "Aggregate strength and cardio to burn the most calories per session"

**The sequencing is right. The metric is not.**

**Sequencing.** Hard cardio *before* lifting measurably degrades strength and
hypertrophy adaptation. *After* lifting the interference is small, and Zone 2 is
the least disruptive intensity. So the rule is exactly as proposed: lift first,
cardio second, always.

**Metric.** Optimising for calories burned works against the goal:

- The number is small and badly measured — a hard hour is roughly 300-450 kcal,
  and machine estimates miss by 20-30%.
- Chasing it pushes training toward light, sweaty circuit work that builds
  neither strength nor much fat loss.
- "Toned" is not a calorie-burn outcome. It is muscle at moderate body fat.
  Muscle comes from progressive resistance training; low body fat comes from
  diet, which she already has handled.

There is also an irony: **the walk already wins this argument.** Two 20-minute
walks × 4 days ≈ 160 min/week — a larger and far more reliable contribution than
anything she could engineer by rearranging her gym hour, and she is already
doing it.

So the metric became **hard sets completed and weekly Zone 2 minutes**, and
efficiency is delivered through mechanisms that work: antagonist supersets
(20-30% off the session at negligible strength cost), cardio as a finisher, and
the walk counted explicitly as prescribed volume.

### 2.3 "The walk is the warm-up and cool-down"

**Adopted, with one correction.** A walk is a *general* warm-up — it raises core
temperature but does not prepare the specific joints about to be loaded, so five
minutes of movement prep and ramp-up sets is still required and the session
player enforces it. Cold or wet weather voids it; there is a longer warm-up
option.

The payoff: if the walk is brisk enough to reach Zone 2, it is 120-160 min/week
of real aerobic training, which already clears the 150 min/week guideline before
any machine. `/cardio` has a one-off walk-pace test to establish which it is.

### 2.4 Progressive overload

**Correct, and made the engine of the whole tool.** See §5.

### 2.5 Drop sets and supersets

**Both taught immediately, unlocked on a schedule.**

| Technique | Verdict | Unlocks |
|---|---|---|
| Antagonist superset | Safe from day one. Saves time, no real downside. | Week 1 |
| Drop set | High fatigue. Machines/isolation only, end of session, 1-2 exercises, once a week. | Week 5 |
| Same-muscle superset | Real fatigue cost. Needs a technique base. | Week 9 |
| Pre-exhaustion | See §2.1. | Week 9 |

The reason for gating: a beginner already gets close to the maximum available
adaptation from straight sets. These add fatigue before they add stimulus. Their
value arrives when straight sets stop working — which is when they will feel
like a discovery rather than a chore.

### 2.6 VO2 max

**Feasible as an estimate and a trend, not as an absolute number.** True VO2 max
needs a lab; field tests carry 10-15% standard error. Fine — as long as the app
says so, which it does, showing the error band on every result.

- **Week 1 — Rockport 1.61 km walk test.** Submaximal, safe, walking-based.
- **Weeks 6 and 12 — repeat the same test.** Mixing protocols produces a
  meaningless trend, and the app says this at the point of entry.
- **Cooper 12-minute test** available from week 6 for a sharper measure.

Note that **Zone 2 does not raise VO2 max** — it builds the base that makes the
hard work repeatable. The thing that moves it is time near maximum, so the
programme ramps to the Norwegian 4×4 rather than starting there (§6.4).

### 2.7 Zone 2

**The best cardio prescription available for her.** The trap is defining it by
heart rate first: zone models disagree by up to 20 bpm and max-HR formulas carry
10-12 bpm of error. So the **talk test is primary** and the numeric band is
confirmation, with the model named and both conventions shown.

### 2.8 Added: what "toned" means

Not asked for, but it determines whether she trusts the plan in month two. There
is no toning tissue — toned is muscle you can see, which means building muscle
and keeping body fat moderate. She has the second half. The first requires
lifting progressively heavier, which is the thing beginners avoid out of a fear
of bulk that is unfounded. `/learn/what-toned-means` addresses it in week 1.

---

## 3. Programme

**Upper / Lower × 2.** Every muscle twice a week — the best structure available
at four days. Rejected: Push/Pull/Legs (uneven frequency at four days), 4× full
body (excessive overlap for a beginner).

| Day | Session | Bias |
|---|---|---|
| A | Lower A | Quad / glute |
| B | Upper A | Push |
| C | Lower B | Hamstring / glute |
| D | Upper B | Pull |

### Session template

| Phase | Duration |
|---|---|
| Walk in | 15-25 min — general warm-up, counted as volume |
| Specific prep | 5 min |
| Prime | 3 min |
| Main compound | 12 min |
| Secondary compound | 10 min |
| Accessory pair (antagonist superset) | 10 min |
| Isolation finisher | 6 min |
| Cardio finisher | 0-15 min |
| Walk home | 15-25 min |

Gym time 50-60 min. Door to door 80-110 min.

### Blocks

| Block | Weeks | Focus | Sets | RIR | Unlocks |
|---|---|---|---|---|---|
| 1 Technique | 1-4 | Learn the machines, learn RIR, set reference loads | ×0.7 | 3 | Antagonist supersets |
| 2 Build | 5-8 | First real progressive overload | ×1.0 | 2 | Drop sets, intervals |
| 3 Intensify | 9-12 | Intensity techniques, first free-weight variants | ×1.34 | 1 | Same-muscle supersets, pre-exhaustion |

Block 3 scales at 1.34 rather than 1.15 deliberately: at 1.15 a 3-set slot rounds
back to 3 and the block adds no volume at all. The fixture asserts that volume
actually steps up between blocks.

Deloads in weeks 5 and 9 — same load, ~40% fewer sets, RIR +2. Any lift that
stalls twice in a row deloads on its own regardless of week.

### Weekly volume

Counted in hard sets per muscle: direct sets count one, assisting sets count a
half, priming sets count zero. **The target is derived from the programme itself**
(`targetWeeklyVolume` → `plannedWeeklyVolume`) rather than kept as a second
hand-written table, which would drift out of step the moment a set count changed
and quietly make the progress bars lie.

Block 2 lands at roughly: glutes 18, hamstrings 12, lats 12, quads 9, chest 6,
side delts 5.5. Deliberately glute-, back- and hamstring-led. Nothing is skipped,
and the fixture asserts every muscle group gets non-zero work.

---

## 3a. Starting weights

A fixed "start at 40 kg on the leg press" is a guess about someone the app has
never met. Too high and the first session is frightening and technique falls
apart; too low and three weeks go on climbing back to a real working weight.

So eight questions, answerable without a gym, scored to a 0-100 index:

| Question | Max points | Why |
|---|---|---|
| Press-ups in one go | 24 | The best single predictor available — a real load test |
| Training history | 20 | Retained strength and motor learning |
| Bar hang | 16 | Back and grip, which set the pulldown |
| Bodyweight squats | 16 | Leg endurance |
| Activity level | 12 | General work capacity |
| Plank hold | 12 | Trunk stability |

The index maps to a multiplier of **0.70 to 1.40**, applied to a per-exercise
fraction of bodyweight. The spread is deliberately narrow: beginners differ less
in what they can lift on a fixed-path machine than in how confident they feel
doing it, and a wider range would mostly produce silly numbers at both ends.

Two further answers change the app rather than the load: gym confidence decides
whether setup instructions open by default, and any reported niggles produce
specific cautions on the movements worth easing into.

None of this is precision. It is a better first guess than a fixed number, and
the progression engine corrects it from real data after one session.

## 4. The progression engine

`lib/train/progression.ts`. Pure functions, no UI dependency.

**Double progression.** Add reps until every set reaches the top of the range,
then add load and drop back to the bottom. The app never asks what weight to
use — it computes the target from history and shows it, with the reason.

**The machine-stack fallback.** This is the feature that matters most for her.
Machine stacks jump 5-7 kg and cable pins 2.5 kg; on a cable lateral raise
starting at 2.5 kg, one pin is a 100% increase, and the textbook rule is
unusable. When the next increment exceeds **25% of current load**
(`INCREMENT_CEILING`), load is held and a different lever is pulled, in order:

1. Extend the rep range by 2
2. Add a set
3. Slow the eccentric to 3 seconds (machines and cables)
4. Micro-load, or move to a dumbbell variant with 1-2 kg jumps

There is a second, higher threshold. Above **75%** (`ABSURD_JUMP`) the next
plate is close to a doubling, so the engine stops taking it at all and offers an
extra set or micro-loading instead. Both constants are tuned rather than
arbitrary: a ceiling of 10% was tried and vetoed every loaded exercise in the
library, because 5 kg on a 40 kg leg press is already 12.5%.

The reason is shown inline, never hidden: *"Next plate is +2.5 kg — a 50% jump,
too big to take cleanly. Staying at 5 kg and extending to 17 reps instead."*

**Load only increases when the top of the range was reached with at least 1 rep
in reserve.** Grinding out the last rep does not earn the jump.

**Stalls.** Two consecutive sessions without progress → deload that lift. Three
→ suggest a variant swap from the same ladder.

---

## 5. Cardio

### Zones — worked example, age 25, resting HR 60

Max HR uses **Tanaka** (`208 − 0.7 × age` = 190.5). Bands use **Karvonen**
(percentage of heart-rate *reserve* = 130.5), which tracks perceived effort far
better than a flat percentage of max.

| Zone | %HRR | bpm | Talk test |
|---|---|---|---|
| 1 Recovery | 50-60% | 125-138 | Full conversation, no effort |
| 2 Aerobic base | 60-70% | 138-151 | Full sentences, would not want to sing |
| 3 Tempo | 70-80% | 151-164 | Short sentences only |
| 4 Threshold | 80-90% | 164-177 | A few words |
| 5 VO2 max | 90-100% | 177-191 | Cannot speak |

Zone 2 reads as **73-79% of max HR** on a treadmill console, which shows a share
of max rather than reserve. Both are displayed to prevent the mismatch, and the
app repeats that the talk test wins when they disagree.

### Interval ramp

| Weeks | Protocol |
|---|---|
| 1-4 | Zone 2 only |
| 5-6 | 8 × 30s hard / 30s easy |
| 7-8 | 6 × 60s / 90s |
| 9-10 | 5 × 2 min / 2 min |
| 11-12 | **4 × 4 min / 3 min** — the Norwegian 4×4 |

Once a week, on an upper-body day only — never after legs.

### Weekly map

| Day | Cardio finisher | Walk |
|---|---|---|
| Lower A | None — legs are done | 2 × 20 min |
| Upper A | Zone 2, 12 min | 2 × 20 min |
| Lower B | None | 2 × 20 min |
| Upper B | Intervals from week 5 | 2 × 20 min |

Totals: ~160 min walking, ~27 min structured Zone 2, 8-28 min high intensity
from week 5. Clears the 150 min/week guideline from week 1 with no extra trips.

### VO2 max estimation

| Test | Formula |
|---|---|
| Rockport 1.61 km walk | `132.853 − 0.16953·kg − 0.3877·age + 6.315·sex − 3.2649·min − 0.1565·HR` (F=0, M=1) |
| Cooper 12 min | `(metres − 504.9) / 44.73` |

The Rockport coefficient is the published pounds coefficient pre-converted
(`0.0769 × 2.20462`), so the app stays metric-only end to end. Every result is
labelled *estimated* with a ±12% band, and a change smaller than half that band
is reported as noise rather than progress.

The sex term is worth 6.315 ml/kg/min, so it is asked at setup rather than
assumed — see `components/sex-picker.tsx` for why that is the only thing the
field is used for. The population comparison is looked up per sex **and** per
age band (Cooper Institute ACLS bands, 20–49). Outside that range
`classifyVo2` returns null and the surface shows the estimate with no rating:
a band borrowed from a neighbouring cohort is worse than none, and the number
itself is what the programme tracks.

---

## 6. Architecture

- **Next.js 16 App Router**, TypeScript, Tailwind, Recharts. No database, no
  accounts, no server-side state, no outbound requests at run time.
- **Persistence is device-local**, behind `lib/train/store.ts`. Rationale and
  trade-offs in the README. One module means a sync backend can be added later
  without touching a component.
- **Screens subscribe to the store** through `useSyncExternalStore`, wired up in
  `lib/train/use-store.ts`. `store.ts` caches its parse so the snapshot is one
  stable object until something writes, and both write paths — `save` and
  `clearAll` — invalidate it. That cache is load-bearing: `load()` builds a
  fresh object every call, and handing an unstable snapshot to the hook is an
  infinite render loop, not a subtle bug. The hooks live in their own module
  because `scripts/fixture-run.ts` imports `store.ts` under plain node and
  pulling React in would break the fixture run.
- **Pure logic modules** — `progression`, `zones`, `vo2`, `volume` — have no
  framework imports and are asserted directly by `scripts/fixture-run.ts`.
- **Content is typed data** — `exercises.ts`, `programme.ts`, `learn.ts` — so the
  fixture can assert structural invariants about the programme itself.
- **Diagrams are in-house SVG**; videos are linked, never embedded (the app sets
  `X-Frame-Options: DENY` and grants no device permissions).

### Safety

PAR-Q screen on first run, persistent "not medical advice" disclaimer, stop
rules on the session page. No calorie targets, no weight targets, no
body-composition goals — her diet works and this tool has no business touching
it. The optional "how did that feel?" field is never scored or interpreted.

---

## 7. Known gaps

1. **A curated video can be pulled at any time.** All 41 are now hand-picked
   ids, each verified through YouTube's oembed endpoint with the resolved title
   recorded beside it. What cannot be fixed at build time is an upload being
   deleted later, which is why the search fallback stays wired up behind
   `demoUrl()` rather than being retired.
2. **Starting weights are estimates.** `Exercise.startKg` is a reasonable guess
   for an untrained adult; the first session is explicitly framed as a rehearsal
   and the engine corrects from real data immediately after.
3. **No equipment audit.** The programme assumes a standard commercial gym. A
   photo list of the machines she actually has would let every ladder and every
   increment be exact rather than assumed — this is the highest-value input
   available and would improve the machine-stack fallback most of all.
4. **Weeks 13+ are not generated.** After week 12 the app tells her to re-test
   and run it again from the new numbers. Automatic regeneration is a later job.
5. **The service worker script does not refresh itself.** Measured with a
   request counter: Chromium did not re-fetch `sw.js` across four reloads, so a
   new build's `CACHE` name never arrives and `activate` never purges. An
   explicit `registration.update()` from the page *does* work — it re-fetched
   and swapped the cache immediately — so the fix is to call it on a real
   trigger (visibility change, or an interval) rather than only inside the
   `load` handler, where it appears to be coalesced with the `register()` call's
   own check. Impact is narrower than it sounds: new *content* still reaches the
   phone one launch later through the worker's background revalidation, which is
   what actually delivers builds today. What will not ship is a change to the
   caching logic itself.
6. **VO2 norms cover ages 20–49 only.** Both sexes, from the Cooper Institute
   bands that could be sourced and checked. An athlete of 50+ gets the estimate,
   the error band and the trend — everything the programme acts on — but no
   population rating, because nothing is shown that has not been verified.
   Extending it means finding the 50–59 and 60+ rows in a citable form, not
   extrapolating the ones already there.
