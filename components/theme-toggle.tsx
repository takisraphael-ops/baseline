'use client';

// Three-way theme switch: follow the phone, always light, always dark.
//
// A segmented control rather than a single sun/moon button, because a two-state
// toggle cannot express "follow the phone" — and that is the option most people
// actually want. With a plain toggle the only way back to automatic is clearing
// storage.

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { applyTheme, readTheme, saveTheme } from '@/lib/train/theme';
import type { ThemeChoice } from '@/lib/train/theme';

const OPTIONS: { id: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { id: 'system', label: 'Auto', Icon: Monitor },
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
];

export default function ThemeToggle() {
  // Starts null so the server render and the first client render agree. The
  // real value arrives in the effect below; the boot script has already applied
  // it to <html>, so nothing flashes while this catches up.
  const [choice, setChoice] = useState<ThemeChoice | null>(null);

  useEffect(() => setChoice(readTheme()), []);

  const pick = (next: ThemeChoice) => {
    setChoice(next);
    applyTheme(next);
    saveTheme(next);
  };

  return (
    <div className="seg" role="radiogroup" aria-label="Colour theme">
      {OPTIONS.map(({ id, label, Icon }) => {
        const on = choice === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            className={`seg-btn${on ? ' is-on' : ''}`}
            onClick={() => pick(id)}
          >
            <Icon size={16} aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
