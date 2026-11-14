import type { Bbox } from '@features/mapArea/model/actions.js';

const R = 6378137;

/** Elevation tile zooms: terrain-tiles' overviews stop at z8, its data at z18. */
export const MIN_ZOOM = 8;

export const MAX_ZOOM = 18;

/**
 * Grid points a model may have. Premium's makes a 256 mm model at 0.13 mm and
 * about 1 GB at peak while it is built; the free one a quarter of both.
 */
export const FREE_MAX_SAMPLES = 1_000_000;

export const PREMIUM_MAX_SAMPLES = 4_000_000;

/**
 * Grid points of a model to be simplified, whatever the account allows.
 * Delatin keeps its mesh in plain JS arrays, several times the full grid's
 * memory; past this a small tolerance would exhaust the tab.
 */
export const SIMPLIFY_MAX_SAMPLES = 2_000_000;

/** Narrowest model width the form accepts, millimetres. */
export const MIN_WIDTH_MM = 10;

/** Longest model side the form accepts, millimetres. */
export const MAX_SIDE_MM = 2000;

/** A new area's model: its longer side, millimetres. */
export const DEFAULT_SIDE_MM = 200;

/**
 * Elevation tiles a model may read. The worker holds them all decoded, about
 * 270 kB each; premium's largest grid at two pixels per step needs about 1000.
 */
export const MAX_TILES = 1200;

/**
 * The area with its longitudes in −180…180, as a map panned across a world copy
 * reports them shifted; `null` for one across the antimeridian, which the
 * tile grid can't span.
 */
export function normalizeBbox(bbox: Bbox): Bbox | null {
  const [west, south, east, north] = bbox;

  const shift = Math.round((west + east) / 2 / 360) * 360;

  const w = west - shift;

  const e = east - shift;

  return w >= -180 && e <= 180 && w < e && south < north
    ? [w, south, e, north]
    : null;
}

function cosLat(bbox: Bbox): number {
  return Math.cos((((bbox[1] + bbox[3]) / 2) * Math.PI) / 180);
}

/** Ground metres per elevation tile pixel at zoom `z` and the bbox's centre. */
export function tilePixelM(z: number, bbox: Bbox): number {
  return ((2 * Math.PI * R) / 256 / 2 ** z) * cosLat(bbox);
}

/** Ground size of a bbox, metres: its width at the centre latitude, its depth exact. */
export function groundSize(bbox: Bbox): { width: number; depth: number } {
  const [west, south, east, north] = bbox;

  return {
    width: ((east - west) / 180) * Math.PI * R * cosLat(bbox),
    depth: ((north - south) / 180) * Math.PI * R,
  };
}

/**
 * Width of the model whose longer side is `side`, millimetres; never below
 * {@link MIN_WIDTH_MM}, so a thin strip still gets a model.
 */
export function fittingWidth(bbox: Bbox, side: number): number {
  const { width, depth } = groundSize(bbox);

  return Math.max(
    MIN_WIDTH_MM,
    Math.floor(Math.min(side, (side * width) / depth)),
  );
}

export interface TerrainModelPlan {
  widthMm: number;
  depthMm: number;
  /** Model millimetres per ground metre. */
  mmPerM: number;
  /** Grid step, millimetres. */
  stepMm: number;
  cols: number;
  rows: number;
  /** Elevation tile zoom the heights are read from. */
  zoom: number;
  /** Why the step is what it is. */
  limitedBy: 'floor' | 'zoom' | 'samples';
}

/**
 * Finest grid step, millimetres. Not the nozzle: that bounds how narrow a
 * printed feature can be, while outlines are placed far finer — about what
 * slicers keep of a contour.
 */
export const MIN_STEP_MM = 0.05;

/**
 * The grid: one data pixel of the finest zoom the account may read, unless the
 * floor or the sample cap holds it coarser. Read from the coarsest zoom whose
 * pixel is at most half the step.
 */
export function planModel(
  bbox: Bbox,
  widthMm: number,
  maxZoom: number,
  maxSamples: number,
): TerrainModelPlan {
  const { width, depth } = groundSize(bbox);

  const mmPerM = widthMm / width;

  const depthMm = depth * mmPerM;

  const byZoom = tilePixelM(maxZoom, bbox) * mmPerM;

  const points = (step: number) =>
    (Math.round(widthMm / step) + 1) * (Math.round(depthMm / step) + 1);

  // The area alone undercounts by the grid's outer row and column.
  let bySamples = Math.sqrt((widthMm * depthMm) / maxSamples);

  while (points(bySamples) > maxSamples) {
    bySamples *= 1.001;
  }

  const stepMm = Math.max(MIN_STEP_MM, byZoom, bySamples);

  let zoom = maxZoom;

  // At least two data pixels per step, so a cell can be averaged rather than
  // point-sampled, which aliases sharp ridges into stair-steps.
  for (let z = MIN_ZOOM; z < maxZoom; z++) {
    if (tilePixelM(z, bbox) * mmPerM * 2 <= stepMm) {
      zoom = z;

      break;
    }
  }

  return {
    widthMm,
    depthMm,
    mmPerM,
    stepMm,
    cols: Math.max(2, Math.round(widthMm / stepMm) + 1),
    rows: Math.max(2, Math.round(depthMm / stepMm) + 1),
    zoom,
    limitedBy:
      stepMm === byZoom ? 'zoom' : stepMm === MIN_STEP_MM ? 'floor' : 'samples',
  };
}
