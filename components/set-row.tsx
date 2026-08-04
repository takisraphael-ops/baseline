'use client';

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import WheelPicker from '@/components/wheel-picker';
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
//
// Long-pressing or tapping the value opens a scroll wheel instead of the
// keyboard. Steppers are the right tool for +1; they are the wrong tool for
// 40 kg to 60 kg, which is four taps at a 5 kg step. The wheel is a flick, and
// it lives in a sheet rather than in the row so this layout is untouched.

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

// Module scope, deliberately. Defined inside SetRow it was a new component type
// on every render, so React unmounted and remounted the whole stepper each time
// the row updated — which is every tap of + or −. The input lost its DOM
// identity mid-interaction and every transition restarted. Nothing looked
// broken, which is why it survived; the upgraded react-hooks plugin is what
// found it.
function Stepper({
  value, label, disabled, onStep, onOpenWheel,
}: {
  value: number;
  label: string;
  disabled?: boolean;
  onStep: (delta: number) => void;
  onOpenWheel: () => void;
}) {
  return (
    <div className="stepper" aria-label={label}>
      <button type="button" className="stepper-btn" onClick={() => onStep(-1)} disabled={disabled} aria-label={`${label} down`}>
        <Minus size={16} />
      </button>
      {/* readOnly rather than a plain button: it keeps the same look, the same
          grid column and the same accessible name, but a tap opens the wheel
          instead of the phone keyboard. */}
      <input
        type="text"
        readOnly
        className="input input-num"
        value={disabled ? '' : value}
        disabled={disabled}
        onClick={() => !disabled && onOpenWheel()}
        aria-label={`${label}. Tap to pick from a wheel.`}
      />
      <button type="button" className="stepper-btn" onClick={() => onStep(1)} disabled={disabled} aria-label={`${label} up`}>
        <Plus size={16} />
      </button>
    </div>
  );
}

export default function SetRow({
  index, row, targetReps, stepKg, bodyweight, repsAreSeconds, done, onChange, onDone,
}: Props) {
  const [wheel, setWheel] = useState<'kg' | 'reps' | null>(null);
  const step = (field: 'kg' | 'reps', delta: number) => {
    const cur = row[field];
    const next = field === 'kg'
      ? Math.max(0, Math.round((cur + delta * stepKg) * 10) / 10)
      : Math.max(0, cur + delta);
    onChange({ [field]: next });
  };

  return (
    <div className="set-grid items-center">
      <span className="text-xs muted tabular text-center">{index + 1}</span>
      <Stepper
        value={row.kg}
        label={`Set ${index + 1} weight in kilograms`}
        disabled={bodyweight}
        onStep={(d) => step('kg', d)}
        onOpenWheel={() => setWheel('kg')}
      />
      <Stepper
        value={row.reps}
        label={`Set ${index + 1} ${repsAreSeconds ? 'seconds' : 'reps'}`}
        onStep={(d) => step('reps', d)}
        onOpenWheel={() => setWheel('reps')}
      />
      <button
        type="button"
        onClick={onDone}
        className={`set-done ${done ? 'checked' : ''}`}
        aria-label={done ? `Set ${index + 1} logged. Tap to undo.` : `Log set ${index + 1} at ${row.kg || 'bodyweight'} for ${row.reps || targetReps}`}
        aria-pressed={done}
      >
        <Check size={18} />
      </button>

      {wheel && (
        <WheelPicker
          open
          title={wheel === 'kg'
            ? `Set ${index + 1} — weight`
            : `Set ${index + 1} — ${repsAreSeconds ? 'seconds' : 'reps'}`}
          unit={wheel === 'kg' ? 'kg' : repsAreSeconds ? 'sec' : 'reps'}
          value={wheel === 'kg' ? row.kg : row.reps}
          step={wheel === 'kg' ? stepKg : 1}
          min={0}
          // Wide enough to cover anything she will ever log, and no wider —
          // every extra row is scroll distance on the flick this exists for.
          max={wheel === 'kg' ? Math.max(60, Math.ceil((row.kg + 60) / stepKg) * stepKg) : 60}
          onPick={(v) => onChange({ [wheel]: v })}
          onClose={() => setWheel(null)}
        />
      )}
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
    { rir: 3, label: 'Comfortable', sub: '3+ spare', then: 'Next time jumps two reps, or two plates at the top of the range.' },
    { rir: 2, label: 'Hard', sub: '~2 spare', then: 'Next time goes up one rep. This is the target most sessions.' },
    { rir: 0, label: 'All out', sub: 'Nothing left', then: 'Next time repeats this exactly. Nothing goes up until there is room again.' },
  ];
  const picked = options.find((o) => o.rir === value);
  return (
    <div className={`effort ${value === null ? 'effort-asking' : ''}`}>
      <p className="label" style={{ marginBottom: 2 }}>How did that last set feel?</p>
      {/* Said plainly, because it is true and because it changes the answer:
          someone who knows the app is listening rates honestly. */}
      <p className="text-[12px] muted mb-2.5">This is what sets next session&rsquo;s numbers.</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          const on = value === o.rir;
          return (
            <button
              key={o.rir}
              type="button"
              onClick={() => onPick(o.rir)}
              className={`effort-opt ${on ? 'on' : ''}`}
              aria-pressed={on}
            >
              <span className="block text-[13px] font-semibold leading-tight">{o.label}</span>
              <span className="block text-[11px] leading-tight mt-0.5 opacity-70">{o.sub}</span>
            </button>
          );
        })}
      </div>
      {picked && (
        <p className="text-[12px] mt-2 pop-in" style={{ color: 'var(--accent)' }}>
          {picked.then}
        </p>
      )}
    </div>
  );
}
