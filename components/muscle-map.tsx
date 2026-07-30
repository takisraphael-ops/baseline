// Schematic body map. Front and back, with the worked muscles highlighted.
//
// Drawn in-house rather than pulled from a CDN: it works offline, it makes no
// outbound request, it cannot rot, and it renders identically on every device.
// Deliberately schematic rather than anatomical — at phone size a diagram that
// reads instantly beats one that is precisely correct and illegible.

import { MUSCLE_LABELS } from '@/lib/train/exercises';
import type { Muscle } from '@/lib/train/types';

const BODY = 'var(--border)';

interface Props {
  primary: Muscle[];
  secondary?: Muscle[];
  className?: string;
  /** Front/Back captions are illegible below about 120px, so they are opt-in. */
  labels?: boolean;
  /**
   * Hide from assistive tech. Set this wherever the map sits inside a link or
   * button that already names the exercise — otherwise the muscle list is read
   * out as part of that control's name, ahead of the name itself.
   */
  decorative?: boolean;
}

export default function MuscleMap({ primary, secondary = [], className, labels = false, decorative = false }: Props) {
  const fill = (m: Muscle) =>
    primary.includes(m) ? 'var(--accent)' : secondary.includes(m) ? 'var(--accent-soft)' : BODY;

  return (
    <svg
      viewBox={`0 0 250 ${labels ? 230 : 220}`}
      className={className}
      // The ids are slugs: unlabelled, a screen reader says "front-delts".
      // MUSCLE_LABELS already holds the prose the rest of the UI shows.
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={
        decorative ? undefined : `Muscles worked: ${primary.map((m) => MUSCLE_LABELS[m] ?? m).join(', ')}`
      }
    >
      {/* ------------------------------------------------------------ front */}
      <g>
        <circle cx="60" cy="19" r="12" fill={BODY} />
        <rect x="55" y="30" width="10" height="7" fill={BODY} />
        {/* torso */}
        <path d="M34 44 L86 44 L79 118 L41 118 Z" fill={BODY} />
        {/* arms */}
        <path d="M32 46 L22 96 L30 98 L40 50 Z" fill={BODY} />
        <path d="M88 46 L98 96 L90 98 L80 50 Z" fill={BODY} />
        <rect x="18" y="94" width="9" height="44" rx="4" fill={BODY} />
        <rect x="93" y="94" width="9" height="44" rx="4" fill={BODY} />
        {/* hips + legs */}
        <path d="M41 118 L79 118 L78 132 L42 132 Z" fill={BODY} />
        <rect x="42" y="130" width="17" height="86" rx="8" fill={BODY} />
        <rect x="61" y="130" width="17" height="86" rx="8" fill={BODY} />

        <ellipse cx="35" cy="51" rx="8" ry="10" fill={fill('front-delts')} />
        <ellipse cx="85" cy="51" rx="8" ry="10" fill={fill('front-delts')} />
        <rect x="41" y="53" width="17" height="21" rx="5" fill={fill('chest')} />
        <rect x="62" y="53" width="17" height="21" rx="5" fill={fill('chest')} />
        <ellipse cx="26" cy="80" rx="7" ry="13" fill={fill('biceps')} />
        <ellipse cx="94" cy="80" rx="7" ry="13" fill={fill('biceps')} />
        <rect x="49" y="77" width="22" height="36" rx="6" fill={fill('core')} />
        <ellipse cx="50" cy="152" rx="9" ry="24" fill={fill('quads')} />
        <ellipse cx="70" cy="152" rx="9" ry="24" fill={fill('quads')} />
        <ellipse cx="60" cy="146" rx="6" ry="16" fill={fill('adductors')} />
        <ellipse cx="50" cy="197" rx="7" ry="15" fill={fill('calves')} />
        <ellipse cx="70" cy="197" rx="7" ry="15" fill={fill('calves')} />

        {labels && <text x="60" y="227" textAnchor="middle" fontSize="9" fill="var(--text-muted)">Front</text>}
      </g>

      {/* ------------------------------------------------------------- back */}
      <g transform="translate(130,0)">
        <circle cx="60" cy="19" r="12" fill={BODY} />
        <rect x="55" y="30" width="10" height="7" fill={BODY} />
        <path d="M34 44 L86 44 L79 118 L41 118 Z" fill={BODY} />
        <path d="M32 46 L22 96 L30 98 L40 50 Z" fill={BODY} />
        <path d="M88 46 L98 96 L90 98 L80 50 Z" fill={BODY} />
        <rect x="18" y="94" width="9" height="44" rx="4" fill={BODY} />
        <rect x="93" y="94" width="9" height="44" rx="4" fill={BODY} />
        <path d="M41 118 L79 118 L78 132 L42 132 Z" fill={BODY} />
        <rect x="42" y="130" width="17" height="86" rx="8" fill={BODY} />
        <rect x="61" y="130" width="17" height="86" rx="8" fill={BODY} />

        <path d="M46 42 L74 42 L69 58 L51 58 Z" fill={fill('traps')} />
        <ellipse cx="35" cy="51" rx="8" ry="10" fill={fill('rear-delts')} />
        <ellipse cx="85" cy="51" rx="8" ry="10" fill={fill('rear-delts')} />
        <rect x="43" y="58" width="34" height="18" rx="5" fill={fill('upper-back')} />
        <path d="M43 77 L58 77 L54 104 L45 100 Z" fill={fill('lats')} />
        <path d="M77 77 L62 77 L66 104 L75 100 Z" fill={fill('lats')} />
        <ellipse cx="26" cy="80" rx="7" ry="13" fill={fill('triceps')} />
        <ellipse cx="94" cy="80" rx="7" ry="13" fill={fill('triceps')} />
        <rect x="52" y="102" width="16" height="14" rx="4" fill={fill('lower-back')} />
        <ellipse cx="51" cy="130" rx="11" ry="12" fill={fill('glutes')} />
        <ellipse cx="69" cy="130" rx="11" ry="12" fill={fill('glutes')} />
        <ellipse cx="39" cy="128" rx="6" ry="9" fill={fill('abductors')} />
        <ellipse cx="81" cy="128" rx="6" ry="9" fill={fill('abductors')} />
        <ellipse cx="50" cy="163" rx="9" ry="22" fill={fill('hamstrings')} />
        <ellipse cx="70" cy="163" rx="9" ry="22" fill={fill('hamstrings')} />
        <ellipse cx="50" cy="197" rx="7" ry="15" fill={fill('calves')} />
        <ellipse cx="70" cy="197" rx="7" ry="15" fill={fill('calves')} />

        {labels && <text x="60" y="227" textAnchor="middle" fontSize="9" fill="var(--text-muted)">Back</text>}
      </g>
    </svg>
  );
}
