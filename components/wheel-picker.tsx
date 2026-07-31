'use client';

// A scroll wheel for picking a number, in a sheet.
//
// This exists because of one line in the README: "typing a number into a phone
// keyboard between sets is the interaction to design out". The steppers already
// handle ±1. What they are bad at is a big jump — going 40 kg to 60 kg is four
// taps at a 5 kg step, and eight at 2.5. The wheel is one flick.
//
// Deliberately NOT replacing the inline field. The set row survives a 375px
// phone by a small margin and has been clipped before; a wheel embedded in it
// would fight for the same space. Tapping the number opens this instead, so the
// row is untouched and the wheel gets the whole width.
//
// Snapping is CSS scroll-snap rather than a scroll-position calculation on every
// frame — the browser does the physics, which is why it feels native and costs
// nothing. The selected value is read on scroll end.

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const ROW = 44;

export default function WheelPicker({
  open,
  title,
  unit,
  value,
  step,
  min,
  max,
  onPick,
  onClose,
}: {
  open: boolean;
  title: string;
  unit: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onPick: (v: number) => void;
  onClose: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(value);

  const values: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) values.push(Math.round(v * 100) / 100);
  // The current value is not always on the grid. A machine that moves in 2.5 kg
  // steps still ends up at 19 kg via micro-plates or an imported log, and a
  // wheel that cannot show 19 opens on 20 — so confirming without touching
  // anything would silently change what she lifted. Slot it in where it belongs
  // rather than rounding it away.
  if (!values.some((v) => Math.abs(v - value) < 1e-9)) {
    const at = values.findIndex((v) => v > value);
    values.splice(at === -1 ? values.length : at, 0, Math.round(value * 100) / 100);
  }

  const indexOf = (v: number) => {
    let best = 0;
    for (let i = 1; i < values.length; i++) {
      if (Math.abs(values[i] - v) < Math.abs(values[best] - v)) best = i;
    }
    return best;
  };

  // Before paint, so the wheel is never seen at the top before jumping to the
  // current value.
  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = indexOf(value) * ROW;
    setLive(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const i = Math.min(values.length - 1, Math.max(0, Math.round(el.scrollTop / ROW)));
    setLive(values[i]);
  };

  const nudge = (delta: number) => {
    const el = listRef.current;
    if (!el) return;
    const i = Math.min(values.length - 1, Math.max(0, indexOf(live) + delta));
    el.scrollTo({ top: i * ROW, behavior: 'smooth' });
    setLive(values[i]);
  };

  return (
    <div className="wheel-scrim" onClick={onClose}>
      <div
        ref={sheetRef}
        className="wheel-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); nudge(-1); }
          if (e.key === 'ArrowDown') { e.preventDefault(); nudge(1); }
        }}
      >
        <p className="wheel-title">{title}</p>

        <div className="wheel">
          {/* The magnifier: a fixed band the numbers pass under. */}
          <div className="wheel-lens" aria-hidden="true" />
          <div className="wheel-list" ref={listRef} onScroll={onScroll}>
            {/* Half a wheel of padding top and bottom, so the first and last
                values can reach the middle. */}
            <div className="wheel-pad" aria-hidden="true" />
            {values.map((v) => (
              <button
                key={v}
                type="button"
                className={`wheel-item${Math.abs(v - live) < 1e-9 ? ' is-live' : ''}`}
                onClick={() => { onPick(v); onClose(); }}
              >
                {v}
              </button>
            ))}
            <div className="wheel-pad" aria-hidden="true" />
          </div>
          <span className="wheel-unit" aria-hidden="true">{unit}</span>
        </div>

        <p className="sr-only" role="status" aria-live="polite">{live} {unit}</p>

        <div className="flex gap-3 mt-3">
          <button type="button" className="btn btn-ghost flex-1 text-sm" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary flex-1 text-sm"
            onClick={() => { onPick(live); onClose(); }}
          >
            Set {live} {unit}
          </button>
        </div>
      </div>
    </div>
  );
}
