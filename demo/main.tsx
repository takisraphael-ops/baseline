// Entry point for the single-file hosted build.
//
// Imports the real page components unchanged — `next/link`, `next/navigation`
// and `next/font/google` are aliased to local shims at bundle time (see
// demo/build.mjs), so nothing in app/ or components/ is forked for the demo.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen } from 'lucide-react';

import Nav from '@/components/nav';
import Today from '@/app/page';
import PlanPage from '@/app/plan/page';
import LibraryPage from '@/app/library/page';
import ExercisePage from '@/app/library/[id]/page';
import CardioPage from '@/app/cardio/page';
import LearnPage from '@/app/learn/page';
import ArticlePage from '@/app/learn/[slug]/page';
import ProgressPage from '@/app/progress/page';
import SettingsPage from '@/app/settings/page';
import SessionPage from '@/app/session/[id]/page';

import { usePathname } from './shims/navigation';
import { seedIfEmpty } from './seed';
import DemoBanner from './demo-banner';

/**
 * True in the preview build, false in the build handed to the athlete.
 * Replaced at bundle time, so the sample history and the preview banner are
 * dead-code-eliminated out of the client build entirely rather than merely
 * hidden.
 */
declare const __PREVIEW__: boolean;

function route(path: string): React.ReactNode {
  const seg = path.split('/').filter(Boolean);
  if (seg.length === 0) return <Today />;
  const [head, param] = seg;
  switch (head) {
    case 'plan': return <PlanPage />;
    case 'library': return param ? <ExercisePage params={{ id: param }} /> : <LibraryPage />;
    case 'learn': return param ? <ArticlePage params={{ slug: param }} /> : <LearnPage />;
    case 'cardio': return <CardioPage />;
    case 'progress': return <ProgressPage />;
    case 'settings': return <SettingsPage />;
    case 'session': return param ? <SessionPage params={{ id: param }} /> : <Today />;
    default: return <Today />;
  }
}

class Boundary extends React.Component<{ children: React.ReactNode; path: string }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidUpdate(prev: { path: string }) {
    if (prev.path !== this.props.path && this.state.error) this.setState({ error: false });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="py-8">
          <p className="muted">That page does not exist.</p>
          <a href="#/" className="btn btn-ghost mt-3">Back to today</a>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const path = usePathname();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="min-h-screen flex flex-col pb-[76px]">
      <header className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto w-full">
        <a href="#/" className="font-semibold tracking-tight text-[17px] py-1.5 -my-1.5">Baseline</a>
        <a href="#/learn" className="learn-cta">
          <BookOpen size={17} aria-hidden />
          Learn
        </a>
      </header>
      <main className="flex-1 px-4 pb-8 max-w-2xl mx-auto w-full">
        {__PREVIEW__ && path === '/' && <DemoBanner />}
        {/* Keyed on the path so each route mounts fresh and the previous one is
            torn down — without it React reuses the subtree across navigations,
            which both stacks duplicate cards and leaks one session's logged sets
            into the next. */}
        <Boundary key={path} path={path}>{route(path)}</Boundary>
      </main>
      <Nav />
    </div>
  );
}

if (__PREVIEW__) seedIfEmpty();
if (!window.location.hash) window.location.hash = '/';
createRoot(document.getElementById('root')!).render(<App />);
