# Baseline

A twelve-week strength and cardio plan that runs itself.

Built for one person: mid-20s, no sports background, already in good shape from
diet, four gym sessions a week, walks there and back. The goal is a stronger,
more visibly muscular body — and the bottleneck is not effort, it is not knowing
how to set a machine up or how hard a set is meant to feel.

## What it does

- **Session player** — every exercise in order, with the target computed from
  what you lifted last time. Set logger, rest timer, setup guide inline.
- **Starting-strength quiz** — eight questions (training history, activity, and
  bodyweight markers: press-ups, squats, plank, bar hang) scored into a 0-100
  index. Every starting load is then a fraction of bodyweight scaled by that
  index, instead of a fixed guess about a person the app has never met.
- **Progression engine** — double progression, with a fallback for the case that
  actually bites a beginner: machine stacks that jump 5-7 kg when you are
  lifting 7. Detects stalls and deloads on its own.
- **Swap a busy machine** — a "Busy?" button on every exercise offers substitutes
  that train the same muscle, ranked by shared muscle first and equipment second
  (another machine of the same kind is often occupied too). Swaps last one
  session; next week the original is back.
- **Exercise library** — 42 exercises, each with numbered setup steps that name
  the specific adjustment, what a good rep feels like, the usual mistakes, an
  in-house muscle diagram, and a machine-to-free-weight progression ladder.
- **Warm-up and cool-down** — four mobility drills chosen per session (ankle
  rocks before a leg press, wall slides before a shoulder press), plus explicit
  ramp-up sets at 50/70/85% of the working weight. Previously the session said
  "five minutes of specific prep" and left her to guess what that meant.
- **Cardio** — heart-rate zones from Tanaka and Karvonen, a Zone 2 prescription,
  an interval ramp building to the Norwegian 4×4, and VO2 max estimation from
  the Rockport walk test or the Cooper 12-minute test.
- **Learn** — twelve plain-English articles. Techniques are explained
  immediately and unlocked on a schedule.

## Stack

Next.js 14 App Router · TypeScript · Tailwind · Recharts. No database, no
accounts, no server-side state.

## Setup

```
npm install
npm run dev
```

## Checks

```
npm run fixture    # asserts the training maths — progression, zones, VO2, volume
npm run typecheck
npm run lint
npm run build
```

`npm run fixture` is the important one. It runs offline with no database and
asserts exact values for the progression engine, the heart-rate bands, both VO2
formulas, and the shape of the programme itself — that every session primes
before it compounds, that superset partners point at each other, that no session
uses the same exercise twice, and that weekly volume steps up across the blocks
instead of rounding flat.

## Shareable single-file builds

```
npm run build                  # needed once, for the self-hosted Inter subset
node demo/build.mjs            # -> demo/dist/baseline.html         (preview)
node demo/build.mjs --client   # -> demo/dist/baseline-client.html  (hers)
```

Bundles the whole app into one self-contained HTML file — JS, CSS and typeface
all inlined, no external requests — for hosting anywhere that serves a static
page. `next/link` and `next/navigation` are aliased to shims in `demo/shims`, so
no page component is forked: both builds run the same code as the app.

Two outputs from one entry, switched by a `__PREVIEW__` define:

- **Preview** carries three weeks of sample history (`demo/seed.ts`) so Progress
  and the load charts have something to show, plus a banner explaining that and
  a button to clear it.
- **Client** is what the athlete opens. The sample data and the banner are
  dead-code-eliminated out rather than merely hidden, so it starts on the setup
  quiz and week 1.

## Design decisions

- **Data is device-local.** Everything lives in `localStorage` behind
  `lib/train/store.ts`. No account, no login before a set, works offline, nothing
  to breach. Trade-off: no cross-device sync, so there is an explicit JSON
  export/import in Settings. Because every read and write goes through one
  module, a sync backend can be added later without touching a component.
- **Videos are linked, never embedded.** The app sets `X-Frame-Options: DENY`
  and grants no device permissions. Links open in a new tab. Each exercise
  carries a curated tutorial where one was found, plus a YouTube search that
  cannot 404 — the curated links could not be confirmed live from the build
  environment, so the fallback is always shown alongside.
- **Diagrams are drawn in-house.** `components/muscle-map.tsx` is plain SVG: no
  outbound request, works offline, renders identically everywhere.
- **The font is self-hosted** at build time via `next/font`, so a page renders
  with no third-party request.
- **Metric only.** The Rockport equation is published in pounds; the coefficient
  is pre-converted to per-kg so no imperial unit is stored, computed or shown.
- **Set values are always visible.** Every field is pre-filled with the target
  and edited with steppers. Typing a number into a phone keyboard between sets
  is the interaction to design out — but the field stays a real input for
  anyone who would rather type.
- **Shared design system.** Tokens ported from the companion FitForge app
  ("Graphite & Ice"): a three-tier surface stack, a deep teal accent that stays
  legible as text on near-white, and a separate state scale so progress
  readouts never borrow the colour that means "tappable".

See `SPEC.md` for the programme design and the reasoning behind it.
