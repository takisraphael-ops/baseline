'use client';

// Three-way theme switch: follow the phone, always light, always dark.
//
// A segmented control rather than a single sun/moon button, because a two-state
// toggle cannot express "follow the phone" — and that is the option most people
// actually want. With a plain toggle the only way back to automatic is clearing
// storage.

import { Monitor, Moon, Sun } from 'lucide-react';
import { applyTheme, saveTheme } from '@/lib/train/theme';
import { useThemeChoice } from '@/lib/train/use-store';
import type { ThemeChoice } from '@/lib/train/theme';

const OPTIONS: { id: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { id: 'system', label: 'Auto', Icon: Monitor },
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
];

export default function ThemeToggle() {
  // Null during server render and hydration, so those two agree; the boot
  // script has already put the saved choice on <html>, so nothing flashes while
  // this catches up. Subscribed rather than loaded once, which is also what
  // lets a change in another tab move the selection here.
  const choice = useThemeChoice();

  const pick = (next: ThemeChoice) => {
    // <html> is outside React's tree, so it is updated directly. saveTheme
    // notifies the store, which re-renders this control — no local copy of the
    // choice to keep in step.
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
