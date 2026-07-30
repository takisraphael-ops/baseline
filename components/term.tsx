'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { BookOpen, X } from 'lucide-react';
import { getTerm } from '@/lib/train/glossary';

// Tap any piece of gym vocabulary and get the plain-English version, without
// leaving the screen you are on.
//
// The sheet, rather than a tooltip: hover does not exist on a phone, and the
// moment she needs this most is mid-session with one hand on a machine. It
// comes up from the bottom, within thumb reach, and closes on backdrop tap,
// Escape, or the button.
//
// Each Term owns its own sheet rather than sharing one through context. Only
// one can be open at a time anyway — the backdrop covers the screen — and it
// keeps Term usable anywhere without a provider above it.

export default function Term({
  id,
  children,
  className = '',
  bare = false,
}: {
  id: string;
  children?: React.ReactNode;
  className?: string;
  /**
   * Skip the inline `.term` styling. Needed when the term *is* a chip: the
   * inline treatment resets padding and background, which would flatten the
   * pill into bare text. Pair with `chip-info` for the tap affordance.
   */
  bare?: boolean;
}) {
  const [open, setOpen] = useState(false);
  // Portals need a DOM to target, so nothing is rendered until after mount.
  const [mounted, setMounted] = useState(false);
  const term = getTerm(id);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    // The sheet is portalled to the end of <body>, so without moving focus into
    // it, Tab from the trigger walks the page behind the scrim while a dialog
    // claiming aria-modal is on screen. Focus goes in on open, is kept inside
    // while it is up, and is handed back to the trigger on close — dropping it
    // to <body> instead loses a keyboard user's place entirely.
    const previous = triggerRef.current;
    sheetRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusable = sheet.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0] ?? sheet;
      const last = focusable[focusable.length - 1] ?? sheet;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === sheet)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open]);

  // An unknown id must never swallow the words it was wrapping.
  if (!term) return <>{children ?? id}</>;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={bare ? className : `term ${className}`}
        aria-label={`What ${term.label.toLowerCase()} means`}
      >
        {children ?? term.label}
      </button>

      {/* Rendered into <body> rather than in place. Terms sit inside headings
          and paragraphs, so a sheet rendered where it is written would be a
          <div> inside a <p> — invalid markup that the browser reflows and that
          breaks hydration — and it would inherit the accent colour of whatever
          sentence it appeared in. */}
      {open && mounted && createPortal(
        <div
          className="term-scrim"
          role="dialog"
          aria-modal="true"
          aria-label={term.label}
          onClick={() => setOpen(false)}
        >
          <div className="term-sheet" tabIndex={-1} ref={sheetRef} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">{term.label}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-quiet px-2 min-h-0 py-1.5 shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[15px] mt-2">{term.short}</p>

            <div className="flex gap-2 mt-4">
              {term.more && (
                <Link
                  href={`/learn/${term.more}`}
                  onClick={() => setOpen(false)}
                  className="btn btn-primary flex-1 text-sm"
                >
                  <BookOpen size={15} aria-hidden /> Read more
                </Link>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={term.more ? 'btn btn-ghost text-sm' : 'btn btn-primary flex-1 text-sm'}
              >
                Got it
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
