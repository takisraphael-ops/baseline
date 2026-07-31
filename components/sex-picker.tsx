'use client';

// Asked because two published equations need it, not because the app cares who
// you are.
//
// The Rockport walk test carries a sex term worth 6.3 ml/kg/min, and the
// population norms are published as two tables. Left unasked, the app assumed
// female — correct for the one person it was built for, and silently wrong for
// anybody else: a man's estimate came out 6.3 low and was then rated against a
// women's chart. Neither surface showed any sign of it.
//
// Nothing else reads this. Starting weights come from the quiz, which measures
// what the athlete can actually do rather than inferring it.

import { useId } from 'react';
import type { Sex } from '@/lib/train/types';

const OPTIONS: { id: Sex; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
];

export default function SexPicker({
  value,
  onChange,
  labelled = true,
}: {
  value: Sex;
  onChange: (next: Sex) => void;
  /** Off where the surrounding card already carries a heading. */
  labelled?: boolean;
}) {
  const id = useId();
  return (
    <div>
      {labelled && <p className="label mb-1.5" id={id}>Sex</p>}
      <div className="seg" role="radiogroup" aria-labelledby={labelled ? id : undefined} aria-label={labelled ? undefined : 'Sex'}>
        {OPTIONS.map(({ id: opt, label }) => {
          const on = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={on}
              className={`seg-btn${on ? ' is-on' : ''}`}
              onClick={() => onChange(opt)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-xs faint mt-1">
        Used only by the VO2 max estimate and the chart it compares you against — both are published
        for these two groups. Nothing else in the app reads it.
      </p>
    </div>
  );
}
