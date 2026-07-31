// Regenerates lib/train/figure.ts from the companion FitForge app's artwork.
//
//   git clone https://github.com/takisraphael-ops/fitforge /workspace/fitforge
//   node scripts/port-figure.mjs
//
// Not part of the build — figure.ts is committed, and this exists so the port
// can be redone if FitForge's figures are ever redrawn. FitForge's body-map.js
// exports its GEOMETRY object, so this reads the real path data instead of
// several hundred path strings being retyped by hand.
//
// Two corrections are applied on the way through, both documented below. They
// are here rather than hand-edited into figure.ts so that re-running this
// against an updated upstream keeps them, and so the reasoning survives.
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync('/workspace/fitforge/js/body-map.js', 'utf8');
const sandbox = { window: {}, document: undefined, console };
vm.createContext(sandbox);
vm.runInContext(src, sandbox, { filename: 'body-map.js' });

const BM = sandbox.window.BodyMap;
if (!BM || !BM.GEOMETRY) throw new Error('BodyMap.GEOMETRY not found');

const f = BM.GEOMETRY.female;
const views = ['front', 'back'];

// ---------------------------------------------------------------- correction
// The right latissimus is filed under `midback` upstream. It is a clean mirror
// of lats[0] about the figure's x = 110.8 axis, so this is a bucketing mistake
// rather than a drawing one, and it makes an exercise that works the lats
// highlight only the left side of the back.
//
// FitForge's own tests/body-symmetry.js measures it — "female back · lats,
// 88.3% apart (L 1163 / R 137)" and "female back · midback, 58.5% apart" — but
// both are baselined as "known, tracked", so the suite reports PASS. Moving the
// path here rather than editing the extract keeps the fix reproducible if this
// script is ever re-run against an updated upstream.
function bbox(d) {
  const n = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const xs = [], ys = [];
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
const AXIS = 110.8;
const lat0 = bbox(f.back.regions.lats[0]);
const mirrorX = 2 * AXIS - (lat0.x + lat0.w);
const idx = f.back.regions.midback.findIndex((d) => {
  const b = bbox(d);
  return Math.abs(b.x - mirrorX) < 4 && Math.abs(b.y - lat0.y) < 4 && Math.abs(b.h - lat0.h) < 8;
});
if (idx === -1) {
  console.error('! right-lat path not found in midback — upstream may have fixed it; leaving as is');
} else {
  const [moved] = f.back.regions.midback.splice(idx, 1);
  f.back.regions.lats.push(moved);
  console.error(`moved midback[${idx}] -> lats (right latissimus)`);
}

for (const v of views) {
  const g = f[v];
  console.error(
    `${v}: silhouette=${g.silhouette.length} detail=${g.detail.length} regions=${Object.keys(g.regions).join(',')}`
  );
}

// ------------------------------------------------------- second correction
// The back view's right calf carries a shape the left calf does not have at all
// — no mirror of it exists in any back region, so this is missing artwork
// rather than a path in the wrong bucket. Upstream's symmetry test never sees
// it: it checks the female back's shoulders, traps, midback, lats, lower_back,
// triceps, forearms, glutes and hams, and simply has no case for back calves.
//
// Three exercises here train calves directly, and a calf highlight that fills
// one leg and half the other reads as a rendering fault. Reflecting the path
// that does exist about the same x = 110.8 axis is a repair using the artwork
// already drawn, not a new shape invented to fill a gap.
function reflect(d) {
  // Every path is absolute M/L with plain "x y" pairs, so only the x of each
  // pair moves. Winding flips, which fill ignores.
  let n = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (m) => {
    const v = Number(m);
    const out = n % 2 === 0 ? +(2 * AXIS - v).toFixed(1) : v;
    n++;
    return String(out);
  });
}
{
  const calves = f.back.regions.calves;
  const boxes = calves.map(bbox);
  const unpaired = [];
  boxes.forEach((b, i) => {
    const mx = 2 * AXIS - (b.x + b.w);
    const hasMirror = boxes.some(
      (o, j) => j !== i && Math.abs(o.x - mx) < 6 && Math.abs(o.y - b.y) < 6 && Math.abs(o.h - b.h) < 10,
    );
    if (!hasMirror) unpaired.push(i);
  });
  for (const i of unpaired) calves.push(reflect(calves[i]));
  console.error(
    unpaired.length
      ? `mirrored ${unpaired.length} unpaired back-calf path(s): ${unpaired.join(', ')}`
      : 'back calves already paired',
  );
}

const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const arr = (a, indent) => a.map((s) => `${indent}${q(s)},`).join('\n');

function viewLiteral(g, indent) {
  const i2 = indent + '  ';
  const i3 = indent + '    ';
  const regions = Object.entries(g.regions)
    .map(([k, paths]) => `${i3}${/^[a-z_]+$/.test(k) ? k : q(k)}: [\n${arr(paths, i3 + '  ')}\n${i3}],`)
    .join('\n');
  return [
    `${indent}{`,
    `${i2}silhouette: [`,
    arr(g.silhouette, i3),
    `${i2}],`,
    `${i2}detail: [`,
    arr(g.detail, i3),
    `${i2}],`,
    `${i2}regions: {`,
    regions,
    `${i2}},`,
    `${indent}}`,
  ].join('\n');
}

const header = `// Body-map figure geometry, ported from the companion FitForge app
// (js/body-map.js, female figure, July 2026 redraw).
//
// Extracted mechanically from that file's exported GEOMETRY rather than
// retyped, so the outlines are pixel-identical to the ones already drawn there.
// Kept as plain path data with no behaviour attached: FitForge's version is an
// interactive tab with a heat overlay, a sex switch and click-to-filter, none of
// which belongs on an exercise page in this app.
//
// Both views share FitForge's 0 0 220 480 viewBox, so the two figures can sit
// side by side in a single 460-wide SVG without rescaling anything.
//
//   silhouette  the filled body outline
//   detail      interior definition lines, drawn over the fill
//   regions     one entry per muscle group, filled when that muscle is worked
//
// FitForge names its regions after its own zone list. The mapping onto this
// app's Muscle ids lives in components/body-map.tsx, because two of them do not
// line up one-to-one and that is a decision, not data.

export const FIGURE_VIEWBOX = { width: 220, height: 480 };

export interface FigureView {
  silhouette: string[];
  detail: string[];
  regions: Record<string, string[]>;
}

export const FIGURE: Record<'front' | 'back', FigureView> = {
  front:`;

const out = [
  header,
  viewLiteral(f.front, '  ') + ',',
  '  back:',
  viewLiteral(f.back, '  ') + ',',
  '};',
  '',
].join('\n');

fs.writeFileSync('/home/user/baseline/lib/train/figure.ts', out);
console.error('wrote lib/train/figure.ts', out.length, 'bytes');
