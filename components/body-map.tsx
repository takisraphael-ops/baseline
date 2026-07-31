// The detailed body map, front and back, with the worked muscles filled in.
//
// The figure itself is ported from the companion FitForge app; the path data
// lives in lib/train/figure.ts and is byte-identical to the one drawn there.
// What is NOT ported is the behaviour around it — FitForge's version is an
// interactive tab with a recent-training heat overlay, a male/female switch and
// tap-to-filter. None of that belongs on an exercise page here: this app is
// built for one person, the Library already has search and equipment filters,
// and Progress already answers "what have I been training".
//
// This sits on the exercise detail page, which is the only screen with room for
// it. The small schematic map in components/muscle-map.tsx stays exactly where
// it is — at 36px in the swap panel and 44px in the Library list, a figure with
// this much interior detail is an illegible smudge, and the side-by-side
// schematic reads instantly at that size. Two diagrams for two jobs.

import { FIGURE, FIGURE_VIEWBOX } from '@/lib/train/figure';
import { BODY_REGIONS } from '@/lib/train/body-regions';
import { MUSCLE_LABELS } from '@/lib/train/exercises';
import type { Muscle } from '@/lib/train/types';

const BODY = 'var(--border)';
const GAP = 20;

/** Region ids to paint, and at which strength, for one view. */
function paintFor(view: 'front' | 'back', primary: Muscle[], secondary: Muscle[]) {
  const fill = new Map<string, 'primary' | 'secondary'>();
  for (const m of secondary) for (const r of BODY_REGIONS[m]?.[view] ?? []) fill.set(r, 'secondary');
  // Primary wins where a muscle is listed both ways.
  for (const m of primary) for (const r of BODY_REGIONS[m]?.[view] ?? []) fill.set(r, 'primary');
  return fill;
}

function Figure({
  view,
  dx,
  primary,
  secondary,
}: {
  view: 'front' | 'back';
  dx: number;
  primary: Muscle[];
  secondary: Muscle[];
}) {
  const g = FIGURE[view];
  const fill = paintFor(view, primary, secondary);

  return (
    <g transform={`translate(${dx},0)`}>
      {g.silhouette.map((d, i) => (
        <path key={`s${i}`} d={d} fill={BODY} />
      ))}

      {Object.entries(g.regions).map(([id, paths]) => {
        const state = fill.get(id);
        if (!state) return null;
        return paths.map((d, i) => (
          <path
            key={`${id}-${i}`}
            d={d}
            fill={state === 'primary' ? 'var(--accent)' : 'var(--accent-soft)'}
          />
        ));
      })}

      {/* Interior definition, drawn last so it reads over the fills. Thin, low
          opacity: at phone size a full-strength line grid turns the figure into
          a wireframe and the highlight stops being the thing you notice. */}
      {g.detail.map((d, i) => (
        <path
          key={`d${i}`}
          d={d}
          fill="none"
          stroke="var(--text-faint)"
          strokeWidth={0.7}
          strokeOpacity={0.35}
        />
      ))}
    </g>
  );
}

export default function BodyMap({
  primary,
  secondary = [],
  className,
  labels = true,
}: {
  primary: Muscle[];
  secondary?: Muscle[];
  className?: string;
  /** Front/Back captions under each figure. */
  labels?: boolean;
}) {
  const { width, height } = FIGURE_VIEWBOX;
  const w = width * 2 + GAP;
  const h = height + (labels ? 22 : 0);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      role="img"
      aria-label={`Muscles worked: ${primary.map((m) => MUSCLE_LABELS[m] ?? m).join(', ')}`}
    >
      <Figure view="front" dx={0} primary={primary} secondary={secondary} />
      <Figure view="back" dx={width + GAP} primary={primary} secondary={secondary} />

      {labels && (
        <>
          <text x={width / 2} y={height + 16} textAnchor="middle" fontSize="13" fill="var(--text-muted)">
            Front
          </text>
          <text
            x={width + GAP + width / 2}
            y={height + 16}
            textAnchor="middle"
            fontSize="13"
            fill="var(--text-muted)"
          >
            Back
          </text>
        </>
      )}
    </svg>
  );
}
