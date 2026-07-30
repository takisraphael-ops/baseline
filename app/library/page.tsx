'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, X } from 'lucide-react';
import MuscleMap from '@/components/muscle-map';
import { EQUIPMENT_LABELS, EXERCISES, MUSCLE_LABELS } from '@/lib/train/exercises';
import type { Equipment } from '@/lib/train/types';

const FILTERS: { value: Equipment | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'machine', label: 'Machines' },
  { value: 'cable', label: 'Cables' },
  { value: 'dumbbell', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbells' },
  { value: 'bodyweight', label: 'Bodyweight' },
];

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Equipment | 'all'>('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (filter !== 'all' && e.equipment !== filter) return false;
      if (!q) return true;
      // Match the name or any muscle it works, so "glutes" finds the hip thrust.
      const haystack = [e.name, ...e.primary, ...e.secondary].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [query, filter]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Exercise library</h1>
        <p className="muted text-sm mt-1">
          Every exercise, with the machine adjustments named explicitly — which lever, which pad,
          where it lines up.
        </p>
      </header>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 muted pointer-events-none" aria-hidden />
        <input
          className="input pl-9 pr-9"
          placeholder="Search by name or muscle…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full muted"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="chip chip-tap shrink-0"
            style={
              filter === f.value
                ? { background: 'var(--accent)', color: 'var(--on-accent)' }
                : undefined
            }
            aria-pressed={filter === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="muted text-sm py-8 text-center">
          Nothing matches “{query}”. Try a muscle name — glutes, lats, hamstrings.
        </p>
      ) : (
        <ul className="space-y-2">
          {results.map((e) => (
            <li key={e.id}>
              <Link href={`/library/${e.id}`} className="card flex items-center gap-3" style={{ padding: '12px 14px' }}>
                <MuscleMap primary={e.primary} secondary={e.secondary} className="w-11 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="font-semibold block leading-tight">{e.name}</span>
                  <span className="muted text-sm">
                    {e.primary.map((m) => MUSCLE_LABELS[m]).join(', ')}
                  </span>
                  <span className="chip mt-1.5" style={{ fontSize: 10.5 }}>{EQUIPMENT_LABELS[e.equipment]}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs faint text-center">
        {results.length} of {EXERCISES.length} exercises
      </p>
    </div>
  );
}
