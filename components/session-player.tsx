'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Check, ChevronDown, ChevronUp, Info, Link2, PlayCircle, RotateCcw, Search, Trophy, Undo2 } from 'lucide-react';
import Glossed from '@/components/glossed';
import Term from '@/components/term';
import { demoUrl, getExercise, hasCuratedVideo, ytSearch } from '@/lib/train/exercises';
import { SESSION_ORDER, TOTAL_WEEKS, blockForWeek, intervalsForWeek, isDeloadWeek, scaleTarget } from '@/lib/train/programme';
import { formatTarget, nextTarget, topKg } from '@/lib/train/progression';
import { defaultSetupOpen, startingLoad, strengthFactor } from '@/lib/train/quiz';
import { appendLog, historyFor, todayISO } from '@/lib/train/store';
import { useTrainState } from '@/lib/train/use-store';
import type { LoggedSet, SessionSpec } from '@/lib/train/types';
import MuscleMap from '@/components/muscle-map';
import RestTimer from '@/components/rest-timer';
import SetRow, { EffortPicker } from '@/components/set-row';
import { CoolDown, WarmUp } from '@/components/warm-up';
import SwapPanel from '@/components/swap-panel';

const ROLE_LABEL: Record<string, string> = {
  prime: 'Prime',
  main: 'Main lift',
  secondary: 'Secondary',
  accessory: 'Accessory',
  finisher: 'Finisher',
  core: 'Core',
};

/** Roles that have a glossary entry, so the chip itself explains itself. */
const ROLE_TERM: Record<string, string | undefined> = {
  prime: 'primer',
  main: 'main-lift',
  accessory: 'accessory',
  finisher: 'finisher',
};

/** Movements where the rep field is really a hold in seconds. */
const SECONDS = new Set(['plank']);

