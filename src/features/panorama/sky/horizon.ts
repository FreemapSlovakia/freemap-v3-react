import { distanceAt, type PanoramaDepth } from '../depth.js';
import type { PanoramaRenderInfo } from '../model/reducer.js';
import { columnAt } from '../ray.js';

/**
 * The skyline per column as true altitude: each row's lift comes off by its own
 * distance, so a near ridge can out-stand the lifted range drawn above it.
 */
export type HorizonProfile = {
  altitudes: Float32Array;
  /** Terrain reaches the frame's top here, so the skyline is somewhere above. */
  clippedTop: Uint8Array;
  /** Nothing but sky down the column: the skyline is below the frame. */
  clippedBottom: Uint8Array;
};

type Frame = Pick<
  PanoramaRenderInfo,
  'altMax' | 'altMin' | 'stepDeg' | 'depthLift' | 'rangeM'
>;

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

  const liftPerM = render.rangeM ? render.depthLift / render.rangeM : 0;

  for (let x = 0; x < width; x++) {
    let best = -Infinity;

    let top = -1;

    for (let y = 0; y < height; y++) {
      // A row's top edge; the lift only lowers it, so once that is under the
      // best so far nothing further down can beat it.
      const drawn = render.altMax - y * render.stepDeg;

      if (drawn <= best) {
        break;
      }

      const distance = distanceAt(depth, x, y);

      if (distance === null) {
        continue;
      }

      if (top < 0) {
        top = y;
      }

      best = Math.max(best, drawn - liftPerM * distance);

      if (!liftPerM) {
        break;
      }
    }

    if (top < 0) {
      altitudes[x] = render.altMin;

      clippedBottom[x] = 1;
    } else {
      altitudes[x] = best;

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
