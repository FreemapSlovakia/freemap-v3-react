import { bearingTo, distanceTo } from '@shared/geoutils.js';
import { mod } from '@shared/mathUtils.js';
import type { LatLon } from '@shared/types/common.js';
import destination from '@turf/destination';
import {
  type PanoramaDepth,
  type PanoramaSample,
  visibleAtDistance,
} from './depth.js';
import type { PanoramaRenderInfo } from './model/reducer.js';
import { getPanoramaRenderData } from './renderHolder.js';

/** Where a bearing and a distance from the viewpoint land on the ground. */
export function groundPoint(
  viewpoint: LatLon,
  azimuth: number,
  distance: number,
): LatLon {
  const [lon, lat] = destination(
    [viewpoint.lon, viewpoint.lat],
    distance,
    azimuth,
    { units: 'meters' },
  ).geometry.coordinates as [number, number];

  return { lat, lon };
}

/** Which image column a bearing reads at, taking the turn's wrap. */
export function columnAt(
  render: Pick<PanoramaRenderInfo, 'azStart' | 'stepDeg' | 'width'>,
  azimuth: number,
): number {
  return mod((azimuth - render.azStart) / render.stepDeg, render.width);
}

/**
 * What the picture makes of a place: where it is from the viewpoint, and what
 * the terrain down that column answers — `seen` is `null` where the place
 * cannot be made out at all (a column of sky, or a render without a depth
 * buffer), and stands somewhere else than asked where a ridge hides it; see
 * {@link visibleAtDistance}.
 */
export interface PanoramaReading {
  azimuth: number;
  /** Metres to the place asked for, not to what the picture answers with. */
  distance: number;
  seen: (PanoramaSample & { ele: number }) | null;
}

/** {@link readTowards} from a bearing and a distance already in hand. */
export function readAlong(
  render: PanoramaRenderInfo,
  depth: PanoramaDepth | null,
  azimuth: number,
  distance: number,
): PanoramaReading {
  const sample = depth
    ? visibleAtDistance(depth, columnAt(render, azimuth), distance)
    : null;

  return {
    azimuth,
    distance,
    // The elevation goes with the row, so it is of the distance the picture
    // answered rather than the one asked for — the two part company wherever
    // the place is hidden.
    seen: sample && {
      ...sample,
      ele: groundElevation(render, sample.iy, sample.distance),
    },
  };
}

/**
 * The whole of what the picture has to say about a place named on the map. One
 * reading, since every caller wants the same five steps and two of them had
 * already begun to disagree about which distance the elevation belongs to.
 *
 * The distance buffer comes from `renderHolder` rather than being passed in, so
 * that a caller with a place and a render needs nothing else; a picture other
 * than this render's is no answer, and reads as none.
 */
export function readTowards(
  render: PanoramaRenderInfo,
  at: LatLon,
): PanoramaReading {
  const data = getPanoramaRenderData();

  return readAlong(
    render,
    data?.id === render.id ? data.depth : null,
    bearingTo(render.viewpoint, at),
    distanceTo(render.viewpoint, at),
  );
}

/** Earth's radius, and the refraction the renderer bends its rays by. */
const EARTH_RADIUS_M = 6_371_000;

const REFRACTION = 0.13;

/**
 * Roughly how high the ground at `iy` down a column stands, in metres above sea
 * level — the eye's own elevation plus what the line of sight climbs over that
 * distance, with the curvature it falls away by added back.
 *
 * Rough, and said with a `~`: the row is a pixel of a picture, so a degree of
 * frame is tens of metres at fifty kilometres, and the refraction is the
 * standard coefficient rather than the one the renderer used. It is the only
 * elevation to be had without asking the elevation API for one.
 */
export function groundElevation(
  render: Pick<
    PanoramaRenderInfo,
    'altMax' | 'stepDeg' | 'eyeElevation' | 'depthLift' | 'rangeM'
  >,
  iy: number,
  distance: number,
): number {
  // The unfolding raises terrain in proportion to how far off it is — nothing
  // at the eye, the whole lift at the range — so it comes off the drawn angle
  // before anything is measured from it.
  const lift = render.rangeM
    ? (render.depthLift * distance) / render.rangeM
    : 0;

  const alt = ((render.altMax - iy * render.stepDeg - lift) * Math.PI) / 180;

  return (
    render.eyeElevation +
    distance * Math.tan(alt) +
    ((1 - REFRACTION) * distance * distance) / (2 * EARTH_RADIUS_M)
  );
}
