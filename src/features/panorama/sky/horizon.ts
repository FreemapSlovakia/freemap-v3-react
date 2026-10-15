import { distanceAt, type PanoramaDepth } from '../depth.js';
import type { PanoramaRenderInfo } from '../model/reducer.js';
import { columnAt } from '../ray.js';

/**
 * The skyline per column: the top edge of its first terrain row. True altitude
 * only for a true view — an unfolded picture's is drawn higher than it stands.
 */
export type HorizonProfile = {
  altitudes: Float32Array;
  /** Terrain reaches the frame's top here, so the skyline is somewhere above. */
  clippedTop: Uint8Array;
  /** Nothing but sky down the column: the skyline is below the frame. */
  clippedBottom: Uint8Array;
};

type Frame = Pick<PanoramaRenderInfo, 'altMax' | 'altMin' | 'stepDeg'>;

const cache = new WeakMap<PanoramaDepth, HorizonProfile>();

export function horizonProfile(
  render: Frame,
  depth: PanoramaDepth,
): HorizonProfile {
  const hit = cache.get(depth);

  if (hit) {
    return hit;
  }

  const { width, height } = depth;

  const altitudes = new Float32Array(width);

  const clippedTop = new Uint8Array(width);

  const clippedBottom = new Uint8Array(width);

  for (let x = 0; x < width; x++) {
    let top = 0;

    while (top < height && distanceAt(depth, x, top) === null) {
      top++;
    }

    if (top === height) {
      altitudes[x] = render.altMin;

      clippedBottom[x] = 1;
    } else {
      altitudes[x] = render.altMax - top * render.stepDeg;

      clippedTop[x] = top === 0 ? 1 : 0;
    }
  }

  const profile = { altitudes, clippedTop, clippedBottom };

  cache.set(depth, profile);

  return profile;
}

/**
 * Whether a body's upper limb clears the skyline at its bearing: `null` where
 * the picture cannot say — off the end of a slice, or past the frame's edge on
 * a column it clips.
 */
export function limbVisible(
  render: Pick<PanoramaRenderInfo, 'azStart' | 'stepDeg' | 'width' | 'fov'>,
  profile: HorizonProfile,
  azimuth: number,
  limb: number,
): boolean | null {
  const column = columnAt(render, azimuth);

  if (column === null) {
    return null;
  }

  const x = Math.min(Math.floor(column), profile.altitudes.length - 1);

  const horizon = profile.altitudes[x] ?? 0;

  if (limb > horizon) {
    return profile.clippedTop[x] ? null : true;
  }

  return profile.clippedBottom[x] ? null : false;
}
