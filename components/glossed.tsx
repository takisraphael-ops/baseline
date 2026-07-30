'use client';

import Term from '@/components/term';
import { TERM_PATTERN, termIdForMatch } from '@/lib/train/glossary';

// Auto-links gym vocabulary inside prose that lives in data rather than JSX —
// Learn articles, block descriptions, cardio notes, exercise cues.
//
// Two rules keep it from becoming a minefield of dotted underlines:
//
//  1. Only terms flagged `auto` in the glossary are matched at all, so ordinary
//     words that happen to have a gym meaning ("set", "block", "volume") are
//     never caught. Those are placed by hand instead.
//  2. Within any one string, a term is linked on its first appearance only.
//
// Deliberately pure — no shared mutable "already seen" state across paragraphs,
// because that breaks under React's double-render in development and produces a
// page where nothing is linked at all.

export default function Glossed({ text, skip }: { text: string; skip?: string[] }) {
  const matches = [...text.matchAll(TERM_PATTERN)];
  if (matches.length === 0) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  const used = new Set(skip ?? []);
  let cursor = 0;

  matches.forEach((m, i) => {
    const id = termIdForMatch(m[0]);
    if (!id || used.has(id) || m.index === undefined) return;
    used.add(id);

    if (m.index > cursor) nodes.push(text.slice(cursor, m.index));
    // The matched text is passed through rather than the glossary's own label,
    // so "supersets" stays plural and a mid-sentence "zone 2" keeps its case.
    nodes.push(<Term key={`${id}-${i}`} id={id}>{m[0]}</Term>);
    cursor = m.index + m[0].length;
  });

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
