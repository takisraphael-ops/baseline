# Baseline

A twelve-week strength and cardio plan, built for one person: mid-20s, no sports
background, already lean from dieting, four gym sessions a week, walks there and
back. The bottleneck it is designed around is **not effort** — it is standing in
front of a machine not knowing which lever moves what, and therefore never
pushing a set hard enough to matter.

`SPEC.md` has the programme design and the reasoning. `README.md` has the tour.
This file is the things that will bite you.

## Non-negotiables

**Two build targets, and the difference is load-bearing.**
`node demo/build.mjs` emits an HTML *fragment* for the Claude artifact host,
which wraps it in its own `<head>`. `--standalone` emits a complete *document*
for anywhere else. That head is where the viewport meta comes from: a fragment
served from a static host lays out at 980px in quirks mode and every phone
scales it down. The same bytes are correct in one place and unusable in the
other. `--client` drops the seeded sample history and the preview banner.

**The progression engine has failed silently before.** All 19 loaded exercises
were once unable to add load for the entire twelve weeks, while every unit test
passed. What was missing was a test that walked each exercise forward from its
own starting weight. That test now exists in `scripts/fixture-run.ts` — do not
weaken it. If you touch `lib/train/progression.ts`, simulate the full twelve
weeks and look at the resulting weights, not just the levers.

Two constants there are tuned, not arbitrary. `INCREMENT_CEILING` (0.25) must
stay above the ordinary machine step at beginner loads — 5 kg on a 40 kg leg
press is 12.5%, and a ceiling of 0.10 vetoed every exercise in the library.
`ABSURD_JUMP` (0.75) must stay high, because a hold at the end of the lever list
is permanent: the percentage cannot change if the weight never moves.

**Effort drives the prescription.** The three buttons in `EffortPicker` write
rir 3 / 2 / 0, and the engine branches on those exact numbers. A fixture asserts
the control and the engine still agree — if they drift the app quietly stops
doing what its own copy promises.

**Every demo link goes through `demoUrl()`.** `videoUrl: ''` is how "not curated
yet" is spelled, so the fallback must be a truthiness test. `ex.videoUrl ?? fallback`
keeps the empty string and renders `href=""`, which silently does nothing when
tapped. That shipped once, on 32 of 41 exercises. Keep `videoSearch` populated
even where a `videoUrl` exists — it is the escape hatch for a video that dies.

**Splash markup lives in two places** — `app/layout.tsx` and `demo/build.mjs` —
because the hosted single file must paint it before any JS runs. A fixture
compares the two class lists and fails if they drift.

## Verifying

Drive a real browser. Reading the code has repeatedly missed things that one
Playwright run caught: a warm-up card rendering twice, an effort rating written
to a row that was never saved, a set value clipped to 21px at 375px.

```
npm run typecheck && npm run lint && npm run fixture
node demo/build.mjs --client --standalone --require-font
```

Chromium is at `/opt/pw-browsers/chromium`; pass `args: ['--no-proxy-server']`
for `file://` and localhost. Check 375px and 320px, both colour schemes, and
watch for horizontal overflow.

**Sample one element and you have verified nothing.** The dead-link bug survived
a browser pass because the check read the *first* Watch button on each screen,
which happened to be one of the nine that worked. Enumerate.

## Shipping

`main` deploys to GitHub Pages on every push, gated on typecheck, lint and the
fixture run. The workflow builds `--client --standalone --require-font` and
publishes that one file. Live at https://takisraphael-ops.github.io/baseline/

`--require-font` is deliberate: `demo/build.mjs` inlines the Inter subset that
`next build` emits into `.next/static`, and without the flag a missing subset
only warns — CI goes green having shipped system fonts.

## Open

- 32 of 41 exercises still fall back to a YouTube search rather than a specific
  clip. Curating them needs `www.youtube.com` on the environment's network
  allowlist; verify each id through the oEmbed endpoint rather than trusting
  recall, and record the resolved title beside it.
- The machine names, plate increments and available dumbbells are educated
  guesses. The gym has a lying leg curl rather than a seated one — that was a
  lucky catch. The progression engine depends on those increments being right,
  so confirm them against the actual gym before trusting the numbers.
