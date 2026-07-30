import Link from 'next/link';
import Glossed from '@/components/glossed';
import Term from '@/components/term';
import { termIdInLabel } from '@/lib/train/glossary';
import { getExercise } from '@/lib/train/exercises';
import { BLOCKS, DELOAD_WEEKS, SESSIONS, TOTAL_WEEKS, intervalsForWeek, scaleTarget } from '@/lib/train/programme';
import { plannedWeeklyVolume } from '@/lib/train/volume';
import { MUSCLE_LABELS } from '@/lib/train/exercises';
import type { Muscle } from '@/lib/train/types';

export const metadata = { title: 'The plan · Baseline' };

const ROLE_LABEL: Record<string, string> = {
  prime: 'Prime',
  main: 'Main lift',
  secondary: 'Secondary',
  accessory: 'Accessory',
  finisher: 'Finisher',
  core: 'Core',
};

export default function PlanPage() {
  const shownMuscles: Muscle[] = ['glutes', 'quads', 'hamstrings', 'lats', 'upper-back', 'chest', 'side-delts'];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">The plan</h1>
        <p className="muted text-sm mt-1">
          Twelve weeks, four sessions a week. Upper and lower alternating, so every muscle gets
          trained twice a week — the best structure available at four days.
        </p>
      </header>

      {/* ---------------------------------------------------------- structure */}
      <section className="card">
        <h2 className="card-title mb-2">How a session runs</h2>
        <ol className="text-sm space-y-2">
          {[
            ['Walk in', 'General warm-up, and free training volume.'],
            ['Specific prep', 'Five minutes. Movement prep and ramp-up sets.'],
            ['Prime', 'One or two light isolation sets. Teaches you which muscle to feel.'],
            ['Compound', 'The main lift, done while you are fresh. This builds the base.'],
            ['Isolate', 'The volume work, once the heavy lifting is banked.'],
            ['Cardio finisher', 'Never before the lifting.'],
            ['Walk home', 'Cool-down.'],
          ].map(([k, v]) => (
            <li key={k} className="flex gap-3">
              <span className="font-medium w-28 shrink-0">{k}</span>
              <span className="muted"><Glossed text={v} /></span>
            </li>
          ))}
        </ol>
        <p className="text-sm muted mt-3">
          Priming before the <Term id="compound" /> rather than{' '}
          <Term id="pre-exhaustion">pre-exhausting</Term> is deliberate — it keeps the benefit of{' '}
          <Term id="isolation">isolation</Term> work without weakening the lift that matters.{' '}
          <Link href="/learn/pre-exhaustion" className="underline">The reasoning</Link>
        </p>
      </section>

      {/* ------------------------------------------------------------- blocks */}
      <section className="space-y-3">
        <h2 className="card-title">Three blocks</h2>
        {BLOCKS.map((b) => (
          <div key={b.id} className="card">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className="font-semibold"><Term id="block">Block</Term> {b.id} — {b.name}</h3>
              <span className="text-sm muted">Weeks {b.weekStart}–{b.weekEnd}</span>
            </div>
            <p className="text-sm muted"><Glossed text={b.focus} /></p>
            <p className="text-sm mt-1"><Glossed text={b.intensity} /></p>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {b.unlocks.map((u) => {
                const id = termIdInLabel(u);
                return id
                  ? <Term key={u} id={id} bare className="chip chip-info">{u}</Term>
                  : <span key={u} className="chip">{u}</span>;
              })}
            </div>
          </div>
        ))}
        <p className="text-sm muted">
          <Term id="deload">Deload</Term> in weeks {DELOAD_WEEKS.join(' and ')} — same weights, about
          40% fewer sets. Any lift that <Term id="stall">stalls</Term> twice in a row gets deloaded on
          its own, whatever week it is.{' '}
          <Link href="/learn/deloads" className="underline">Why</Link>
        </p>
      </section>

      {/* ----------------------------------------------------------- sessions */}
      <section className="space-y-3">
        <h2 className="card-title">The four sessions</h2>
        {SESSIONS.map((s) => (
          <div key={s.id} className="card">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">{s.name}</h3>
              <span className="text-sm muted">Day {s.day} · {s.focus}</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {s.slots.map((slot, i) => {
                const ex = getExercise(slot.exerciseId);
                const t = scaleTarget(slot.target, 6);
                return (
                  <li key={`${slot.exerciseId}-${i}`} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0">
                      <Link href={`/library/${ex.id}`} className="underline decoration-transparent hover:decoration-inherit">
                        {ex.name}
                      </Link>
                      <span className="muted text-xs ml-2">{ROLE_LABEL[slot.role]}</span>
                      {slot.supersetWith !== undefined && (
                        <span className="muted text-xs ml-1">· <Term id="superset">superset</Term></span>
                      )}
                    </span>
                    <span className="muted tabular-nums shrink-0">
                      {t.sets} × {slot.target.repMin}–{slot.target.repMax}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-sm muted mt-3 pt-3 divider">
              <strong className="text-[inherit]" style={{ color: 'var(--text)' }}>Cardio:</strong>{' '}
              <Glossed text={s.cardio.note} />
            </p>
          </div>
        ))}
        <p className="text-xs muted">Set counts shown are for Block 2. Block 1 runs fewer, Block 3 slightly more.</p>
      </section>

      {/* ------------------------------------------------------------- cardio */}
      <section className="card">
        <h2 className="card-title mb-2">How the cardio ramps</h2>
        <ul className="text-sm space-y-2">
          {[1, 5, 7, 9, 11].map((w) => {
            const c = intervalsForWeek(w);
            return (
              <li key={w} className="flex gap-3">
                <span className="font-medium w-20 shrink-0 tabular-nums">Week {w}+</span>
                <span className="muted">
                  {c.intervals
                    ? `${c.intervals.rounds} × ${c.intervals.workSec}s hard / ${c.intervals.restSec}s easy`
                    : <><Term id="zone-2" />, {c.minutes} min</>}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-sm muted mt-3">
          Building to the <Term id="norwegian-4x4">4×4</Term> — the best-established protocol for
          raising <Term id="vo2-max" /> — rather than starting there.{' '}
          <Link href="/learn/vo2-max" className="underline">More</Link>
        </p>
      </section>

      {/* ------------------------------------------------------------ volume */}
      <section className="card">
        <h2 className="card-title mb-1">Weekly <Term id="hard-set">hard sets</Term></h2>
        <p className="text-sm muted mb-3">
          This is the number that matters, not calories burned in the session.{' '}
          <Link href="/learn/progressive-overload" className="underline">Why</Link>
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="muted text-xs uppercase tracking-wide text-left">
              <th className="font-medium pb-1">Muscle</th>
              {BLOCKS.map((b) => <th key={b.id} className="font-medium pb-1 text-right">Block {b.id}</th>)}
            </tr>
          </thead>
          <tbody>
            {shownMuscles.map((m) => (
              <tr key={m}>
                <td className="py-1">{MUSCLE_LABELS[m]}</td>
                {BLOCKS.map((b) => (
                  <td key={b.id} className="py-1 text-right tabular-nums muted">
                    {Math.round(plannedWeeklyVolume(b.weekStart + 1)[m] ?? 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs muted mt-2">Sets where a muscle assists rather than leads count as a half.</p>
      </section>

      <p className="text-sm muted">
        After week {TOTAL_WEEKS}: re-test your <Term id="vo2-max" />, compare your{' '}
        <Term id="main-lift">main lifts</Term> to week 1, then run it again from the new numbers.
      </p>
    </div>
  );
}
