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

**`getSnapshot()` in `lib/train/store.ts` must return the same object until
something writes.** Every screen subscribes through `useSyncExternalStore`, and
that hook re-renders whenever the snapshot is a different reference. `load()`
parses fresh JSON into a new object each call, so returning it directly is an
infinite render loop rather than a slow screen. The cache is invalidated by
`save()` and `clearAll()` and nowhere else — if you add a third write path,
invalidate there too or every open screen keeps rendering data that is no longer
true. Fixtures assert stability, both write paths, and that `store.ts` never
imports React.

**The inlined typeface is found by matching a filename Next emits, and that
filename moves.** Webpack wrote `<hash>-s.p.woff2`; Turbopack in Next 16 writes
`<hash>-s.p.<hash>.woff2`. The old `endsWith('-s.p.woff2')` in `demo/build.mjs`
matched nothing at all after the upgrade, and a matcher that finds nothing is a
build that succeeds having shipped system fonts. Keep it a pattern, keep
`--require-font` on every real build, and expect this to break again on the next
major. A fixture pins the matcher against both known filename shapes.

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
publishes **two** files — `index.html` and `sw.js`. Live at
https://takisraphael-ops.github.io/baseline/

The second file is the offline cache, and it fails quietly. Registration asks
for `./sw.js` relative to the page; a missing one 404s, the `.catch` swallows
it, the app still loads, and the only symptom is that it stops working offline
again — which nobody notices until they are in a basement with no signal. The
workflow `test -s`s it and the fixture run asserts the workflow still copies it.
Deploying the standalone build anywhere else has the same obligation.

`--require-font` is deliberate: `demo/build.mjs` inlines the Inter subset that
`next build` emits into `.next/static`, and without the flag a missing subset
only warns — CI goes green having shipped system fonts.

## Open

- All 41 exercises now carry a curated clip, each id resolved through YouTube's
  oEmbed endpoint with the returned title recorded beside it. Any replacement
  gets the same treatment — verify through oEmbed rather than trusting recall.
  Keep the search fallback populated regardless; an upload can be pulled at any
  time.
- The machine names, plate increments and available dumbbells are educated
  guesses. The gym has a lying leg curl rather than a seated one — that was a
  lucky catch. The progression engine depends on those increments being right,
  so confirm them against the actual gym before trusting the numbers.
