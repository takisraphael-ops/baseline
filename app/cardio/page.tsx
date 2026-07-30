'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Glossed from '@/components/glossed';
import Term from '@/components/term';
import { getSession, intervalsForWeek, weekForSessionCount } from '@/lib/train/programme';
import { appendTest, load, todayISO } from '@/lib/train/store';
import { maxHrTanaka, zones } from '@/lib/train/zones';
import { ROCKPORT_DISTANCE_KM, classifyVo2, cooperVo2, isMeaningfulChange, rockportVo2, vo2Band, vo2Delta } from '@/lib/train/vo2';
import type { TrainState } from '@/lib/train/types';

export default function CardioPage() {
  const [state, setState] = useState<TrainState | null>(null);
  const [kind, setKind] = useState<'rockport' | 'cooper'>('rockport');
  const [timeMin, setTimeMin] = useState('');
  const [hr, setHr] = useState('');
  const [metres, setMetres] = useState('');

  useEffect(() => {
    setState(load());
  }, []);

  if (!state) return <p className="muted py-8">Loading…</p>;
  if (!state.profile) {
    return (
      <div className="py-8">
        <p className="muted">Set up your profile first — the zones are calculated from your age and resting heart rate.</p>
        <Link href="/" className="btn btn-primary mt-3">Go to setup</Link>
      </div>
    );
  }

  const p = state.profile;
  const week = weekForSessionCount(state.logs.length);
  const zs = zones(p.age, p.restingHr);
  const z2 = zs[1];
  const max = Math.round(maxHrTanaka(p.age));
  const intervals = intervalsForWeek(week);
  const tests = [...state.tests].sort((a, b) => a.date.localeCompare(b.date));
  const latest = tests[tests.length - 1];
  const first = tests[0];

  const submit = () => {
    const vo2 =
      kind === 'rockport'
        ? rockportVo2(p.weightKg, p.age, p.sex, Number(timeMin), Number(hr))
        : cooperVo2(Number(metres));
    appendTest({
      date: todayISO(),
      kind,
      timeMin: kind === 'rockport' ? Number(timeMin) : undefined,
      hrBpm: kind === 'rockport' ? Number(hr) : undefined,
      metres: kind === 'cooper' ? Number(metres) : undefined,
      vo2max: vo2,
    });
    setState(load());
    setTimeMin('');
    setHr('');
    setMetres('');
  };

  const canSubmit = kind === 'rockport' ? Number(timeMin) > 0 && Number(hr) > 0 : Number(metres) > 0;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Cardio</h1>
        <p className="muted text-sm mt-1">
          Your standard, your zones, and the sessions that move them.
        </p>
      </header>

      {/* -------------------------------------------------------------- zone 2 */}
      <section className="card" style={{ borderColor: 'var(--accent)' }}>
        <h2 className="card-title mb-1">Your <Term id="zone-2" /></h2>
        <p className="text-3xl font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
          {z2.bpmLow}–{z2.bpmHigh} <span className="text-lg font-normal muted">bpm</span>
        </p>
        <p className="text-sm muted mt-2">{z2.talkTest} Effort {z2.rpe}.</p>
        <div className="divider my-3" />
        <p className="text-sm">
          <strong>The <Term id="talk-test">talk test</Term> wins.</strong> If the number and the
          sentence disagree, trust the sentence. Formulas for{' '}
          <Term id="max-heart-rate">maximum heart rate</Term> are wrong by 10 to 12 beats for most
          people.
        </p>
        <p className="text-sm muted mt-2">
          On a treadmill or bike display, which shows a share of maximum rather than reserve, the same
          band reads as roughly <strong>{z2.pctMaxLow}–{z2.pctMaxHigh}%</strong>.
        </p>
        <Link href="/learn/zone-2" className="btn btn-ghost w-full mt-3 text-sm">What Zone 2 is for</Link>
      </section>

      {/* --------------------------------------------------------------- zones */}
      <section className="card">
        <h2 className="card-title mb-1">All five zones</h2>
        <p className="text-sm muted mb-3">
          <Term id="max-heart-rate">Maximum heart rate</Term> {max} bpm (Tanaka),{' '}
          <Term id="resting-heart-rate">resting</Term> {p.restingHr} bpm. Bands are a share of{' '}
          <Term id="heart-rate-reserve">heart-rate reserve</Term>.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="muted text-xs uppercase tracking-wide text-left">
              <th className="font-medium pb-1">Zone</th>
              <th className="font-medium pb-1 text-right">bpm</th>
              <th className="font-medium pb-1 text-right">% max</th>
            </tr>
          </thead>
          <tbody>
            {zs.map((z) => (
              <tr key={z.n} style={z.n === 2 ? { color: 'var(--accent)' } : undefined}>
                <td className="py-1.5">
                  <span className="font-medium">{z.n}</span> <span className={z.n === 2 ? '' : 'muted'}>{z.name}</span>
                </td>
                <td className="py-1.5 text-right tabular-nums">{z.bpmLow}–{z.bpmHigh}</td>
                <td className="py-1.5 text-right tabular-nums muted">{z.pctMaxLow}–{z.pctMaxHigh}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ----------------------------------------------------------- the walk */}
      <section className="card">
        <h2 className="card-title mb-1">Check your walk once</h2>
        <p className="text-sm muted">
          On the way to the gym, walk at your normal pace and check your heart rate after ten minutes.
        </p>
        <ul className="text-sm mt-2 space-y-1.5">
          <li><strong>Under {z2.bpmLow} bpm</strong> <span className="muted">— recovery pace. Useful, but not training. Walk faster or take a hillier route and it becomes both.</span></li>
          <li><strong>{z2.bpmLow}–{z2.bpmHigh} bpm</strong> <span className="muted">— <Term id="zone-2" />. Your commute is already proper aerobic training, four days a week.</span></li>
          <li><strong>Over {z2.bpmHigh} bpm</strong> <span className="muted">— too hard for a warm-up. Ease off, or you will arrive at the leg press already tired.</span></li>
        </ul>
      </section>

      {/* ----------------------------------------------------------- this week */}
      <section className="card">
        <h2 className="card-title mb-1">This week — {getSession('upper-b').name} finisher</h2>
        <p className="text-sm muted"><Glossed text={intervals.note} /></p>
        {intervals.intervals && (
          <p className="text-sm mt-2">
            <strong>{intervals.intervals.rounds} rounds</strong> · {intervals.intervals.workSec}s hard,{' '}
            {intervals.intervals.restSec}s easy · target zone {intervals.intervals.zone} (
            {zs[intervals.intervals.zone - 1].bpmLow}–{zs[intervals.intervals.zone - 1].bpmHigh} bpm)
          </p>
        )}
        <p className="text-sm muted mt-2">
          <Term id="intervals" /> go on an upper-body day only — never after legs, because of the{' '}
          <Term id="interference-effect">interference effect</Term>.{' '}
          <Link href="/learn/lift-before-cardio" className="underline">Why</Link>
        </p>
      </section>

      {/* ------------------------------------------------------------- vo2 max */}
      <section className="card">
        <h2 className="card-title mb-1"><Term id="vo2-max" /></h2>
        {latest ? (
          <>
            <p className="text-3xl font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
              {latest.vo2max.toFixed(1)}{' '}
              <span className="text-lg font-normal muted">ml/kg/min</span>
            </p>
            <p className="text-sm muted mt-1">
              Estimated — likely between {vo2Band(latest.vo2max).low.toFixed(0)} and{' '}
              {vo2Band(latest.vo2max).high.toFixed(0)}. {classifyVo2(latest.vo2max)} for women aged 20–29.
            </p>
            {first && first !== latest && (
              <p className="text-sm mt-2">
                {isMeaningfulChange(first.vo2max, latest.vo2max) ? (
                  <span style={{ color: vo2Delta(first.vo2max, latest.vo2max) > 0 ? 'var(--success)' : 'var(--warning)' }}>
                    {vo2Delta(first.vo2max, latest.vo2max) > 0 ? '+' : ''}
                    {vo2Delta(first.vo2max, latest.vo2max).toFixed(1)}% since your first test.
                  </span>
                ) : (
                  <span className="muted">
                    Change since your first test is within the margin of error — which means it says
                    nothing yet, either way.
                  </span>
                )}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm muted">
            No baseline yet. One test this week gives you a number to beat in week 6 — and right now
            nothing tells you whether your cardio is improving.
          </p>
        )}
        <Link href="/learn/vo2-max" className="btn btn-ghost w-full mt-3 text-sm">
          What VO2 max is, and what it is not
        </Link>
      </section>

      {/* ---------------------------------------------------------- test entry */}
      <section className="card">
        <h2 className="card-title mb-3">Record a test</h2>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setKind('rockport')}
            className={`btn flex-1 text-sm ${kind === 'rockport' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Walk test
          </button>
          <button
            onClick={() => setKind('cooper')}
            className={`btn flex-1 text-sm ${kind === 'cooper' ? 'btn-primary' : 'btn-ghost'}`}
          >
            12-minute test
          </button>
        </div>

        {kind === 'rockport' ? (
          <>
            <p className="text-sm muted mb-3">
              The <Term id="rockport">walk test</Term>: walk {ROCKPORT_DISTANCE_KM} km as fast as you
              can sustain — a hard walk, not a jog. Record the time, and take your heart rate the
              moment you stop. Safe to do from week 1.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="t" className="text-sm font-medium block mb-1">Time (minutes)</label>
                <input id="t" type="number" inputMode="decimal" step="0.1" className="input num" value={timeMin} onChange={(e) => setTimeMin(e.target.value)} placeholder="15.5" />
              </div>
              <div>
                <label htmlFor="h" className="text-sm font-medium block mb-1">Heart rate at finish</label>
                <input id="h" type="number" inputMode="numeric" className="input num" value={hr} onChange={(e) => setHr(e.target.value)} placeholder="150" />
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm muted mb-3">
              The <Term id="cooper-test">Cooper test</Term>: cover as much distance as you can in
              exactly 12 minutes, on a treadmill or bike. This one needs a genuinely maximal effort —
              save it for week 6 or later.
            </p>
            <label htmlFor="m" className="text-sm font-medium block mb-1">Distance (metres)</label>
            <input id="m" type="number" inputMode="numeric" className="input num" value={metres} onChange={(e) => setMetres(e.target.value)} placeholder="2000" />
          </>
        )}

        <button onClick={submit} disabled={!canSubmit} className="btn btn-primary w-full mt-3">
          Save test
        </button>
        <p className="text-xs muted mt-2">
          Repeat the same test each time. Mixing protocols produces a trend line that means nothing.
        </p>
      </section>

      {tests.length > 0 && (
        <section className="card">
          <h2 className="card-title mb-2">Test history</h2>
          <ul className="text-sm space-y-1.5">
            {[...tests].reverse().map((t, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="muted">{t.date} · {t.kind === 'rockport' ? 'Walk test' : '12-min test'}</span>
                <span className="tabular-nums font-medium">{t.vo2max.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
