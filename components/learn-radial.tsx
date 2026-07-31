'use client';

// The category selector on Learn: four wedges around a centre that clears them.
//
// A filter rather than a menu. Picking a wedge narrows the list underneath
// instead of navigating into a sub-page, so every article is still one tap away
// and the page stays scannable — which is the whole job of an index. The centre
// is the way back to all of them.
//
// Built as an ARIA radio group, because that is exactly what it is: one choice
// from four, always visible. That buys keyboard support for free — arrows move
// between wedges, Home and End jump to the ends — which a ring of bare <path>
// elements with click handlers would not have.

import { useRef } from 'react';
import { LEARN_CATEGORIES } from '@/lib/train/learn';
import type { LearnCategory } from '@/lib/train/learn';

const SIZE = 240;
const C = SIZE / 2;
const R_OUTER = 112;
const R_INNER = 46;
/** Degrees of blank between wedges, so four shapes read as four rather than a disc. */
const GAP = 2.4;
/** Where the labels sit, between the two radii. */
const R_LABEL = (R_OUTER + R_INNER) / 2 + 4;

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const pt = (r: number, deg: number) => [C + r * Math.cos(rad(deg)), C + r * Math.sin(rad(deg))];

/**
 * Where a horizontal label sits inside a quadrant wedge.
 *
 * Not the centroid: a wedge is bounded by two radii that meet at the middle, so
 * at the centroid's height the shape only occupies one side of the centre line.
 * Text centred there hangs over the boundary into its neighbour — which is
 * exactly what it did, clipping "Techniques" and pushing "Food & fuel" out past
 * the ring. So take the height from the centroid, work out how much room the
 * band actually leaves at that height — between the inner hole and the outer
 * arc — and centre the text in that instead.
 */
function labelAnchor(midAngle: number): [number, number] {
  const [mx, my] = pt(R_LABEL, midAngle);
  const dy = Math.abs(my - C);
  // The text is a box, not a point, so take the worst height of it against each
  // boundary: the outer arc bites hardest at the far edge, the inner hole at the
  // near one. HALF_TEXT covers label and count together.
  const HALF_TEXT = 11;
  const outer = Math.sqrt(Math.max(0, R_OUTER * R_OUTER - (dy + HALF_TEXT) ** 2));
  const inner = Math.sqrt(Math.max(0, R_INNER * R_INNER - Math.max(0, dy - HALF_TEXT) ** 2));
  const dir = mx >= C ? 1 : -1;
  return [C + dir * ((inner + outer) / 2), my];
}

/** One donut sector, as an SVG path. */
function wedgePath(a0: number, a1: number): string {
  const [x0, y0] = pt(R_OUTER, a0);
  const [x1, y1] = pt(R_OUTER, a1);
  const [x2, y2] = pt(R_INNER, a1);
  const [x3, y3] = pt(R_INNER, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return [
    `M ${x0} ${y0}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${x3} ${y3}`,
    'Z',
  ].join(' ');
}

export default function LearnRadial({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<LearnCategory, number>;
  selected: LearnCategory | null;
  onSelect: (id: LearnCategory | null) => void;
}) {
  const refs = useRef<(SVGGElement | null)[]>([]);
  const total = Object.values(counts).reduce((n, c) => n + c, 0);

  const move = (from: number, step: number) => {
    const next = (from + step + LEARN_CATEGORIES.length) % LEARN_CATEGORIES.length;
    onSelect(LEARN_CATEGORIES[next].id);
    refs.current[next]?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    // Arrow keys walk the ring, which is what a radio group is expected to do.
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); move(i, 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); move(i, -1); }
    else if (e.key === 'Home') { e.preventDefault(); move(-1, 1); }
    else if (e.key === 'End') { e.preventDefault(); move(0, -1); }
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelect(LEARN_CATEGORIES[i].id);
    }
  };

  // The selected wedge is the only tab stop, so Tab passes the ring rather than
  // stepping through four things. Nothing selected: the first wedge holds it.
  const tabStop = Math.max(0, LEARN_CATEGORIES.findIndex((c) => c.id === selected));

  return (
    <div className="learn-radial">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="radiogroup" aria-label="Filter articles by category">
        {/* Every wedge is painted before any label. Drawn as one group each,
            the next wedge's fill lands on top of the previous one's text and
            quietly clips it wherever a word runs long. */}
        {LEARN_CATEGORIES.map((cat, i) => {
          const a0 = i * 90 + GAP / 2;
          const a1 = (i + 1) * 90 - GAP / 2;
          const on = selected === cat.id;
          return (
            <g
              key={cat.id}
              ref={(n) => { refs.current[i] = n; }}
              role="radio"
              aria-checked={on}
              aria-label={`${cat.label}, ${counts[cat.id]} ${counts[cat.id] === 1 ? 'article' : 'articles'}`}
              tabIndex={i === tabStop ? 0 : -1}
              className={`learn-wedge${on ? ' is-on' : ''}`}
              onClick={() => onSelect(cat.id)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <path d={wedgePath(a0, a1)} />
            </g>
          );
        })}

        {LEARN_CATEGORIES.map((cat, i) => {
          const a0 = i * 90 + GAP / 2;
          const a1 = (i + 1) * 90 - GAP / 2;
          const on = selected === cat.id;
          const [lx, ly] = labelAnchor((a0 + a1) / 2);
          return (
            <g key={`${cat.id}-label`} className={`learn-wedge-text${on ? ' is-on' : ''}`} aria-hidden="true">
              <text x={lx} y={ly - 3} textAnchor="middle" className="learn-wedge-label">
                {cat.short}
              </text>
              <text x={lx} y={ly + 13} textAnchor="middle" className="learn-wedge-count">
                {counts[cat.id]}
              </text>
            </g>
          );
        })}

        {/* Centre: what is showing, and the way back to everything. */}
        <g
          role="button"
          tabIndex={0}
          aria-label={selected ? 'Show all articles' : 'Showing all articles'}
          aria-disabled={selected === null}
          className={`learn-hub${selected ? ' is-active' : ''}`}
          onClick={() => selected && onSelect(null)}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && selected) { e.preventDefault(); onSelect(null); }
          }}
        >
          <circle cx={C} cy={C} r={R_INNER - 6} />
          {/* Deliberately not the selected category's name: the wedge behind is
              already filled and labelled, so repeating it here only competes
              with it — and the longest of those names does not fit this circle.
              The hub's one job when filtered is offering the way back. */}
          <text x={C} y={C - 6} textAnchor="middle" className="learn-hub-title">
            {selected ? 'Show all' : 'All'}
          </text>
          <text x={C} y={C + 13} textAnchor="middle" className="learn-hub-sub">
            {total} articles
          </text>
        </g>
      </svg>
    </div>
  );
}
