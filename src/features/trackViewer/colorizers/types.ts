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
}

export interface Colorizer {
  palette: HotlinePalette;
  isAvailable?: (features: Feature<LineString>[]) => boolean;
  compute: (features: Feature<LineString>[]) => ColorizedPoint[][];
}

/**
 * Build positions by normalizing per-coord values to 0..1 via min/max
 * across each feature. NaN inputs collapse to mid-palette (0.5), which is
 * also the fallback when the value range is degenerate. Keeping the
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

      const color = range > 0 && Number.isFinite(v) ? (v - min) / range : 0.5;

      return { lat: coord[1], lon: coord[0], color };
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
