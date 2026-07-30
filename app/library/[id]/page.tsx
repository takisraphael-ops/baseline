import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, PlayCircle, Search } from 'lucide-react';
import Glossed from '@/components/glossed';
import MuscleMap from '@/components/muscle-map';
import Term from '@/components/term';
import { EQUIPMENT_LABELS, EXERCISES, MUSCLE_LABELS, demoUrl, findExercise, hasCuratedVideo, ytSearch } from '@/lib/train/exercises';

/** Dumbbells and barbells are both free weights as far as the glossary cares. */
const EQUIPMENT_TERM: Record<string, string | undefined> = {
  machine: 'machine',
  cable: 'cable',
  dumbbell: 'free-weight',
  barbell: 'free-weight',
};

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ id: e.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const ex = findExercise(params.id);
  return { title: ex ? `${ex.name} · Baseline` : 'Baseline' };
}

export default function ExercisePage({ params }: { params: { id: string } }) {
  const ex = findExercise(params.id);
  if (!ex) notFound();

  const rung = ex.ladder.indexOf(ex.id);
  const next = rung >= 0 && rung < ex.ladder.length - 1 ? findExercise(ex.ladder[rung + 1]) : null;

  return (
    <div className="space-y-4">
      <header>
        <div className="flex gap-1.5 flex-wrap mb-1">
          {EQUIPMENT_TERM[ex.equipment] ? (
            <Term id={EQUIPMENT_TERM[ex.equipment]!} bare className="chip chip-info">
              {EQUIPMENT_LABELS[ex.equipment]}
            </Term>
          ) : (
            <span className="chip">{EQUIPMENT_LABELS[ex.equipment]}</span>
          )}
          {ex.primary.map((m) => <span key={m} className="chip chip-outline">{MUSCLE_LABELS[m]}</span>)}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{ex.name}</h1>
      </header>

      <div className="card">
        <MuscleMap primary={ex.primary} secondary={ex.secondary} labels className="w-full max-w-[280px] mx-auto" />
        <div className="flex items-center justify-center gap-4 text-xs muted mt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'var(--accent)' }} /> Worked directly
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'var(--accent-soft)' }} /> Assisting
          </span>
        </div>
      </div>

      {/* The curated link is the fast path; the search always works, so a dead
          video costs one extra tap instead of stranding her at the machine. */}
      <div className="flex gap-2">
        <a
          href={demoUrl(ex)}
          target="_blank"
          rel="noopener noreferrer"
          className="watch-cta flex-1"
          aria-label={`Watch a demonstration of ${ex.name} on YouTube`}
        >
          <PlayCircle size={19} aria-hidden /> Watch demo
        </a>
        {hasCuratedVideo(ex) && (
          <a
            href={ytSearch(ex.videoSearch)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            aria-label="Search YouTube for other demonstrations"
          >
            <Search size={16} />
          </a>
        )}
      </div>

      <section className="card">
        <h2 className="card-title mb-2">Setting it up</h2>
        <ol className="steps">{ex.setup.map((s, i) => <li key={i}><Glossed text={s} /></li>)}</ol>
      </section>

      <section className="card">
        <h2 className="card-title mb-2">What a good <Term id="rep">rep</Term> feels like</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm">
          {ex.cues.map((s, i) => <li key={i}><Glossed text={s} /></li>)}
        </ul>
      </section>

      <section className="card">
        <h2 className="card-title mb-2">What usually goes wrong</h2>
        <ul className="warns">
          {ex.mistakes.map((m, i) => (
            <li key={i}>
              <p className="font-medium"><Glossed text={m.wrong} /></p>
              <p className="muted"><Glossed text={m.fix} /></p>
            </li>
          ))}
        </ul>
      </section>

      {ex.ladder.length > 1 && (
        <section className="card">
          <h2 className="card-title mb-1">Where this sits on the <Term id="ladder">ladder</Term></h2>
          <p className="text-sm muted mb-3">
            Move up a rung when you can hit the top of the rep range on every set with clean
            technique — not on a date.{' '}
            <Link href="/learn/machines-vs-free-weights" className="underline">Why this order</Link>
          </p>
          <ol className="space-y-1.5 text-sm">
            {ex.ladder.map((id, i) => {
              const step = findExercise(id);
              if (!step) return null;
              const current = id === ex.id;
              return (
                <li key={id} className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full grid place-items-center text-xs shrink-0"
                    style={{
                      background: current ? 'var(--accent)' : 'var(--border)',
                      color: current ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {i + 1}
                  </span>
                  {current ? (
                    <span className="font-medium">{step.name}</span>
                  ) : (
                    <Link href={`/library/${id}`} className="underline muted">{step.name}</Link>
                  )}
                </li>
              );
            })}
          </ol>
          {next && (
            <Link href={`/library/${next.id}`} className="btn btn-ghost w-full mt-3 text-sm">
              Next rung: {next.name} <ArrowRight size={15} />
            </Link>
          )}
        </section>
      )}

      <section className="card text-sm">
        <p className="muted">
          Smallest weight jump available here: <strong style={{ color: 'var(--text)' }}>{ex.incrementKg} kg</strong>.
          {ex.incrementKg >= 5 && ' On a light exercise that is a big step — the app will add reps or sets instead until the jump is small enough to take.'}
        </p>
      </section>

      <Link href="/library" className="btn btn-ghost w-full text-sm">All exercises</Link>
    </div>
  );
}
