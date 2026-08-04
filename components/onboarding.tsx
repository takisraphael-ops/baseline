'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { getExercise } from '@/lib/train/exercises';
import { QUESTIONS, cautions, startingLoad, strengthBand, strengthFactor, strengthIndex } from '@/lib/train/quiz';
import type { Niggle, QuizAnswers } from '@/lib/train/quiz';
import SexPicker from '@/components/sex-picker';
import { saveProfile, todayISO } from '@/lib/train/store';
import type { Profile, Sex } from '@/lib/train/types';

// PAR-Q, then four numbers, then the strength quiz, then the result.
// The quiz exists so the first session opens with weights that fit her rather
// than a fixed guess — see lib/train/quiz.ts.

const PARQ = [
  'Has a doctor ever said you have a heart condition, or that you should only do physical activity recommended by a doctor?',
  'Do you feel pain in your chest when you do physical activity?',
  'In the past month, have you had chest pain when you were not doing physical activity?',
  'Do you lose your balance because of dizziness, or do you ever lose consciousness?',
  'Do you have a bone or joint problem that could be made worse by a change in your physical activity?',
  'Is your doctor currently prescribing drugs for your blood pressure or a heart condition?',
  'Do you know of any other reason why you should not do physical activity?',
];

/** The lifts worth previewing on the results screen. */
const PREVIEW = ['leg-press', 'hip-thrust-machine', 'lat-pulldown', 'chest-press-machine', 'seated-leg-curl', 'seated-cable-row'];

type Stage = 'welcome' | 'parq' | 'numbers' | 'quiz' | 'result';

