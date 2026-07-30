'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { clearAll } from '@/lib/train/store';
import { SAMPLE_FLAG } from './seed';

// Demo-only. Lives here rather than in app/ so nothing about the hosted preview
// leaks into the real app.
//
// The preview opens on "Week 4 of 12" because it is preloaded with three weeks
// of logged sessions — otherwise Progress, the load chart and the "last time"
// chips would all be empty and there would be nothing to look at. Without
// saying so, that reads as if the programme starts a quarter of the way in.

export default function DemoBanner() {
  const [busy, setBusy] = useState(false);

  let hasSample = false;
  try {
    hasSample = window.localStorage.getItem(SAMPLE_FLAG) === '1';
  } catch {
    hasSample = false;
  }
  if (!hasSample) return null;

  const startFresh = () => {
    setBusy(true);
    clearAll();
    try {
      // Only the sample marker goes. The seeded flag must stay, otherwise the
      // next load sees empty storage and immediately re-seeds the very history
      // this button exists to remove.
      window.localStorage.removeItem(SAMPLE_FLAG);
    } catch {
      // Storage is blocked; the in-memory clear above is the best available.
    }
    window.location.hash = '/';
    window.location.reload();
  };

  return (
    <div
      className="card mb-4"
      style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}
    >
      <div className="flex items-start gap-3">
        <Info size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
        <div className="text-sm min-w-0">
          <p className="font-semibold">This preview is showing sample data</p>
          <p className="muted mt-1">
            Three weeks are already logged, which is why it opens on week 4 — it gives the charts,
            the load history and the &ldquo;last time&rdquo; numbers something to show. A real first
            session starts at week 1.
          </p>
          <button onClick={startFresh} disabled={busy} className="btn btn-primary btn-sm mt-3">
            {busy ? 'Clearing…' : 'Clear it and start from week 1'}
          </button>
        </div>
      </div>
    </div>
  );
}
