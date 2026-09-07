import { bearingTo, distanceTo } from '@shared/geoutils.js';
import { angleDiff, clamp, mod } from '@shared/mathUtils.js';
import type { LatLon } from '@shared/types/common.js';
import destination from '@turf/destination';
import {
  type PanoramaDepth,
  type PanoramaSample,
  visibleAtDistance,
} from './depth.js';
import type { PanoramaRenderInfo } from './model/reducer.js';
import { isFullTurn } from './model/settingsReducer.js';
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

/** How wide a strip actually is, in degrees of its own columns. */
export function panoramaSpanDeg(
  render: Pick<PanoramaRenderInfo, 'stepDeg' | 'width'>,
): number {
  return render.width * render.stepDeg;
}

/**
 * Which image column a bearing reads at, or `null` where the picture does not
 * reach it. A full turn wraps; a strip has ends, and wrapping there would read
 * the country behind you off its far edge.
 */
export function columnAt(
  render: Pick<PanoramaRenderInfo, 'azStart' | 'stepDeg' | 'width' | 'fov'>,
  azimuth: number,
): number | null {
  if (isFullTurn(render.fov)) {
    return mod((azimuth - render.azStart) / render.stepDeg, render.width);
  }

  // The short way round, so a bearing just left of the strip comes out slightly
  // negative rather than a whole turn to the right of it.
  const column = angleDiff(azimuth, render.azStart) / render.stepDeg;

  return column < 0 || column >= render.width ? null : column;
}

/**
 * A bearing the viewer may actually look at: a full turn takes any, a strip
 * only what it can fill `viewportDeg` of picture at. Both ends are measured
 * from the middle, so a bearing off either side comes back to the near one.
 */
export function clampPanoramaAzimuth(
  render: Pick<PanoramaRenderInfo, 'azStart' | 'stepDeg' | 'width' | 'fov'>,
  azimuth: number,
  viewportDeg: number,
): number {
  if (isFullTurn(render.fov)) {
    return mod(azimuth, 360);
  }

  const span = panoramaSpanDeg(render);

  const middle = render.azStart + span / 2;

  const reach = Math.max(0, (span - viewportDeg) / 2);

  return mod(middle + clamp(angleDiff(azimuth, middle), -reach, reach), 360);
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

/**
 * Whether a bearing falls in what a render holds. A full turn holds every one;
 * a strip has ends, and a place past them is what an aim has to re-render for.
 */
export function withinRender(
  render: Pick<PanoramaRenderInfo, 'azStart' | 'stepDeg' | 'width' | 'fov'>,
  azimuth: number,
): boolean {
  return columnAt(render, azimuth) !== null;
}

/** {@link readTowards} from a bearing and a distance already in hand. */
export function readAlong(
  render: PanoramaRenderInfo,
  depth: PanoramaDepth | null,
  azimuth: number,
  distance: number,
): PanoramaReading {
  const column = columnAt(render, azimuth);

  const sample =
    depth && column !== null
      ? visibleAtDistance(depth, column, distance)
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
