'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Footprints, HeartPulse, Sparkles } from 'lucide-react';
import Glossed from '@/components/glossed';
import Ignition from '@/components/ignition';
import Onboarding from '@/components/onboarding';
import Term from '@/components/term';
import { getExercise } from '@/lib/train/exercises';
import { termIdInLabel } from '@/lib/train/glossary';
import { blockForWeek, getSession, isDeloadWeek, nextSessionId, weekForSessionCount, TOTAL_WEEKS } from '@/lib/train/programme';
import { load } from '@/lib/train/store';
import { weeklyWalkMinutes } from '@/lib/train/volume';
import type { TrainState } from '@/lib/train/types';

/** Varies with where she is in the programme, so it never reads like a form letter. */
function greeting(name: string, sessionsDone: number): string {
  if (sessionsDone === 0) return `Ready when you are, ${name}`;
  if (sessionsDone === 1) return 'Second one — nice';
  if (sessionsDone < 8) return `Next up, ${name}`;
  return 'Next up';
}

export default function Today() {
  const [state, setState] = useState<TrainState | null>(null);

  useEffect(() => {
    setState(load());
  }, []);

  if (!state) return <p className="muted py-8">Loading…</p>;
  if (!state.profile) return <Onboarding onDone={() => setState(load())} />;

  const done = state.logs.length;
  const week = weekForSessionCount(done);
  const block = blockForWeek(week);
  const sessionId = nextSessionId(done);
  const session = getSession(sessionId);
  const deload = isDeloadWeek(week);
  const walkMin = weeklyWalkMinutes(state.profile.walkMinutesEachWay);
  const finished = done >= TOTAL_WEEKS * 4;
  const mainLift = session.slots.find((s) => s.role === 'main');

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="chip chip-accent">Week {week} of {TOTAL_WEEKS}</span>
          <Term id="block" bare className="chip chip-info">Block {block.id} · {block.name}</Term>
          {deload && <Term id="deload" bare className="chip chip-prime chip-info">Deload</Term>}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {finished ? `Twelve weeks done, ${state.profile.name}` : greeting(state.profile.name, done)}
        </h1>
      </header>

      {finished ? (
        <div className="card">
          <p className="text-sm">
            You have finished the programme. Re-test your VO2 max, look back at what the numbers on
            your main lifts were in week 1, and then start again from week 1 with those numbers as
            your new starting point.
          </p>
          <Link href="/progress" className="btn btn-primary w-full mt-3">See the whole twelve weeks</Link>
        </div>
      ) : (
        <Link
          href={`/session/${session.id}`}
          className="card hero block"
          aria-label={`Start ${session.name} — ${session.focus}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              {/* No "Next up" chip here: the page heading above already says it,
                  and the greeting rotates through that exact phrase. */}
              <h2 className="text-2xl font-semibold tracking-tight">{session.name}</h2>
              <p className="muted text-sm">{session.focus}</p>
            </div>
            <Ignition />
          </div>
          <div className="divider my-3" />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="muted text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Dumbbell size={13} aria-hidden /> Main lift
              </dt>
              <dd className="font-medium">{mainLift ? getExercise(mainLift.exerciseId).name : '—'}</dd>
            </div>
            <div>
              <dt className="muted text-xs uppercase tracking-wide flex items-center gap-1.5">
                <HeartPulse size={13} aria-hidden /> Cardio</dt>
              <dd className="font-medium">
                {session.cardio.kind === 'none'
                  ? 'Walk only'
                  : session.cardio.kind === 'zone2'
                    ? `Zone 2, ${session.cardio.minutes} min`
                    : 'Intervals'}
              </dd>
            </div>
          </dl>
          <p className="text-sm muted mt-3">
            Session {(done % 4) + 1} of 4 this week · {session.slots.length} exercises · about 55 minutes
          </p>
        </Link>
      )}

      <section className="card">
        <div className="flex items-start gap-3">
          <Footprints size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">Your walk is training</p>
            <p className="muted mt-0.5">
              At {state.profile.walkMinutesEachWay} minutes each way, four days a week, that is{' '}
              <strong>{walkMin} minutes</strong> of aerobic work
              {walkMin >= 150 ? (
                // Only true when it actually is. A 15-minute walk each way is
                // well inside the range the programme expects and comes to 120.
                <> — already past the 150 minutes a week guideline, before you touch a cardio machine.</>
              ) : (
                <> a week, before you touch a cardio machine. The guideline is 150.</>
              )}
            </p>
            <Link href="/learn/why-the-walk-counts" className="underline muted inline-block mt-1">
              Why it counts
            </Link>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">This <Term id="block">block</Term>: {block.name}</p>
            <p className="muted mt-0.5"><Glossed text={block.focus} /></p>
            <p className="muted mt-1"><Glossed text={block.intensity} />.</p>
            {block.unlocks.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {block.unlocks.map((u) => {
                  const id = termIdInLabel(u);
                  return id
                    ? <Term key={u} id={id} bare className="chip chip-outline chip-info">{u}</Term>
                    : <span key={u} className="chip chip-outline">{u}</span>;
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {state.tests.length === 0 && (
        <Link href="/cardio" className="card block">
          <div className="flex items-start gap-3">
            <HeartPulse size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
            <div className="text-sm">
              <p className="font-semibold">Set your cardio baseline this week</p>
              <p className="muted mt-0.5">
                One walk test gives you a VO2 max estimate and a number to beat in week 6. Right now
                there is nothing to say whether your cardio is improving.
              </p>
            </div>
          </div>
        </Link>
      )}

      <div className="flex gap-3">
        <Link href="/plan" className="btn btn-ghost flex-1 text-sm">The full plan</Link>
        <Link href="/settings" className="btn btn-ghost flex-1 text-sm">Settings</Link>
      </div>

      <p className="text-xs muted text-center pt-2">
        General fitness education, not medical advice. Stop if you get sharp or joint pain,
        dizziness, or chest tightness.
      </p>
    </div>
  );
}
