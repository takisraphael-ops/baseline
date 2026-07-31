'use client';

// The Learn index. A radial category filter above, the articles below.
//
// Nothing selected shows every article grouped under its own heading, which is
// the state the page had before the ring existed and the one that answers
// "what is in here?" fastest. Choosing a wedge narrows it to that group.

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import LearnRadial from '@/components/learn-radial';
import { LEARN_CATEGORIES, articlesIn } from '@/lib/train/learn';
import type { Article, LearnCategory } from '@/lib/train/learn';

function ArticleRow({ a }: { a: Article }) {
  return (
    <li>
      <Link href={`/learn/${a.slug}`} className="card flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="font-medium block leading-tight">{a.title}</span>
          <span className="muted text-sm">{a.oneLiner}</span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {a.unlocksWeek !== undefined && (
            <span className="chip chip-outline">Week {a.unlocksWeek}</span>
          )}
          <ChevronRight size={18} className="muted" aria-hidden />
        </span>
      </Link>
    </li>
  );
}

export default function LearnBrowser() {
  const [selected, setSelected] = useState<LearnCategory | null>(null);

  const counts = Object.fromEntries(
    LEARN_CATEGORIES.map((c) => [c.id, articlesIn(c.id).length]),
  ) as Record<LearnCategory, number>;

  const shown = selected ? LEARN_CATEGORIES.filter((c) => c.id === selected) : LEARN_CATEGORIES;

  return (
    <>
      <LearnRadial counts={counts} selected={selected} onSelect={setSelected} />

      {/* Announced, because the list changing is the only feedback that a wedge
          did anything, and a sighted user gets that from the list itself. */}
      <p className="sr-only" role="status" aria-live="polite">
        {selected
          ? `Showing ${counts[selected]} ${LEARN_CATEGORIES.find((c) => c.id === selected)!.label} articles`
          : 'Showing all articles'}
      </p>

      {shown.map((cat) => (
        <section key={cat.id}>
          <h2 className="card-title mb-1">{cat.label}</h2>
          {cat.blurb && <p className="muted text-sm mb-2">{cat.blurb}</p>}
          <ul className="space-y-2">
            {articlesIn(cat.id).map((a) => (
              <ArticleRow key={a.slug} a={a} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
