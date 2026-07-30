// Bundles the app into one self-contained HTML file for hosting as a static page.
//
//   node demo/build.mjs   ->   demo/dist/baseline.html
//
// Everything is inlined: JS, CSS, no external requests of any kind. The page
// components in app/ are used unchanged — the Next-specific imports are aliased
// to the shims in demo/shims at bundle time.

import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'demo/dist');

// Builds from one entry:
//   default        preview — seeded with sample history, carries the banner
//   --client       what the athlete opens — no sample data, starts at the quiz
//   --standalone   a complete HTML document, for hosting anywhere that is not
//                  the artifact host (a static host, or just emailing the file)
//
// The standalone flag matters more than it looks. The artifact host wraps the
// file it is given in its own <!doctype>/<head>/<body>, and that head supplies
// the viewport meta. Served from anywhere else, a file without one is laid out
// by phones at the ~980px default width and then zoomed out — so a build that
// looks perfect inside the host is unusable on the phone it was designed for.
const isClient = process.argv.includes('--client');
const isStandalone = process.argv.includes('--standalone');
const outName = isStandalone
  ? 'index.html'
  : isClient
    ? 'baseline-client.html'
    : 'baseline.html';
mkdirSync(out, { recursive: true });

// --------------------------------------------------------------------- styles
// Tailwind scans the same sources as the Next build, plus the demo entry.
const twConfig = resolve(out, 'tailwind.demo.js');
writeFileSync(
  twConfig,
  `module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './demo/**/*.{ts,tsx}'],
  theme: { extend: { fontFamily: { sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'] } } },
  plugins: [],
};`,
);
execFileSync(
  'npx',
  ['tailwindcss', '-c', twConfig, '-i', resolve(root, 'app/globals.css'), '-o', resolve(out, 'app.css'), '--minify'],
  { cwd: root, stdio: 'inherit' },
);
const css = readFileSync(resolve(out, 'app.css'), 'utf8');

// ------------------------------------------------------------------- bundle
await build({
  entryPoints: [resolve(root, 'demo/main.tsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  outfile: resolve(out, 'app.js'),
  absWorkingDir: root,
  define: {
    'process.env.NODE_ENV': '"production"',
    __PREVIEW__: isClient ? 'false' : 'true',
  },
  alias: {
    'next/link': resolve(root, 'demo/shims/link.tsx'),
    'next/navigation': resolve(root, 'demo/shims/navigation.ts'),
  },
  loader: { '.ts': 'ts', '.tsx': 'tsx' },
  logLevel: 'info',
});
const js = readFileSync(resolve(out, 'app.js'), 'utf8');

// ----------------------------------------------------------------- typeface
// Inline the same Inter subset next/font self-hosts for the real build, as a
// data URI. A linked font URL would be blocked by the host's CSP and fall back
// silently, so the demo would not match the app it is demonstrating.
let fontFace = '';
try {
  const media = resolve(root, '.next/static/media');
  // The `.p.` file is the preloaded latin subset.
  const latin = readdirSync(media).find((f) => f.endsWith('-s.p.woff2'));
  if (latin) {
    const b64 = readFileSync(resolve(media, latin)).toString('base64');
    fontFace = `@font-face{font-family:'InterInline';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
    console.log(`inlined ${latin} (${(b64.length / 1024).toFixed(0)} kB base64)`);
  }
} catch {
  // No Next build present. The system stack below is a fine fallback.
}
if (!fontFace) {
  // Silent-ish by default so a quick local build still works, but fatal when
  // asked for. The failure mode without this is a page that looks fine to a
  // build log and ships system fonts to the athlete: CI passes, typography is
  // wrong, and nobody finds out until someone opens it.
  const msg = 'no Inter subset found — run `next build` first for matching typography';
  if (process.argv.includes('--require-font')) {
    console.error(`\n✗ ${msg}`);
    process.exit(1);
  }
  console.warn(`! ${msg}`);
}

// ------------------------------------------------------------------- splash
// Sits ahead of #root and the bundle, so it paints on the first frame rather
// than waiting for 800 kB of inline JS to parse and React to mount. It clears
// itself on a CSS animation — no timer to miss, and it still goes away if the
// app behind it fails to start. Kept in step with app/layout.tsx by
// scripts/fixture-run.ts, which fails the build if the two drift apart.
const SPLASH = `<div class="splash" aria-hidden="true">
  <div class="splash-inner">
    <div class="splash-ring"><div class="splash-bars"><i></i><i></i><i></i></div></div>
    <div class="splash-word">Baseline</div>
    <div class="splash-track"><span></span></div>
  </div>
</div>`;

// --------------------------------------------------------------------- page
const head = `<title>Baseline — twelve-week training plan</title>
<style>
${fontFace}
:root { --font-inter: ${fontFace ? "'InterInline', " : ''}-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
${css}
#root { min-height: 100vh; }
</style>`;
const body = `${SPLASH}
<div id="root"></div>
<script>${js}</script>`;

// Artifact host build: no <html>/<head>/<body> — it wraps the file itself, and
// duplicating the skeleton would nest a document inside a document.
const fragment = `${head}
${body}
`;

// Standalone build: a complete document, because nothing else is going to
// supply one. The viewport meta is the load-bearing line — without it the app
// is laid out at 980px and scaled down on every phone.
const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#0F766E">
<meta name="description" content="A twelve-week strength and cardio plan that runs itself.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Baseline">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="robots" content="noindex">
${head}
</head>
<body>
${body}
</body>
</html>
`;

const html = isStandalone ? document : fragment;

writeFileSync(resolve(out, outName), html);
rmSync(twConfig, { force: true });
console.log(`\nwrote demo/dist/${outName} — ${(html.length / 1024).toFixed(0)} kB${isClient ? ' (no sample data)' : ' (preview, seeded)'}`);
