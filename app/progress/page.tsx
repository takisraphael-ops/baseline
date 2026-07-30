'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Ignition from '@/components/ignition';
import Term from '@/components/term';
import { MUSCLE_LABELS, getExercise } from '@/lib/train/exercises';
import { SESSIONS, TOTAL_WEEKS, blockForWeek, getSession, nextSessionId, weekForSessionCount } from '@/lib/train/programme';
import { tonnage, topKg } from '@/lib/train/progression';
import { historyFor, load } from '@/lib/train/store';
import { actualWeeklyVolume, targetWeeklyVolume, weeklyCardioMinutes, weeklyWalkMinutes } from '@/lib/train/volume';
import type { Muscle, TrainState } from '@/lib/train/types';

const TRACKED: Muscle[] = ['glutes', 'quads', 'hamstrings', 'lats', 'upper-back', 'chest', 'side-delts'];

const profileName = (s: TrainState) => s.profile?.name ?? 'you';

export default function ProgressPage() {
  const [state, setState] = useState<TrainState | null>(null);
  const [lift, setLift] = useState('leg-press');

  useEffect(() => {
    setState(load());
  }, []);

  const mainLifts = useMemo(
    () => SESSIONS.flatMap((s) => s.slots.filter((x) => x.role === 'main' || x.role === 'secondary').map((x) => x.exerciseId)),
    [],
  );

  if (!state) return <p className="muted py-8">Loading…</p>;

  if (state.logs.length === 0) {
    return (
      <div className="py-8 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="muted text-sm">
          Nothing logged yet, {profileName(state)}. Finish your first session and this fills up —
          every set, every weight, and the trend on each lift.
        </p>
        <Link href="/" className="btn btn-primary">Start a session</Link>
      </div>
    );
  }

  const week = weekForSessionCount(state.logs.length);
  const block = blockForWeek(week);

  // A freshly started week has nothing logged in it yet. Showing a wall of zeros
  // reads as "you have done nothing" rather than "this week has not begun", so
  // fall back to how the last completed week finished and say which is shown.
  const startedThisWeek = state.logs.some((l) => l.week === week);
  const shownWeek = startedThisWeek ? week : Math.max(1, week - 1);

  const walkMin = state.profile ? weeklyWalkMinutes(state.profile.walkMinutesEachWay) : 0;
  const cardioMin = weeklyCardioMinutes(state.logs, shownWeek);
  const volume = actualWeeklyVolume(state.logs, shownWeek);
  const targets = targetWeeklyVolume(shownWeek);

  const history = [...historyFor(state, lift)].reverse();
  const chart = history.map((h, i) => ({ n: i + 1, kg: topKg(h), volume: Math.round(tonnage(h)) }));
  const firstKg = chart[0]?.kg ?? 0;
  const lastKg = chart[chart.length - 1]?.kg ?? 0;

  const totalSets = state.logs.reduce((n, l) => n + l.exercises.reduce((m, e) => m + e.sets.length, 0), 0);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <p className="muted text-sm mt-1">
          Week {week} of {TOTAL_WEEKS} · {state.logs.length} sessions · {totalSets} sets logged
        </p>
      </header>

      {/* Landing here after finishing a session used to be a dead end — the only
          way on was to work out that "Today" held the next one. */}
      {week <= TOTAL_WEEKS && (
        <Link
          href={`/session/${nextSessionId(state.logs.length)}`}
          className="card block"
          style={{ borderColor: 'var(--accent)' }}
          aria-label={`Start ${getSession(nextSessionId(state.logs.length)).name}`}
        >
          <p className="label mb-1">Next session</p>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xl font-semibold">{getSession(nextSessionId(state.logs.length)).name}</p>
              <p className="muted text-sm">{getSession(nextSessionId(state.logs.length)).focus}</p>
            </div>
            <Ignition size="sm" />
          </div>
        </Link>
      )}

      {/* --------------------------------------------------------- lift trend */}
      <section className="card">
        <label htmlFor="lift" className="font-semibold block mb-2">Load over time</label>
        <select id="lift" className="input mb-3" value={lift} onChange={(e) => setLift(e.target.value)}>
          {Array.from(new Set(mainLifts)).map((id) => (
            <option key={id} value={id}>{getExercise(id).name}</option>
          ))}
        </select>

        {chart.length < 2 ? (
          <p className="text-sm muted">Log this one twice and the trend appears here.</p>
        ) : (
          <>
            <div className="h-44 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <XAxis dataKey="n" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} stroke="var(--border)" />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} stroke="var(--border)" width={34} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elev)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                    labelFormatter={(n) => `Session ${n}`}
                    formatter={(v: number) => [`${v} kg`, 'Top set']}
                  />
                  <Line type="monotone" dataKey="kg" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {lastKg > firstKg && (
              <p className="text-sm mt-2" style={{ color: 'var(--success)' }}>
                {firstKg > 0 ? (
                  <>
                    {firstKg} kg → {lastKg} kg. That is +{Math.round(((lastKg - firstKg) / firstKg) * 100)}% since you started.
                  </>
                ) : (
                  // Lifts that start at bodyweight have a zero first entry, and a
                  // percentage of zero is Infinity — which rendered literally as
                  // "+Infinity%". The kg range says the same thing without it.
                  <>bodyweight → {lastKg} kg since you started.</>
                )}
              </p>
            )}
          </>
        )}
      </section>

      {/* -------------------------------------------------------- weekly work */}
      <section className="card">
        <h2 className="card-title mb-1">
          <Term id="hard-set">Hard sets</Term>
          {startedThisWeek ? ' this week' : ` — week ${shownWeek}`}
        </h2>
        <p className="text-sm muted mb-3">
          {startedThisWeek ? (
            <>
              Against the <Term id="block">Block</Term> {block.id} target. This is the number that
              predicts whether muscle gets built — not calories burned.
            </>
          ) : (
            `Week ${week} has not started yet, so this is how week ${shownWeek} finished.`
          )}
        </p>
        <ul className="space-y-2">
          {TRACKED.map((m) => {
            const done = Math.round(volume[m] ?? 0);
            const target = Math.round(targets[m] ?? 0);
            const pct = target > 0 ? Math.min(100, (done / target) * 100) : 0;
            return (
              <li key={m}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{MUSCLE_LABELS[m]}</span>
                  <span className="muted tabular">{done} / {target}</span>
                </div>
                <div className="meter">
                  <span style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--state-ok)' : 'var(--accent)' }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------------- cardio */}
      <section className="card">
        <h2 className="card-title mb-2">
          {startedThisWeek ? 'Aerobic work this week' : `Aerobic work — week ${shownWeek}`}
        </h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="muted text-xs uppercase tracking-wide">Walking</dt>
            <dd className="text-xl font-semibold tabular-nums">{walkMin} min</dd>
            <dd className="muted text-xs">Prescribed, four sessions</dd>
          </div>
          <div>
            <dt className="muted text-xs uppercase tracking-wide">On machines</dt>
            <dd className="text-xl font-semibold tabular-nums">{cardioMin} min</dd>
            <dd className="muted text-xs">Logged</dd>
          </div>
        </dl>
        <p className="text-sm muted mt-3">
          {walkMin + cardioMin >= 150
            ? `${walkMin + cardioMin} minutes total — past the 150 a week guideline.`
            : `${walkMin + cardioMin} minutes total. The guideline is 150 a week.`}
        </p>
      </section>

      {/* ------------------------------------------------------------ history */}
      <section className="card">
        <h2 className="card-title mb-2">Sessions</h2>
        <ul className="text-sm space-y-2">
          {[...state.logs].reverse().slice(0, 12).map((l, i) => {
            const spec = SESSIONS.find((s) => s.id === l.sessionId);
            const sets = l.exercises.reduce((n, e) => n + e.sets.length, 0);
            return (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  <span className="font-medium">{spec?.name ?? l.sessionId}</span>
                  <span className="muted"> · wk {l.week}</span>
                </span>
                <span className="muted tabular-nums shrink-0">{l.date} · {sets} sets</span>
              </li>
            );
          })}
        </ul>
        {state.logs.length > 12 && (
          <p className="text-xs muted mt-2">Showing the last 12 of {state.logs.length}.</p>
        )}
      </section>

      <Link href="/settings" className="btn btn-ghost w-full text-sm">Back up your data</Link>
    </div>
  );
}