// No onDone callback any more. Saving the profile notifies the store, and the
// screen that renders this is subscribed to it — so it swaps itself out for the
// app the moment the write lands. The callback existed only to tell the parent
// to go and re-read what had just been written.
export default function Onboarding() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [parq, setParq] = useState<boolean[]>(Array(PARQ.length).fill(false));
  // Empty, and required below. This was seeded with one client's name, which
  // then greeted every stranger who opened the public URL by it.
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [restingHr, setRestingHr] = useState('');
  const [walk, setWalk] = useState('20');
  // Defaulted rather than left empty, so the step cannot be blocked on it — but
  // it is now on screen and changeable, which is the whole point. It was
  // previously written straight into the profile with nothing to change it.
  const [sex, setSex] = useState<Sex>('female');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({ niggles: [] });

  const anyYes = parq.some(Boolean);
  const bw = Number(weightKg) || 62;

  // "Nothing hurts" is a legitimate and common answer, so the injury question is
  // never a dead end — leaving it blank simply means no cautions.
  const answered = (id: string) => (id === 'niggles' ? true : answers[id as keyof QuizAnswers] !== undefined);

  const pick = (id: string, value: string, multi?: boolean) => {
    setAnswers((prev) => {
      if (!multi) return { ...prev, [id]: value };
      const cur = (prev.niggles ?? []) as Niggle[];
      // "Nothing at all" is exclusive — it cannot be true alongside a sore knee.
      if (value === 'none') return { ...prev, niggles: ['none'] };
      const v = value as Niggle;
      const without: Niggle[] = cur.filter((n) => n !== 'none');
      const next = without.includes(v) ? without.filter((n) => n !== v) : [...without, v];
      return { ...prev, niggles: next };
    });
  };

  const finish = () => {
    const full = answers as QuizAnswers;
    const profile: Profile = {
      // Stored as typed, never substituted. The step above cannot be passed
      // without one, and the greetings handle a blank from an import.
      name: name.trim(),
      age: Number(age) || 25,
      weightKg: bw,
      restingHr: Number(restingHr) || 65,
      sex,
      startDate: todayISO(),
      parqCleared: !anyYes,
      walkMinutesEachWay: Number(walk) || 20,
      quiz: full,
      strengthIndex: strengthIndex(full),
    };
    saveProfile(profile);
  };

  // ------------------------------------------------------------------ welcome
  if (stage === 'welcome') {
    return (
      <div className="space-y-4 pop-in">
        <header className="pt-4">
          <p className="chip chip-accent mb-3">Twelve weeks</p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ textWrap: 'balance' }}>
            Let&rsquo;s work out where you&rsquo;re starting from.
          </h1>
          <p className="muted mt-2 text-sm">
            Eight questions, about two minutes. They set your starting weight on every machine, so your
            first session opens with numbers that suit you rather than a guess.
          </p>
        </header>
        <div className="card">
          <h2 className="card-title mb-2">What you&rsquo;re about to get</h2>
          <ul className="text-sm space-y-2 muted">
            <li>A session that tells you what to do, in order, with the weight already worked out.</li>
            <li>Setup instructions for every machine — which lever, which pad, where it lines up.</li>
            <li>Heart-rate zones and a cardio plan built around the walk you already do.</li>
            <li>The reasoning behind all of it, in plain English, whenever you want it.</li>
          </ul>
        </div>
        <button onClick={() => setStage('parq')} className="btn btn-primary w-full">
          Start <ArrowRight size={16} />
        </button>
        <p className="text-xs faint text-center">
          General fitness education, not medical advice. Everything stays on your phone.
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------- PAR-Q
  if (stage === 'parq') {
    return (
      <div className="space-y-4 pop-in">
        <header>
          <p className="label mb-1">Step 1 of 4</p>
          <h1 className="text-2xl font-semibold tracking-tight">Before you start</h1>
          <p className="muted text-sm mt-1">
            Seven standard screening questions. Tick any that apply to you.
          </p>
        </header>
        <div className="card space-y-1">
          {PARQ.map((q, i) => (
            <label
              key={i}
              className="flex gap-3 items-start text-sm cursor-pointer py-2"
              style={{ borderBottom: i < PARQ.length - 1 ? '1px solid var(--border)' : undefined }}
            >
              <input
                type="checkbox"
                checked={parq[i]}
                onChange={(e) => {
                  const next = [...parq];
                  next[i] = e.target.checked;
                  setParq(next);
                }}
                className="mt-0.5 w-5 h-5 shrink-0"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span>{q}</span>
            </label>
          ))}
        </div>
        {anyYes && (
          <div className="card text-sm" style={{ borderColor: 'var(--warn)' }}>
            <strong>Have a word with a doctor before you start training.</strong> You can still set
            everything up and read through it — just get cleared first.
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => setStage('welcome')} className="btn btn-ghost" aria-label="Back"><ArrowLeft size={16} /></button>
          <button onClick={() => setStage('numbers')} className="btn btn-primary flex-1">
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ numbers
  if (stage === 'numbers') {
    return (
      <div className="space-y-4 pop-in">
        <header>
          <p className="label mb-1">Step 2 of 4</p>
          <h1 className="text-2xl font-semibold tracking-tight">A few numbers</h1>
          <p className="muted text-sm mt-1">
            These set your heart-rate zones and scale your starting weights. Nothing leaves your phone.
          </p>
        </header>
        <div className="card space-y-4">
          <div>
            <label htmlFor="nm" className="label mb-1.5">Your name</label>
            <input
              id="nm"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should the app call you?"
              autoComplete="given-name"
              autoCapitalize="words"
              enterKeyHint="next"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="age" className="label mb-1.5">Age</label>
              <input id="age" type="number" inputMode="numeric" className="input input-num" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" />
            </div>
            <div>
              <label htmlFor="w" className="label mb-1.5">Weight (kg)</label>
              <input id="w" type="number" inputMode="decimal" className="input input-num" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="62" />
            </div>
          </div>
          <p className="text-xs faint -mt-2">
            Weight is used to scale your starting loads and estimate VO2 max. It is never tracked or charted.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="hr" className="label mb-1.5">Resting pulse</label>
              <input id="hr" type="number" inputMode="numeric" className="input input-num" value={restingHr} onChange={(e) => setRestingHr(e.target.value)} placeholder="65" />
            </div>
            <div>
              <label htmlFor="walk" className="label mb-1.5">Walk (min each way)</label>
              <input id="walk" type="number" inputMode="numeric" className="input input-num" value={walk} onChange={(e) => setWalk(e.target.value)} />
            </div>
          </div>
          <p className="text-xs faint -mt-2">
            For the pulse: count it on waking, before getting up, three mornings running. Leave it as
            65 for now if you have not.
          </p>
          <SexPicker value={sex} onChange={setSex} />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStage('parq')} className="btn btn-ghost" aria-label="Back"><ArrowLeft size={16} /></button>
          {/* The name gates the step alongside the numbers. Every greeting in
              the app is written around one, so letting it through empty means
              either a placeholder word standing in for a person or a sentence
              that stops mid-phrase. Asking once, here, costs a second. */}
          <button onClick={() => setStage('quiz')} disabled={!name.trim() || !age || !weightKg} className="btn btn-primary flex-1">
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------- quiz
  if (stage === 'quiz') {
    const q = QUESTIONS[qIndex];
    const value = answers[q.id as keyof QuizAnswers];
    const pct = ((qIndex + 1) / QUESTIONS.length) * 100;

    return (
      <div className="space-y-4">
        <header>
          <div className="flex items-baseline justify-between mb-2">
            <p className="label">Step 3 of 4 · Question {qIndex + 1} of {QUESTIONS.length}</p>
          </div>
          <div className="meter mb-4">
            <span style={{ width: `${pct}%`, background: 'var(--accent)' }} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ textWrap: 'balance' }}>{q.title}</h1>
          {q.help && <p className="muted text-sm mt-2">{q.help}</p>}
        </header>

        <div className="space-y-2 pop-in" key={q.id}>
          {q.options.map((o) => {
            const selected = q.multi
              ? ((value as string[]) ?? []).includes(o.value)
              : value === o.value;
            return (
              <button
                key={o.value}
                onClick={() => {
                  pick(q.id, o.value, q.multi);
                  // Single-choice questions advance on their own — one tap, not two.
                  if (!q.multi && qIndex < QUESTIONS.length - 1) {
                    setTimeout(() => setQIndex((n) => n + 1), 160);
                  }
                }}
                className="card w-full text-left flex items-center gap-3"
                style={{
                  borderColor: selected ? 'var(--accent)' : 'var(--border)',
                  background: selected ? 'var(--accent-soft)' : undefined,
                  padding: '14px 16px',
                }}
                aria-pressed={selected}
              >
                <span
                  className="w-5 h-5 rounded-full grid place-items-center shrink-0"
                  style={{
                    border: `2px solid ${selected ? 'var(--accent)' : 'var(--border-strong)'}`,
                    background: selected ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {selected && <Check size={12} style={{ color: 'var(--on-accent)' }} />}
                </span>
                <span className="min-w-0">
                  <span className="font-medium block leading-tight">{o.label}</span>
                  {o.sub && <span className="text-sm muted">{o.sub}</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => (qIndex === 0 ? setStage('numbers') : setQIndex((n) => n - 1))}
            className="btn btn-ghost"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          {qIndex < QUESTIONS.length - 1 ? (
            <button onClick={() => setQIndex((n) => n + 1)} disabled={!answered(q.id)} className="btn btn-primary flex-1">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={() => setStage('result')} className="btn btn-primary flex-1">
              {q.id === 'niggles' && ((answers.niggles ?? []).length === 0)
                ? 'Nothing hurts — continue'
                : 'See my starting weights'}{' '}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------- result
  const full = answers as QuizAnswers;
  const index = strengthIndex(full);
  const factor = strengthFactor(index);
  const band = strengthBand(index);
  const care = cautions(full.niggles ?? []);

  return (
    <div className="space-y-4 pop-in">
      <header>
        <p className="label mb-1">Step 4 of 4</p>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ textWrap: 'balance' }}>
          {band.label}
        </h1>
        <p className="muted text-sm mt-2">{band.blurb}</p>
      </header>

      <section className="card">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="card-title">Starting strength</h2>
          <span className="stat-value" style={{ color: 'var(--accent)' }}>{index}<span className="text-sm muted font-normal"> / 100</span></span>
        </div>
        <div className="meter">
          <span style={{ width: `${index}%`, background: 'var(--accent)' }} />
        </div>
        <p className="text-sm muted mt-3">
          Not a fitness score, and not something to beat. It is only used to pick your first weights —
          after one session the app works from what you actually lifted instead.
        </p>
      </section>

      <section className="card">
        <h2 className="card-title mb-1">Where you&rsquo;ll start</h2>
        <p className="text-sm muted mb-3">
          Scaled to {bw} kg bodyweight. Treat the first session as a rehearsal — if something feels far
          too easy or too heavy, just change it and the app follows you.
        </p>
        <ul className="space-y-2">
          {PREVIEW.map((id) => {
            const ex = getExercise(id);
            return (
              <li key={id} className="flex items-baseline justify-between gap-3 text-sm">
                <span>{ex.name}</span>
                <span className="font-semibold tabular" style={{ color: 'var(--accent)' }}>
                  {startingLoad(ex, bw, factor)} kg
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {care.length > 0 && (
        <section className="card" style={{ borderColor: 'var(--warn)' }}>
          <h2 className="card-title mb-2">Worth easing into</h2>
          <ul className="space-y-3 text-sm">
            {care.map((c) => (
              <li key={c.area}>
                <p className="font-medium">{c.area}</p>
                <p className="muted">{c.advice}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs faint mt-3">
            If any of it actually hurts rather than just aches, stop and get it looked at.
          </p>
        </section>
      )}

      <button onClick={finish} className="btn btn-primary w-full">
        Start week 1 <ArrowRight size={16} />
      </button>
      <button onClick={() => { setQIndex(0); setStage('quiz'); }} className="btn btn-quiet w-full text-sm">
        Change an answer
      </button>
    </div>
  );
}
