'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, Upload } from 'lucide-react';
import { clearAll, exportJson, isEphemeral, load, parseImport, save, saveProfile, todayISO } from '@/lib/train/store';
import type { TrainState } from '@/lib/train/types';

export default function SettingsPage() {
  const [state, setState] = useState<TrainState | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  // Parsed but not yet saved. Replacing the log is the most destructive thing in
  // the app — more so than "Delete all data", which asks first — and localStorage
  // is the only copy, so it asks here too.
  const [pending, setPending] = useState<{ state: TrainState; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setState(load());
  }, []);

  if (!state) return <p className="muted py-8">Loading…</p>;

  const p = state.profile;

  const patch = (k: string, v: number) => {
    if (!p) return;
    saveProfile({ ...p, [k]: v });
    setState(load());
  };

  const download = () => {
    const name = `baseline-${todayISO()}.json`;
    const blob = new Blob([exportJson(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking in the same tick can cancel the download before it starts in
    // some browsers. This is the only backup the app has, so it waits.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    // Without this, a download the browser silently blocked is indistinguishable
    // from one that worked.
    setMsg(`Saved ${name}`);
  };

  const upload = async (file: File) => {
    const text = await file.text();
    const next = parseImport(text);
    if (next) {
      setPending({ state: next, name: file.name });
      setMsg(null);
    } else {
      setPending(null);
      setMsg('That file could not be read. Nothing was changed.');
    }
  };

  const confirmImport = () => {
    if (!pending) return;
    save(pending.state);
    setState(load());
    setPending(null);
    setMsg('Imported.');
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </header>

      {p && (
        <section className="card space-y-4">
          <h2 className="card-title">Your numbers</h2>
          <div>
            <label htmlFor="nm" className="label mb-1.5">Name</label>
            <input
              id="nm"
              className="input"
              defaultValue={p.name}
              onBlur={(e) => {
                saveProfile({ ...p, name: e.target.value.trim() || 'you' });
                setState(load());
              }}
            />
          </div>
          <div>
            <label htmlFor="age" className="label mb-1.5">Age</label>
            <input id="age" type="number" inputMode="numeric" className="input input-num" defaultValue={p.age} onBlur={(e) => patch('age', Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="w" className="label mb-1.5">Body mass (kg)</label>
            <input id="w" type="number" inputMode="decimal" className="input input-num" defaultValue={p.weightKg} onBlur={(e) => patch('weightKg', Number(e.target.value))} />
            <p className="text-xs muted mt-1">Used only for the VO2 max estimate.</p>
          </div>
          <div>
            <label htmlFor="hr" className="label mb-1.5">Resting heart rate (bpm)</label>
            <input id="hr" type="number" inputMode="numeric" className="input input-num" defaultValue={p.restingHr} onBlur={(e) => patch('restingHr', Number(e.target.value))} />
            <p className="text-xs muted mt-1">Changing this moves every heart-rate zone.</p>
          </div>
          <div>
            <label htmlFor="walk" className="label mb-1.5">Walk to the gym (minutes each way)</label>
            <input id="walk" type="number" inputMode="numeric" className="input input-num" defaultValue={p.walkMinutesEachWay} onBlur={(e) => patch('walkMinutesEachWay', Number(e.target.value))} />
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="card-title mb-1">Your data</h2>
        <p className="text-sm muted mb-3">
          Everything you log lives on this phone and nowhere else. No account, no server, nothing to
          leak — but also nothing to fall back on if you clear your browser data or change phone.
          Export once a month and you are covered.
        </p>
        <div className="flex gap-3">
          <button onClick={download} className="btn btn-ghost flex-1 text-sm">
            <Download size={15} /> Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn btn-ghost flex-1 text-sm">
            <Upload size={15} /> Import
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = '';
          }}
        />
        {pending && (
          <div className="card mt-3" style={{ borderColor: 'var(--state-warn)' }}>
            <p className="text-sm">
              <strong>{pending.name}</strong> holds {pending.state.logs.length} sessions and{' '}
              {pending.state.tests.length} cardio tests. Importing replaces everything on this device
              — your {state.logs.length} stored sessions — and cannot be undone.
            </p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => setPending(null)} className="btn btn-ghost flex-1 text-sm">Cancel</button>
              <button onClick={confirmImport} className="btn btn-danger flex-1 text-sm">Replace my data</button>
            </div>
          </div>
        )}
        {/* Rendered unconditionally: a live region has to be in the DOM before
            the text arrives, or a screen reader announces nothing. */}
        <p className="text-sm mt-2" style={{ color: 'var(--accent)' }} role="status" aria-live="polite">
          {msg}
        </p>
        <p className="text-xs muted mt-2">
          {state.logs.length} sessions · {state.tests.length} cardio tests stored.
        </p>
        {isEphemeral() && (
          <p className="text-sm mt-2" style={{ color: 'var(--state-warn)' }}>
            This browser is not letting the app save to storage, so anything you log will be lost
            when you close the tab. Export before you leave, or open it in a normal tab.
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="card-title mb-1">Start over</h2>
        <p className="text-sm muted mb-3">
          Deletes every session, test and setting on this device. Export first — this cannot be undone.
        </p>
        {confirmReset ? (
          <div className="flex gap-3">
            <button onClick={() => setConfirmReset(false)} className="btn btn-ghost flex-1 text-sm">Cancel</button>
            <button
              onClick={() => {
                clearAll();
                setState(load());
                setConfirmReset(false);
                setMsg('Everything cleared.');
              }}
              className="btn btn-danger flex-1 text-sm"
            >
              Yes, delete everything
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="btn btn-danger w-full text-sm">
            Delete all data
          </button>
        )}
      </section>

      <p className="text-xs muted">
        General fitness education, not medical advice. If anything hurts sharply, in a joint, or in
        your chest, stop.{' '}
        <Link href="/learn" className="underline">Learn</Link>
      </p>
    </div>
  );
}
