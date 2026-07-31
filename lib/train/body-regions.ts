// Which regions of the ported figure light up for each muscle this app knows.
//
// Separate from figure.ts because that file is generated wholesale from
// FitForge's artwork and would overwrite anything added to it. This is the
// judgement layer on top: the artwork's zone names are FitForge's, and two of
// them do not line up one-to-one with the muscles used here.

import type { Muscle } from './types';

/**
 * Mostly one-to-one. The two that are not:
 *
 *  - FitForge draws a single `shoulders` zone per view, where this app splits
 *    the deltoid three ways. Front-on, the front and side heads are what you
 *    see, so both claim the front shoulder; the rear head claims the back one.
 *  - FitForge has no abductor zone. The outer glute is drawn as part of
 *    `glutes`, so hip abduction highlights the glute rather than nothing —
 *    anatomically loose, and far better than a blank diagram on an exercise
 *    whose whole purpose is that muscle.
 *
 * `forearms` and `hip_flexors` exist in the artwork and are deliberately never
 * claimed: nothing in the library lists them, so they stay body-coloured.
 */
export const BODY_REGIONS: Record<Muscle, { front?: string[]; back?: string[] }> = {
  chest: { front: ['chest'] },
  'front-delts': { front: ['shoulders'] },
  'side-delts': { front: ['shoulders'], back: ['shoulders'] },
  'rear-delts': { back: ['shoulders'] },
  biceps: { front: ['biceps'] },
  triceps: { back: ['triceps'] },
  traps: { front: ['traps'], back: ['traps'] },
  lats: { back: ['lats'] },
  'upper-back': { back: ['midback'] },
  'lower-back': { back: ['lower_back'] },
  core: { front: ['abs', 'obliques'] },
  quads: { front: ['quads'] },
  hamstrings: { back: ['hams'] },
  glutes: { back: ['glutes'] },
  abductors: { back: ['glutes'] },
  adductors: { front: ['adductors'] },
  calves: { front: ['calves'], back: ['calves'] },
};
