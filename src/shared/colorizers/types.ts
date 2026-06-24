import type { Feature, LineString } from 'geojson';

export type HotlinePalette = Array<{
  r: number;
  g: number;
  b: number;
  t: number;
}>;

export interface ColorizedPoint {
  lat: number;
  lon: number;
  color: number;
  // True when the underlying value is missing. The colorized line breaks at
  // such points instead of drawing through a misleading mid-palette color.
  gap?: boolean;
}

// {@link noDataRuns} stretches a colorizer can't value are drawn as a neutral,
// slightly thinner, semi-transparent line: it reads as "no value here" and
// stays distinct from a full-strength colored run by form rather than hue, so
// it never collides with a palette color (e.g. the gray of `elevation`).
export const NO_DATA_COLOR = '#808080';
export const NO_DATA_OPACITY = 2 / 3;

/**
 * Split colorized points into contiguous runs, breaking at gaps (points whose
 * value is missing). Runs shorter than two points can't form a line and are
 * dropped, leaving a hole the {@link noDataRuns} fill spans in a neutral color.
 */
export function splitOnGaps(points: ColorizedPoint[]): ColorizedPoint[][] {
  const runs: ColorizedPoint[][] = [];

  let current: ColorizedPoint[] = [];

  for (const point of points) {
    if (point.gap) {
      if (current.length > 1) {
        runs.push(current);
      }

      current = [];
    } else {
      current.push(point);
    }
  }

  if (current.length > 1) {
    runs.push(current);
  }

  return runs;
}

/**
 * The complement of {@link splitOnGaps}: runs covering every edge that touches
 * a gap, including the valid points bordering each gap so the run connects to
 * the colorized line. Drawn in {@link NO_DATA_COLOR} so stretches the colorizer
 * has no value for stay visible instead of leaving a hole.
 */
export function noDataRuns(points: ColorizedPoint[]): ColorizedPoint[][] {
  const runs: ColorizedPoint[][] = [];

  let current: ColorizedPoint[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    if (points[i]!.gap || points[i + 1]!.gap) {
      if (current.length === 0) {
        current.push(points[i]!);
      }

      current.push(points[i + 1]!);
    } else if (current.length > 0) {
      runs.push(current);

      current = [];
    }
  }

  if (current.length > 0) {
    runs.push(current);
  }

  return runs;
}

export interface Colorizer {
  palette: HotlinePalette;
  isAvailable?: (features: Feature<LineString>[]) => boolean;
  compute: (features: Feature<LineString>[]) => ColorizedPoint[][];
  // Derived from the elevation coordinate, so it benefits from the same
  // fill/override prompt the elevation chart uses.
  needsElevation?: boolean;
}

/**
 * Build positions by normalizing per-coord values to 0..1 via min/max
 * across each feature. NaN inputs are flagged as gaps (the line breaks
 * there); they keep the mid-palette color (0.5) only as a harmless filler,
 * which is also the fallback when the value range is degenerate. Keeping the
 * Hotline input within [0, 1] avoids CanvasGradient crashes.
 */
export function colorizeByValues(
  features: Feature<LineString>[],
  perFeature: (feature: Feature<LineString>) => {
    coords: number[][];
    values: number[];
  },
): ColorizedPoint[][] {
  return features.map((feature) => {
    const { coords, values } = perFeature(feature);

    const valid = values.filter((v): v is number => Number.isFinite(v));

    const min = valid.length ? Math.min(...valid) : 0;

    const max = valid.length ? Math.max(...valid) : 0;

    const range = max - min;

    return coords.map((coord, i) => {
      const v = values[i];

      const finite = Number.isFinite(v);

      const color = range > 0 && finite ? (v - min) / range : 0.5;

      return { lat: coord[1], lon: coord[0], color, gap: !finite };
    });
  });
}

export function readNumericArray(
  feature: Feature<LineString>,
  key: string,
  expectedLength: number,
): number[] | null {
  const cp = feature.properties?.['coordinateProperties'] as
    | Record<string, unknown>
    | undefined;

  const raw = cp?.[key];

  if (!Array.isArray(raw) || raw.length !== expectedLength) {
    return null;
  }

  // togeojson fills the array with `null` and writes values where present;
  // map them to NaN so colorizeByValues filters them out of the range.
  return raw.map((v) => (typeof v === 'number' ? v : NaN));
}

export function hasNumericArray(
  features: Feature<LineString>[],
  key: string,
): boolean {
  return features.some((f) => {
    const arr = readNumericArray(f, key, f.geometry.coordinates.length);

    return arr !== null && arr.some((v) => Number.isFinite(v));
  });
}

/**
 * Reads per-point timestamps as epoch millis. togeojson puts GPX/KML times under
 * `coordinateProperties.times`; live tracking writes a top-level `coordTimes`.
 * Returns null unless an array of the expected length is present; bad entries
 * become NaN.
 */
export function readCoordTimes(
  feature: Feature<LineString>,
  expectedLength: number,
): number[] | null {
  const cp = feature.properties?.['coordinateProperties'] as
    | Record<string, unknown>
    | undefined;

  const raw = cp?.['times'] ?? feature.properties?.['coordTimes'];

  if (!Array.isArray(raw) || raw.length !== expectedLength) {
    return null;
  }

  return raw.map((t) => (typeof t === 'string' ? new Date(t).getTime() : NaN));
}
