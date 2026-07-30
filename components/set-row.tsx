'use client';

import { Check, Minus, Plus } from 'lucide-react';
import type { LoggedSet } from '@/lib/train/types';

// One logged set.
//
// The value is always visible and pre-filled with the target, so there is never
// a moment where the field is blank and she has to remember what she was aiming
// for. Steppers do the editing: typing a number into a phone keyboard between
// sets is the thing to design out — but the field stays a real input for anyone
// who would rather type.
//
// Four columns, not five. The row has to survive a 375px phone, where a fifth
// column squeezed the number field down to 21px and clipped the very value this
// control exists to show. Effort is asked once per exercise instead, in words,
// by the control below the set list.

interface Props {
  index: number;
  row: LoggedSet;
  targetReps: number;
  /** Smallest jump this equipment offers, used as the weight step. */
  stepKg: number;
  bodyweight: boolean;
  /** Reps are seconds for planks and holds. */
  repsAreSeconds?: boolean;
  done: boolean;
  onChange: (patch: Partial<LoggedSet>) => void;
  onDone: () => void;
}

export default function SetRow({
  index, row, targetReps, stepKg, bodyweight, repsAreSeconds, done, onChange, onDone,
}: Props) {
  const step = (field: 'kg' | 'reps', delta: number) => {
    const cur = row[field];
    const next = field === 'kg'
      ? Math.max(0, Math.round((cur + delta * stepKg) * 10) / 10)
      : Math.max(0, cur + delta);
    onChange({ [field]: next });
  };

  const Stepper = ({
    field, value, label, disabled,
  }: { field: 'kg' | 'reps'; value: number; label: string; disabled?: boolean }) => (
    <div className="stepper" aria-label={label}>
      <button type="button" className="stepper-btn" onClick={() => step(field, -1)} disabled={disabled} aria-label={`${label} down`}>
        <Minus size={16} />
      </button>
      <input
        type="number"
        inputMode={field === 'kg' ? 'decimal' : 'numeric'}
        step={field === 'kg' ? stepKg : 1}
        className="input input-num"
        value={disabled ? '' : value}
        disabled={disabled}
        onChange={(e) => onChange({ [field]: Math.max(0, Number(e.target.value)) })}
        onFocus={(e) => e.target.select()}
        aria-label={label}
      />
      <button type="button" className="stepper-btn" onClick={() => step(field, 1)} disabled={disabled} aria-label={`${label} up`}>
        <Plus size={16} />
      </button>
    </div>
  );

  return (
    <div className="set-grid items-center">
      <span className="text-xs muted tabular text-center">{index + 1}</span>
      <Stepper field="kg" value={row.kg} label={`Set ${index + 1} weight in kilograms`} disabled={bodyweight} />
      <Stepper field="reps" value={row.reps} label={`Set ${index + 1} ${repsAreSeconds ? 'seconds' : 'reps'}`} />
      <button
        type="button"
        onClick={onDone}
        className={`set-done ${done ? 'checked' : ''}`}
        aria-label={done ? `Set ${index + 1} logged. Tap to undo.` : `Log set ${index + 1} at ${row.kg || 'bodyweight'} for ${row.reps || targetReps}`}
        aria-pressed={done}
      >
        <Check size={18} />
      </button>
    </div>
  );
}

/**
 * Asked once per exercise, in words, after at least one set is logged.
 *
 * "RIR" is the correct term and it is taught in Learn, but a control labelled
 * RIR with a bare number in a dropdown is meaningless to someone in their first
 * month. The engine only needs to know whether there was room left, and it only
 * needs it from the hardest set.
 */
export function EffortPicker({
  value, onPick,
}: { value: number | null; onPick: (rir: number) => void }) {
  const options = [
    { rir: 3, label: 'Comfortable', sub: 'Could have done 3 or more' },
    { rir: 2, label: 'Hard', sub: 'About 2 left in the tank' },
    { rir: 0, label: 'All out', sub: 'Could not have done another' },
  ];
  return (
    <div className="mt-3">
      <p className="label mb-2">How did the last set feel?</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          const on = value === o.rir;
          return (
            <button
              key={o.rir}
              type="button"
              onClick={() => onPick(o.rir)}
              className="rounded-[10px] px-2 py-2.5 text-left"
              style={{
                background: on ? 'var(--accent-soft)' : 'var(--bg-sunken)',
                border: `1.5px solid ${on ? 'var(--accent)' : 'transparent'}`,
                minHeight: 56,
              }}
              aria-pressed={on}
            >
              <span
                className="block text-[13px] font-semibold leading-tight"
                style={{ color: on ? 'var(--accent)' : 'var(--text)' }}
              >
                {o.label}
              </span>
              <span className="block text-[11px] muted leading-tight mt-0.5">{o.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