export default function SessionPlayer({ session, week }: { session: SessionSpec; week: number }) {
  const router = useRouter();
  const state = useTrainState();
  // Only what she has actually touched. Everything untouched falls through to
  // the prescription below rather than being copied into state up front — see
  // `defaults`.
  const [logged, setLogged] = useState<Record<string, LoggedSet[]>>({});
  const [doneFlags, setDoneFlags] = useState<Record<string, boolean[]>>({});
  // `undefined` means she has not opened or closed anything yet, which is
  // different from having closed everything. Only then does the quiz answer get
  // to decide. Without the third state, a deliberate close would spring back
  // open on the next render.
  const [open, setOpen] = useState<string | null | undefined>(undefined);
  const [rest, setRest] = useState<number | null>(null);
  const [cardioDone, setCardioDone] = useState(false);
  /** Substitutions for today only, keyed by the slot's original exercise id. */
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const [swapOpen, setSwapOpen] = useState<string | null>(null);
  const [felt, setFelt] = useState('');
  const [finishing, setFinishing] = useState(false);

  const block = blockForWeek(week);
  const deload = isDeloadWeek(week);
  // Which of the week's four this is — "week 3" alone does not tell her how far
  // through she is.
  const sessionInWeek = SESSION_ORDER.indexOf(session.id) + 1;
  const cardio = session.cardio.kind === 'intervals' ? intervalsForWeek(week) : session.cardio;

  const plan = useMemo(() => {
    if (!state) return [];
    const p = state.profile;
    const factor = p ? strengthFactor(p.strengthIndex) : 1;
    return session.slots.map((slot) => {
      const ex = getExercise(swaps[slot.exerciseId] ?? slot.exerciseId);
      const target = scaleTarget(slot.target, week, slot.role);
      // Keyed on the exercise actually being performed, not the slot's original.
      // After a swap those differ, and reading the original's history would
      // prescribe a leg-press weight on a goblet squat. With no swap the two ids
      // are identical; on a first-ever swap this is empty and the decision falls
      // through to the substitute's own starting load.
      const history = historyFor(state, ex.id);
      const start = p ? startingLoad(ex, p.weightKg, factor) : ex.startKg;
      // Heaviest she has ever logged on this movement, so a new one can be
      // called out the moment it happens rather than found later in a chart.
      const best = history.reduce((m, h) => Math.max(m, topKg(h)), 0);
      return { slot, ex, target, history, best, decision: nextTarget(ex, target, history, start) };
    });
  }, [state, session, week, swaps]);

  // Every row shows the prescribed target until she changes it, so a value is
  // always on screen.
  //
  // Derived, not copied into state. This used to be an effect that pushed the
  // prescription into `logged` after render, which meant one frame where a row
  // existed with no numbers, and a second write for anything swapped in
  // mid-session — the substitute's rows appeared a render late. Reading through
  // to the default instead means the values are correct on the first render
  // they exist, and there is nothing to keep in step.
  const defaults = useMemo(() => {
    const rows: Record<string, LoggedSet[]> = {};
    const flags: Record<string, boolean[]> = {};
    for (const { ex, decision } of plan) {
      rows[ex.id] = decision.reps.map((reps) => ({ kg: decision.kg, reps, rir: null }));
      flags[ex.id] = decision.reps.map(() => false);
    }
    return { rows, flags };
  }, [plan]);

  /** Her rows for an exercise, or the prescription if she has not touched it. */
  const rowsFor = (id: string): LoggedSet[] => logged[id] ?? defaults.rows[id] ?? [];
  const flagsFor = (id: string): boolean[] => doneFlags[id] ?? defaults.flags[id] ?? [];

  // Someone who said the machines are a mystery gets the first setup open.
  // Computed rather than assigned in an effect, so it is right on the first
  // render instead of flipping open on the second.
  const conf = state?.profile?.quiz?.confidence;
  const openId =
    open !== undefined ? open : conf && defaultSetupOpen(conf) ? plan[0]?.ex.id ?? null : null;

  if (!state) return <p className="muted py-8">Loading…</p>;

  // Every writer seeds from the DERIVED rows, not from `prev` alone. Until she
  // touches an exercise there is no entry in state at all, so `prev[id]` is
  // undefined and editing set 3 of an untouched exercise would otherwise write
  // a sparse array and blank the other two.
  const update = (id: string, i: number, patch: Partial<LoggedSet>) => {
    setLogged((prev) => {
      const rows = [...(prev[id] ?? defaults.rows[id] ?? [])];
      rows[i] = { ...rows[i], ...patch };
      return { ...prev, [id]: rows };
    });
  };

  const toggleDone = (id: string, i: number, restSec: number) => {
    setDoneFlags((prev) => {
      const rows = [...(prev[id] ?? defaults.flags[id] ?? [])];
      const next = !rows[i];
      rows[i] = next;
      if (next) setRest(restSec);
      return { ...prev, [id]: rows };
    });
  };

  const fillFromLast = (id: string, last: LoggedSet[]) => {
    setLogged((prev) => {
      const rows = [...(prev[id] ?? defaults.rows[id] ?? [])];
      return { ...prev, [id]: rows.map((r, i) => (last[i] ? { ...last[i] } : r)) };
    });
  };

  const swapTo = (originalId: string, newId: string) => {
    setSwaps((prev) => ({ ...prev, [originalId]: newId }));
    setSwapOpen(null);
  };
  const undoSwap = (originalId: string) => {
    setSwaps((prev) => {
      const next = { ...prev };
      delete next[originalId];
      return next;
    });
  };

  const mainPlan = plan.find((p) => p.slot.role === 'main');
  // Counted over `plan`, not over every key in `doneFlags`. A swap leaves the
  // original exercise's rows behind — `undoSwap` deliberately keeps them so an
  // undo restores the ticks — and counting those too means the meter is scored
  // against sets that are no longer in the session and that `finish()` never
  // writes, so it could never reach 100%.
  const totalSets = plan.reduce((n, { ex }) => n + flagsFor(ex.id).length, 0);
  const doneSets = plan.reduce((n, { ex }) => n + flagsFor(ex.id).filter(Boolean).length, 0);
  const pct = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  const finish = () => {
    setFinishing(true);
    const exercises = plan
      .map(({ ex, decision }) => ({
        exerciseId: ex.id,
        sets: rowsFor(ex.id)
          .filter((_, i) => flagsFor(ex.id)[i])
          // Record the slow lowering when it was prescribed, so next session can
          // see it was already tried. Without this the tempo lever would be the
          // last word forever and micro-loading could never be reached.
          .map((s) => (decision.eccentricSec ? { ...s, eccentricSec: decision.eccentricSec } : s)),
      }))
      .filter((e) => e.sets.length > 0);
    appendLog({
      date: todayISO(),
      sessionId: session.id,
      week,
      exercises,
      cardioMinutes: cardioDone ? cardio.minutes : 0,
      cardioKind: cardioDone ? cardio.kind : 'none',
      howItFelt: felt.trim() || undefined,
      completedAt: new Date().toISOString(),
    });
    // A session that ends by silently changing screens gives back nothing for
    // an hour's work. Two seconds of "here is what you just did" is the only
    // moment in the app that exists purely to be earned.
    window.setTimeout(() => router.push('/progress'), 2100);
  };

  // Counted from what is actually in the log, not from the targets on screen.
  const bests = plan.filter(({ ex, best }) => {
    if (best <= 0) return false;
    const rows = rowsFor(ex.id);
    const flags = flagsFor(ex.id);
    return rows.some((r, i) => flags[i] && r.kg > best);
  });

  if (finishing) {
    return (
      <div className="done-screen" role="status" aria-live="polite">
        <div className="done-inner">
          <div className="done-ring"><Check size={44} strokeWidth={3} aria-hidden /></div>
          <p className="done-title">{session.name} logged</p>
          <p className="done-sub">
            {doneSets} {doneSets === 1 ? 'set' : 'sets'}
            {cardioDone && cardio.minutes > 0 ? ` · ${cardio.minutes} min cardio` : ''}
            {' · week '}{week} of {TOTAL_WEEKS}
          </p>
          {bests.length > 0 && (
            <p className="done-best">
              <Trophy size={15} aria-hidden />
              {bests.length === 1
                ? `New best on the ${bests[0].ex.name.toLowerCase()}`
                : `${bests.length} new personal bests`}
            </p>
          )}
          <div className="done-bar"><span /></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${rest !== null ? 'pb-24' : ''}`}>
      <header>
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="chip chip-accent">Week {week}</span>
          <span className="chip">Block {block.id} · {block.name}</span>
          {deload && <span className="chip chip-prime">Deload</span>}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{session.name}</h1>
        <p className="text-sm faint">Session {sessionInWeek} of 4 this week</p>
        <p className="muted text-sm">
          {session.focus} ·{' '}
          <Link href="/plan" className="underline">what the labels mean</Link>
        </p>
        <div className="meter mt-3">
          <span style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--success)' : 'var(--accent)' }} />
        </div>
        <p className="text-xs faint mt-1.5 tabular">{doneSets} of {totalSets} sets done</p>
      </header>

      {deload && (
        <div className="card text-sm" style={{ borderColor: 'var(--accent)' }}>
          <strong><Term id="deload">Deload week</Term>.</strong> Same weights, about 40% fewer sets.
          It will feel like slacking. It is not — this is the week the progress catches up.{' '}
          <Link href="/learn/deloads" className="underline">Why</Link>
        </div>
      )}

      <WarmUp
        sessionId={session.id}
        mainLiftName={mainPlan ? mainPlan.ex.name : 'first lift'}
        workingKg={mainPlan ? mainPlan.decision.kg : 0}
        incrementKg={mainPlan ? mainPlan.ex.incrementKg : 2.5}
      />

      {plan.map(({ slot, ex, target, history, best, decision }, idx) => {
        const isOpen = openId === ex.id;
        const rows = rowsFor(ex.id);
        const flags = flagsFor(ex.id);
        const partner = slot.supersetWith !== undefined ? plan[slot.supersetWith] : null;
        const last = history[0];
        const bodyweight = decision.kg === 0 && ex.bwRatio === 0;
        const secs = SECONDS.has(ex.id);
        const allDone = flags.length > 0 && flags.every(Boolean);
        // Only once it is actually in the log — a target on screen is not a lift.
        const loggedTop = rows.reduce((m, r, i) => (flags[i] ? Math.max(m, r.kg) : m), 0);
        const newBest = best > 0 && loggedTop > best;
        const lastDone = flags.lastIndexOf(true);
        const swapped = swaps[slot.exerciseId] !== undefined;
        const original = swapped ? getExercise(slot.exerciseId) : null;

        return (
          <section
            key={`${ex.id}-${idx}`}
            className="card"
            style={allDone ? { borderColor: 'color-mix(in srgb, var(--success) 40%, var(--border))' } : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  {ROLE_TERM[slot.role] ? (
                    <Term
                      id={ROLE_TERM[slot.role]!}
                      bare
                      className={`chip chip-info ${slot.role === 'prime' ? 'chip-prime' : 'chip-accent'}`}
                    >
                      {ROLE_LABEL[slot.role]}
                    </Term>
                  ) : (
                    <span className={`chip ${slot.role === 'prime' ? 'chip-prime' : 'chip-accent'}`}>
                      {ROLE_LABEL[slot.role]}
                    </span>
                  )}
                  {partner && (
                    <Term id="superset" bare className="chip chip-outline chip-info">
                      <Link2 size={11} aria-hidden /> Superset with {partner.ex.name}
                    </Term>
                  )}
                  {allDone && <span className="chip chip-ok"><Check size={11} aria-hidden /> Done</span>}
                  {newBest && (
                    <span className="chip chip-best"><Trophy size={11} aria-hidden /> Best yet · {loggedTop} kg</span>
                  )}
                  {swapped && (
                    <span className="chip" style={{ background: 'var(--prime-soft)', color: 'var(--prime)' }}>
                      <ArrowLeftRight size={11} aria-hidden /> Swapped in
                    </span>
                  )}
                </div>
                <h2 className="font-semibold leading-tight text-[17px]">{ex.name}</h2>
                <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--accent)' }}>
                  {formatTarget(decision)} · <Term id="rir">stop with about {target.rir} left</Term>
                </p>
              </div>
              <MuscleMap primary={ex.primary} secondary={ex.secondary} className="w-[72px] shrink-0" />
            </div>

            <p className="text-sm muted mt-2.5 flex gap-2">
              <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
              <span><Glossed text={decision.reason} /></span>
            </p>

            {slot.note && <p className="text-sm faint mt-2 italic"><Glossed text={slot.note} /></p>}

            {/* Last time's numbers stay on screen while this time's are entered. */}
            {last && last.sets.length > 0 && (
              <div className="mt-3 p-2.5 rounded-[10px] flex items-center justify-between gap-2 flex-wrap"
                   style={{ background: 'var(--bg-sunken)' }}>
                <div className="min-w-0">
                  <p className="label mb-1.5" style={{ fontSize: 10.5 }}>Last time</p>
                  <div className="flex gap-1 flex-wrap">
                    {last.sets.map((s, i) => (
                      <span key={i} className="prev-chip">
                        {s.kg > 0 ? `${s.kg}kg` : 'BW'} × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => fillFromLast(ex.id, last.sets)}
                  className="btn btn-ghost btn-sm shrink-0"
                >
                  <RotateCcw size={13} /> Repeat
                </button>
              </div>
            )}

            <div className="mt-3 space-y-2">
              <div className="set-grid text-[11px] muted uppercase tracking-wider">
                <span />
                <span className="text-center">{bodyweight ? 'Body' : 'Kg'}</span>
                <span className="text-center">{secs ? 'Secs' : 'Reps'}</span>
                <span />
              </div>
              {rows.map((row, i) => (
                <SetRow
                  key={i}
                  index={i}
                  row={row}
                  targetReps={decision.reps[i] ?? target.repMin}
                  stepKg={ex.incrementKg || 2.5}
                  bodyweight={bodyweight}
                  repsAreSeconds={secs}
                  done={flags[i] ?? false}
                  onChange={(patch) => update(ex.id, i, patch)}
                  onDone={() => toggleDone(ex.id, i, target.restSec)}
                />
              ))}
            </div>

            {/* Applies to the most recently ticked set, not the last row: only
                ticked sets are saved, so writing to an unticked row silently
                threw the answer away. */}
            {lastDone >= 0 && (
              <EffortPicker
                value={rows[lastDone]?.rir ?? null}
                onPick={(rir) => update(ex.id, lastDone, { rir })}
              />
            )}

            {decision.eccentricSec && (
              <p className="text-sm mt-2.5" style={{ color: 'var(--state-warn)' }}>
                Lower for a slow {decision.eccentricSec} seconds on every rep.
              </p>
            )}

            {/* "Show me what this looks like" is the question she actually has
                standing at a machine, so it is a full-size button on the card
                rather than something two taps down inside the setup panel. */}
            <div className="flex gap-2 mt-3">
              <a
                href={demoUrl(ex)}
                target="_blank"
                rel="noopener noreferrer"
                className="watch-cta flex-1"
                aria-label={`Watch a demonstration of ${ex.name} on YouTube`}
              >
                <PlayCircle size={19} aria-hidden />
                Watch demo
              </a>
              {swapped ? (
                <button
                  onClick={() => undoSwap(slot.exerciseId)}
                  className="btn btn-ghost shrink-0"
                  aria-label={`Go back to ${original?.name}`}
                >
                  <Undo2 size={15} /> Undo
                </button>
              ) : (
                <button
                  onClick={() => setSwapOpen(swapOpen === slot.exerciseId ? null : slot.exerciseId)}
                  className="btn btn-ghost shrink-0"
                  aria-expanded={swapOpen === slot.exerciseId}
                  aria-label={`${ex.name} is busy — show alternatives`}
                >
                  <ArrowLeftRight size={15} /> Busy?
                </button>
              )}
            </div>

            <button
              onClick={() => setOpen(isOpen ? null : ex.id)}
              className="btn btn-ghost btn-sm w-full mt-2"
              aria-expanded={isOpen}
            >
              {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {isOpen ? 'Hide setup' : 'How to set it up'}
            </button>

            {swapped && original && (
              <p className="text-xs faint mt-2">Instead of {original.name}, just for today.</p>
            )}

            {swapOpen === slot.exerciseId && (
              <SwapPanel
                exerciseId={slot.exerciseId}
                sessionExerciseIds={plan.map((x) => x.ex.id)}
                onPick={(id) => swapTo(slot.exerciseId, id)}
                onClose={() => setSwapOpen(null)}
              />
            )}

            {isOpen && (
              <div className="mt-3 text-sm space-y-3 pop-in">
                <div>
                  <p className="label mb-1">Setup</p>
                  <ol className="steps">{ex.setup.map((s, i) => <li key={i}>{s}</li>)}</ol>
                </div>
                <div>
                  <p className="label mb-1">What it should feel like</p>
                  <ul className="list-disc pl-5 space-y-1 muted">
                    {ex.cues.map((s, i) => <li key={i}><Glossed text={s} /></li>)}
                  </ul>
                </div>
                {/* Only when Watch already goes to a specific video — otherwise
                    it is the same search twice. The point of it is that if the
                    picked video has died she is one tap from another. */}
                <div className="flex gap-2">
                  <Link href={`/library/${ex.id}`} className="btn btn-ghost btn-sm flex-1">Full guide</Link>
                  {hasCuratedVideo(ex) && (
                    <a
                      href={ytSearch(ex.videoSearch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm flex-1"
                    >
                      <Search size={14} /> Other demos
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}

      <section className="card">
        <h2 className="card-title mb-1">
          {cardio.kind === 'none' ? (
            'No machine cardio today'
          ) : cardio.kind === 'zone2' ? (
            <><Term id="zone-2" /> — {cardio.minutes} min</>
          ) : (
            <><Term id="intervals" /> — {cardio.minutes} min</>
          )}
        </h2>
        <p className="text-sm muted"><Glossed text={cardio.note} /></p>
        {cardio.intervals && (
          <p className="text-sm mt-2">
            <strong>{cardio.intervals.rounds} rounds</strong> · {cardio.intervals.workSec}s hard,{' '}
            {cardio.intervals.restSec}s easy · zone {cardio.intervals.zone}
          </p>
        )}
        {cardio.kind !== 'none' && (
          <button
            onClick={() => setCardioDone((d) => !d)}
            className={`btn w-full mt-3 ${cardioDone ? 'btn-primary' : 'btn-ghost'}`}
          >
            {cardioDone ? <><Check size={16} /> Cardio done</> : 'Mark cardio done'}
          </button>
        )}
        <p className="text-sm muted mt-3">
          Then walk home — that is your cool-down.{' '}
          <Link href="/learn/why-the-walk-counts" className="underline">Why it counts</Link>
        </p>
      </section>

      <CoolDown sessionId={session.id} />

      <section className="card">
        <label htmlFor="felt" className="card-title block mb-1">How did that feel?</label>
        <p className="text-sm muted mb-2">
          Optional, never scored. It is here so you can spot your own patterns later.
        </p>
        <textarea
          id="felt"
          className="input"
          rows={3}
          value={felt}
          onChange={(e) => setFelt(e.target.value)}
          placeholder="Strong. Leg press felt easy at the top end."
        />
      </section>

      <button onClick={finish} disabled={doneSets === 0} className="btn btn-primary w-full">
        Finish session · {doneSets} {doneSets === 1 ? 'set' : 'sets'}
      </button>

      {rest !== null && <RestTimer key={rest} seconds={rest} onClose={() => setRest(null)} />}
    </div>
  );
}
