'use client';

import { ArrowLeftRight, X } from 'lucide-react';
import MuscleMap from '@/components/muscle-map';
import { EQUIPMENT_LABELS } from '@/lib/train/exercises';
import { alternativesFor } from '@/lib/train/swaps';

// Shown when the machine she needs is taken.
//
// Swaps last for this session only. A busy Tuesday should not quietly rewrite
// her programme, and next week the original comes back.

export default function SwapPanel({
  exerciseId, sessionExerciseIds, onPick, onClose,
}: {
  exerciseId: string;
  sessionExerciseIds: string[];
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const alternatives = alternativesFor(exerciseId, sessionExerciseIds);

  return (
    <div className="mt-3 rounded-[12px] p-3 pop-in" style={{ background: 'var(--bg-sunken)' }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0">
          <p className="card-title">Swap it for today</p>
          <p className="text-sm muted mt-0.5">
            Just for this session — the original is back next time.
          </p>
        </div>
        <button onClick={onClose} className="btn btn-quiet px-2 min-h-0 py-1.5 shrink-0" aria-label="Close swap options">
          <X size={16} />
        </button>
      </div>

      {alternatives.length === 0 ? (
        <p className="text-sm muted mt-2">
          Nothing close enough to swap in. Skip it today and carry on — one missed exercise costs
          you very little.
        </p>
      ) : (
        <ul className="space-y-1.5 mt-2">
          {alternatives.map(({ exercise, reason }) => (
            <li key={exercise.id}>
              <button
                onClick={() => onPick(exercise.id)}
                className="w-full flex items-center gap-3 text-left rounded-[10px] px-2.5 py-2"
                style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', minHeight: 56 }}
              >
                <MuscleMap primary={exercise.primary} secondary={exercise.secondary} className="w-9 shrink-0" decorative />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-sm leading-tight">{exercise.name}</span>
                  <span className="block text-[12px] muted leading-tight mt-0.5">
                    {EQUIPMENT_LABELS[exercise.equipment]} · {reason}
                  </span>
                </span>
                <ArrowLeftRight size={15} className="shrink-0" style={{ color: 'var(--accent)' }} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
