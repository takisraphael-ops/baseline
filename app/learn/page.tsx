import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ARTICLES } from '@/lib/train/learn';

export const metadata = { title: 'Learn · Baseline' };

export default function LearnPage() {
  const always = ARTICLES.filter((a) => a.unlocksWeek === undefined && a.topic === undefined);
  const gated = ARTICLES.filter((a) => a.unlocksWeek !== undefined).sort((a, b) => a.unlocksWeek! - b.unlocksWeek!);
  const nutrition = ARTICLES.filter((a) => a.topic === 'nutrition');

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Learn</h1>
        <p className="muted text-sm mt-1">
          Every idea the programme runs on, in plain English, with the reasoning rather than the rule.
        </p>
      </header>

      <Link href="/learn/glossary" className="card block" style={{ borderColor: 'var(--accent)' }}>
        <p className="font-semibold">Every word this app uses</p>
        <p className="muted text-sm mt-0.5">
          Rep, set, primer, block, deload, Zone 2 — one page, plain definitions. Start here if
          anything on a screen is unfamiliar.
        </p>
      </Link>

      <section>
        <ul className="space-y-2">
          {always.filter((a) => a.slug !== 'glossary').map((a) => (
            <li key={a.slug}>
              <Link href={`/learn/${a.slug}`} className="card flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="font-medium block leading-tight">{a.title}</span>
                  <span className="muted text-sm">{a.oneLiner}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="card-title mb-1">Food and fuel</h2>
        <p className="muted text-sm mb-2">
          Background reading, not instructions. The programme sets no calorie target and no weight
          goal, and nothing here asks you to weigh or log anything — these pages are here so the
          vocabulary stops being mysterious. If thinking carefully about food is difficult for you,
          they are optional, and skipping them costs you nothing.
        </p>
        <ul className="space-y-2">
          {nutrition.map((a) => (
            <li key={a.slug}>
              <Link href={`/learn/${a.slug}`} className="card flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="font-medium block leading-tight">{a.title}</span>
                  <span className="muted text-sm">{a.oneLiner}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="card-title mb-1">Techniques</h2>
        <p className="muted text-sm mb-2">
          Explained now, used later. A beginner already gets close to the maximum available result
          from ordinary straight sets — these add fatigue before they add benefit, so each one
          arrives when it will actually do something.
        </p>
        <ul className="space-y-2">
          {gated.map((a) => (
            <li key={a.slug}>
              <Link href={`/learn/${a.slug}`} className="card flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="font-medium block leading-tight">{a.title}</span>
                  <span className="muted text-sm">{a.oneLiner}</span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="chip chip-outline">Week {a.unlocksWeek}</span>
                  <ChevronRight size={18} className="muted" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
