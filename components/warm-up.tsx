'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Footprints, PlayCircle, Snowflake, TrendingUp } from 'lucide-react';
import { drillDemoUrl, prepFor, rampSets } from '@/lib/train/mobility';
import type { Drill } from '@/lib/train/mobility';

function DrillList({ drills }: { drills: Drill[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <ul className="space-y-1.5 mt-3">
      {drills.map((d, i) => {
        const isOpen = open === i;
        return (
          <li key={d.name} className="rounded-[10px]" style={{ background: 'var(--bg-sunken)' }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-3 text-left px-3 py-2.5"
              aria-expanded={isOpen}
            >
              <span className="min-w-0">
                <span className="font-medium text-sm block leading-tight">{d.name}</span>
                <span className="text-xs muted tabular">{d.dose}</span>
              </span>
              {isOpen ? <ChevronUp size={15} className="muted shrink-0" /> : <ChevronDown size={15} className="muted shrink-0" />}
            </button>
            {isOpen && (
              <div className="px-3 pb-3 text-sm space-y-1.5">
                <p>{d.how}</p>
                <p className="muted text-[13px]">{d.why}</p>
                {/* "90/90 hip switches" cannot be pictured from a paragraph. A
                    drill she cannot picture is a drill she skips. */}
                <a
                  href={drillDemoUrl(d)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-cta watch-cta-sm w-full mt-2"
                  aria-label={`Watch a demonstration of ${d.name} on YouTube`}
                >
                  <PlayCircle size={16} aria-hidden />
                  Watch demo
                </a>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function WarmUp({
  sessionId, mainLiftName, workingKg, incrementKg,
}: { sessionId: string; mainLiftName: string; workingKg: number; incrementKg: number }) {
  const [open, setOpen] = useState(false);
  const { warmUp } = prepFor(sessionId);
  const ramp = rampSets(workingKg, incrementKg);

  return (
    <section className="card">
      <div className="flex items-start gap-3">
        <Footprints size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="card-title">Warm-up</h2>
          <p className="text-sm muted mt-0.5">
            The walk in has raised your temperature. These four drills open the joints this session
            actually loads — about three minutes, and none of it should tire you out.
          </p>
        </div>
      </div>

      <button onClick={() => setOpen((o) => !o)} className="btn btn-ghost w-full mt-3 btn-sm" aria-expanded={open}>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        {open ? 'Hide warm-up' : `Show the ${warmUp.length} drills`}
      </button>

      {open && (
        <div className="pop-in">
          <DrillList drills={warmUp} />

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} style={{ color: 'var(--accent)' }} aria-hidden />
              <h3 className="card-title">Then ramp up on the {mainLiftName}</h3>
            </div>
            <p className="text-sm muted mb-2">
              Rehearsal sets, not work. They are never logged and never counted — but they are the
              part that makes the first working set feel like the third.
            </p>
            <ul className="space-y-1.5">
              {ramp.map((r, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between gap-3 px-3 py-2 rounded-[10px] text-sm"
                  style={{ background: 'var(--bg-sunken)' }}
                >
                  <span className="font-semibold tabular" style={{ color: 'var(--accent)' }}>
                    {r.kg > 0 ? `${r.kg} kg` : 'Bodyweight'} × {r.reps}
                  </span>
                  <span className="muted text-[13px] text-right min-w-0">{r.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm muted mt-3">
            Arrived cold or soaked through? Add five easy minutes on a bike before the drills.
          </p>
        </div>
      )}
    </section>
  );
}

export function CoolDown({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const { coolDown } = prepFor(sessionId);

  return (
    <section className="card">
      <div className="flex items-start gap-3">
        <Snowflake size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="card-title">Cool-down</h2>
          <p className="text-sm muted mt-0.5">
            Three stretches, about two minutes, then walk home. It will not stop you being sore —
            nothing reliably does — but it gets your breathing down and keeps the range that lifting
            quietly takes away.
          </p>
        </div>
      </div>
      <button onClick={() => setOpen((o) => !o)} className="btn btn-ghost w-full mt-3 btn-sm" aria-expanded={open}>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        {open ? 'Hide stretches' : 'Show the stretches'}
      </button>
      {open && <div className="pop-in"><DrillList drills={coolDown} /></div>}
    </section>
  );
}
