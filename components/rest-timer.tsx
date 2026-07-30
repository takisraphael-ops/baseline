'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, X } from 'lucide-react';

// Visual countdown plus a vibration on finish where the device supports it.
// No notification permission is requested and no sound is played unprompted —
// a phone that buzzes unexpectedly in a quiet gym is worse than no timer.

export default function RestTimer({ seconds, onClose }: { seconds: number; onClose: () => void }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  const fired = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left === 0 && !fired.current) {
      fired.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.([120, 80, 120]);
      }
    }
  }, [left]);

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  const pct = seconds > 0 ? ((seconds - left) / seconds) * 100 : 100;
  const done = left === 0;

  return (
    // The wrapper spans the full width but must not swallow taps either side of
    // the card — otherwise it silently blocks the buttons underneath it.
    <div
      className="fixed bottom-[76px] inset-x-0 z-40 px-4 pb-2 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="card max-w-md mx-auto flex items-center gap-3 shadow-lg pointer-events-auto">
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm muted">{done ? 'Rest complete' : 'Resting'}</span>
            <span className="text-xl font-semibold tabular-nums">
              {mm}:{ss}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${pct}%`, background: done ? 'var(--success)' : 'var(--accent)' }}
            />
          </div>
        </div>
        <button
          onClick={() => setRunning((r) => !r)}
          className="btn btn-ghost px-3 min-h-0 py-2"
          aria-label={running ? 'Pause timer' : 'Resume timer'}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          onClick={() => {
            fired.current = false;
            setLeft(seconds);
            setRunning(true);
          }}
          className="btn btn-ghost px-3 min-h-0 py-2"
          aria-label="Restart timer"
        >
          <RotateCcw size={16} />
        </button>
        <button onClick={onClose} className="btn btn-ghost px-3 min-h-0 py-2" aria-label="Dismiss timer">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
