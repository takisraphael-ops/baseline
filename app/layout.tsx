import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import './globals.css';
import Nav from '@/components/nav';
import { THEME_BOOT_SCRIPT } from '@/lib/train/theme';

// Self-hosted at build time rather than pulled from a CDN at run time: the app
// is meant to work in a gym basement with no signal, and a blocking stylesheet
// request from a third-party host is the one thing that would stop it.
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Baseline',
  description: 'A twelve-week strength and cardio plan that runs itself.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Baseline', statusBarStyle: 'default' },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  // The app's accent. This was the indigo the project template shipped with,
  // which appears nowhere in the app; the manifest and the standalone build
  // were corrected earlier and this one was missed.
  themeColor: '#0a7683',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before the first paint. Without it the page
            paints in the OS colours and then swaps once React hydrates — a white
            flash on a dark-mode phone, in a dim gym. Mirrored in demo/build.mjs. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        {/* Server-rendered ahead of the app, so it is in the first paint rather
            than appearing once React has hydrated. Clears itself on a CSS
            animation — see .splash in globals.css. Mirrored in demo/build.mjs;
            the fixture run fails if the two ever diverge. */}
        <div className="splash" aria-hidden="true">
          <div className="splash-inner">
            <div className="splash-ring"><div className="splash-bars"><i /><i /><i /></div></div>
            <div className="splash-word">Baseline</div>
            <div className="splash-track"><span /></div>
          </div>
        </div>
        <div className="min-h-screen flex flex-col pb-[76px]">
          <header className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto w-full">
            <Link href="/" className="font-semibold tracking-tight text-[17px] py-1.5 -my-1.5">
              Baseline
            </Link>
            <Link href="/learn" className="learn-cta">
              <BookOpen size={17} aria-hidden />
              Learn
            </Link>
          </header>
          <main className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">{children}</main>
          <Nav />
        </div>
      </body>
    </html>
  );
}
