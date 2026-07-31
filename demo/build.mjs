// Bundles the app into one self-contained HTML file for hosting as a static page.
//
//   node demo/build.mjs   ->   demo/dist/baseline.html
//
// Everything is inlined: JS, CSS, no external requests of any kind. The page
// components in app/ are used unchanged — the Next-specific imports are aliased
// to the shims in demo/shims at bundle time.

import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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

// ------------------------------------------------------------ offline cache
// Standalone builds only. The service worker has to be a separate file at a
// real URL — it cannot be inlined — and the artifact host serves exactly the
// one fragment it is given, so there is nowhere to put it there. The fragment
// build therefore never mentions it.
//
// Identifies the build by its contents rather than a version number, so a cache
// is invalidated by the app actually changing and by nothing else.
const buildId = createHash('sha256').update(js).update(css).update(fontFace).digest('hex').slice(0, 12);

// Cache-first, revalidating in the background.
//
// The usual advice is network-first with a cache fallback, and it is wrong for
// this app. The case this exists for is a gym basement: a phone associated with
// a wifi access point that has no route out does not fail fast, it hangs, and
// network-first would make the app open slower with bad signal than with none.
// Cache-first opens instantly whatever the signal is doing; the background
// fetch pulls a new build in for the next launch.
//
// The staleness that buys is bounded at one launch. A changed build changes
// buildId, which changes this file, which the browser re-fetches on every
// navigation because the registration below sets updateViaCache: 'none' — so a
// new build installs on the launch after it ships even if the background fetch
// never runs.
const SW = `// Generated by demo/build.mjs — do not edit. Rebuilt on every deploy.
const CACHE = 'baseline-${buildId}';
const SHELL = './';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // cache: 'reload' bypasses the HTTP cache, so a new build is never
      // installed from the stale copy it exists to replace.
      .then((c) => c.add(new Request(SHELL, { cache: 'reload' })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith('baseline-') && key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  // Page loads only. Routing is hash-based, so every route is this one
  // document and there is nothing else to intercept — the app issues no
  // requests at all once it has booted.
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(SHELL);
      const fresh = fetch(event.request)
        .then((res) => {
          // A redirected response cannot be returned from respondWith for a
          // navigation, and caching one would poison every later launch.
          if (res && res.ok && !res.redirected) cache.put(SHELL, res.clone());
          return res;
        })
        .catch(() => null);
      // Cache first. This is also what fixes pull-to-refresh: a reload sends
      // no-cache, the browser will not fall back to its own HTTP cache, and it
      // fails offline however fresh that copy is. A service worker answers
      // before any of that applies.
      return hit || (await fresh) || Response.error();
    })(),
  );
});
`;

// Registered on load so it never competes with the first paint. Guarded on
// isSecureContext because service workers do not exist over file://, which is
// how the build is opened for local checks — an unguarded register() throws
// there and the app is fine without one.
const SW_REGISTER = `(function(){if(!('serviceWorker' in navigator)||!window.isSecureContext)return;window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(function(r){r.update()}).catch(function(){})})})();`;

// --------------------------------------------------------------------- page
// Applies the saved theme before the first paint, in both targets — the
// fragment runs it before the splash markup that follows, the standalone build
// runs it from <head>. A second copy of lib/train/theme.ts's THEME_BOOT_SCRIPT,
// for the same reason the splash markup is duplicated: this file cannot import
// TypeScript, and the script has to execute before any bundle parses. The
// fixture run fails if the two ever drift.
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('baseline.theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})();`;

const head = `<script>${THEME_BOOT}</script>
<title>Baseline — twelve-week training plan</title>
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

// Tab and home-screen icon, drawn here rather than linked. The workflow deploys
// exactly one file, so anything under public/ simply is not there — a `<link>`
// to /icons/icon-192.png would 404 and the app would fall back to a blank page
// glyph. An inline SVG data URI needs no second request and scales to any size.
// Three ascending bars: the whole app in one mark.
//
// Note this covers `rel="icon"`, which every browser honours. It deliberately
// does not add `apple-touch-icon` — iOS wants a real PNG at a real URL and its
// support for data URIs there is unreliable, so a wrong one would look broken
// rather than absent. Add-to-home-screen on iOS still needs a hosted PNG.
const ACCENT = '#0a7683';
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="${ACCENT}"/>
<rect x="14" y="36" width="9" height="16" rx="2.5" fill="#fff"/>
<rect x="27.5" y="26" width="9" height="26" rx="2.5" fill="#fff"/>
<rect x="41" y="14" width="9" height="38" rx="2.5" fill="#fff"/>
</svg>`;
const iconHref = `data:image/svg+xml,${encodeURIComponent(iconSvg.replace(/\n/g, ''))}`;

// Standalone build: a complete document, because nothing else is going to
// supply one. The viewport meta is the load-bearing line — without it the app
// is laid out at 980px and scaled down on every phone.
const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#0a7683">
<meta name="description" content="A twelve-week strength and cardio plan that runs itself.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Baseline">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="robots" content="noindex">
<link rel="icon" href="${iconHref}">
${head}
</head>
<body>
${body}
<script>${SW_REGISTER}</script>
</body>
</html>
`;

const html = isStandalone ? document : fragment;

writeFileSync(resolve(out, outName), html);
// Two files now, and only for this target. Whatever deploys the standalone
// build has to carry sw.js next to index.html: registration asks for './sw.js'
// relative to the page, and a missing one 404s, is swallowed by the catch
// above, and leaves the app exactly as offline-hostile as it was before —
// silently. .github/workflows/pages.yml copies both, and the fixture run
// checks that it still does.
if (isStandalone) writeFileSync(resolve(out, 'sw.js'), SW);
rmSync(twConfig, { force: true });
console.log(`\nwrote demo/dist/${outName} — ${(html.length / 1024).toFixed(0)} kB${isClient ? ' (no sample data)' : ' (preview, seeded)'}`);
if (isStandalone) console.log(`wrote demo/dist/sw.js — offline cache baseline-${buildId}`);
