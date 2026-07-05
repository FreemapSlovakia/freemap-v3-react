import type { LatLon } from '@shared/types/common.js';
import { booleanContains } from '@turf/boolean-contains';
import { distance } from '@turf/distance';
import type {
  Feature,
  GeoJsonProperties,
  Geometry,
  LineString,
  MultiLineString,
  Position,
} from 'geojson';
import type { LatLngLiteral } from 'leaflet';

export type GpsCoordStyle = 'DMS' | 'DM' | 'D';

export function formatGpsCoord(
  angle: number,
  cardinals: string,
  style: GpsCoordStyle = 'DMS',
  language: string,
): string {
  let cardinal = '';

  let a = angle;

  if (cardinals) {
    cardinal = `${cardinals[angle < 0 ? 0 : 1]} `;

    a = Math.abs(angle);
  }

  switch (style) {
    case 'DMS': {
      const degrees = Math.floor(a);

      const minutes = Math.floor((a - degrees) * 60);

      const seconds = new Intl.NumberFormat(language, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format((a - degrees - minutes / 60) * 3600);

      return `${cardinal}${degrees}°\xa0${minutes}'\xa0${seconds}"`;
    }

    case 'DM': {
      const degrees = Math.floor(a);

      const minutes = new Intl.NumberFormat(language, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format((a - degrees) * 60);

      return `${cardinal}${degrees}°\xa0${minutes}'`;
    }

    case 'D': {
      return `${cardinal}${Intl.NumberFormat(language, {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(a)}°`;
    }

    default: {
      throw new Error('unknown GPS coords style');
    }
  }
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getCurrentPosition(): Promise<LatLon> {
  return new Promise((resolve, reject) => {
    const onSuccess = (pos: GeolocationPosition) => {
      resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    };

    const onError = (error: GeolocationPositionError) => {
      reject(error);
    };

    window.navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

/**
 * The coordinate segments of a line-like geometry as a uniform list: a single
 * segment for a `LineString`, one per part for a multi-segment recording
 * (`MultiLineString`). Lets callers treat both alike.
 */
export function lineSegments(
  geometry: LineString | MultiLineString,
): Position[][] {
  return geometry.type === 'LineString'
    ? [geometry.coordinates]
    : geometry.coordinates;
}

/**
 * A track's recorded per-point times as raw per-segment arrays (each entry is
 * usually an ISO string). togeojson stores them under
 * `coordinateProperties.times` — a flat array for a single `LineString`, nested
 * per segment for a `MultiLineString`; live tracking writes a flat top-level
 * `coordTimes`. A flat source is returned as one segment; empty when there are
 * none. Callers interpret each value (epoch vs `Date`) themselves.
 */
export function trackTimeSegments(feature: Feature): unknown[][] {
  const cp = feature.properties?.['coordinateProperties'] as
    | { times?: unknown }
    | undefined;

  const raw = cp?.times ?? feature.properties?.['coordTimes'];

  if (!Array.isArray(raw)) {
    return [];
  }

  return Array.isArray(raw[0])
    ? raw.map((segment) => (Array.isArray(segment) ? segment : []))
    : [raw];
}

/**
 * True only when every coordinate of a line-like geometry (`LineString` or
 * multi-segment `MultiLineString`) carries elevation. Any gap (an all-2D OSRM
 * track, or a GraphHopper route with no-data points) yields `false` so the
 * consumer fills elevation from the server rather than rendering a profile with
 * holes.
 */
export function containsElevations(geojson: Feature): boolean {
  if (
    geojson.geometry.type !== 'LineString' &&
    geojson.geometry.type !== 'MultiLineString'
  ) {
    return false;
  }

  const segments = lineSegments(geojson.geometry);

  return (
    segments.some((segment) => segment.length > 0) &&
    segments.every((segment) => segment.every((c) => c.length === 3))
  );
}

/**
 * Elevation coverage across the coordinates of the given line-like features
 * (`LineString` or multi-segment `MultiLineString`): `'none'` when no point
 * carries elevation, `'full'` when every point does, `'partial'` otherwise (and
 * when there are no coordinates at all → `'none'`).
 */
export function elevationCoverage(
  features: Feature<LineString | MultiLineString>[],
): 'none' | 'partial' | 'full' {
  let withEle = 0;

  let total = 0;

  for (const feature of features) {
    for (const segment of lineSegments(feature.geometry)) {
      for (const coord of segment) {
        total++;

        if (coord.length >= 3 && Number.isFinite(coord[2])) {
          withEle++;
        }
      }
    }
  }

  if (withEle === 0) {
    return 'none';
  }

  return withEle === total ? 'full' : 'partial';
}

/**
 * Horizontal span (in metres) over which elevation is low-pass filtered, and
 * the baseline over which slope is measured. SRTM is ~30 m, so relief finer
 * than this is DEM noise rather than real terrain; smoothing toward it also
 * stops dense router shape points (metres apart at a bend) from being denoised
 * differently than sparse ones on a straight.
 */
export const DEM_RESOLUTION_METERS = 30;

/**
 * Ground distance (metres) covered by one screen pixel at a Web-Mercator zoom
 * and latitude, assuming 256 px tiles. Lets a smoothing window be expressed in
 * pixels and converted to the metric span the colorizers work in.
 */
export function metersPerPixel(zoom: number, lat: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

/**
 * Cumulative horizontal distance (metres) along the path, so any windowing can
 * span a fixed metric length regardless of how densely the vertices are spaced.
 * `cum[0]` is `0`; `cum[i]` is the distance from the first vertex to vertex `i`.
 */
export function cumulativeDistances(coords: number[][]): number[] {
  const cum: number[] = [0];

  for (let i = 1; i < coords.length; i++) {
    cum[i] =
      cum[i - 1]! +
      distance(coords[i - 1]!, coords[i]!, {
        units: 'meters',
      });
  }

  return cum;
}

/**
 * Inclusive `[lo, hi]` index range of the vertices within `±spanMeters / 2` of
 * vertex `i` along the path, given precomputed cumulative distances `cum`. The
 * window is centered and clamped (it shrinks at the ends rather than shifting),
 * so a derived value never phase-shifts or collapses to a forward-only span.
 */
export function metricWindow(
  cum: number[],
  i: number,
  spanMeters: number,
): [number, number] {
  const half = spanMeters / 2;

  let lo = i;

  while (lo > 0 && cum[i]! - cum[lo - 1]! <= half) {
    lo--;
  }

  let hi = i;

  while (hi < cum.length - 1 && cum[hi + 1]! - cum[i]! <= half) {
    hi++;
  }

  return [lo, hi];
}

/**
 * Low-pass a per-point numeric series by averaging over a centered metric
 * window (`cum` are the cumulative distances of the series' path). Non-finite
 * samples are ignored; the highest and lowest sample in a window of ≥5 are
 * dropped to reject spikes. A window with no finite sample yet seen carries the
 * last computed value forward (NaN until the first finite window), so a leading
 * hole stays NaN rather than injecting a fake value into callers' value range;
 * callers decide gaps from the original samples.
 *
 * The window is advanced with two pointers: it is centered on a monotonically
 * increasing `cum`, so both bounds only move forward and each vertex enters and
 * leaves once. A running sum/count yields the mean, and monotonic index deques
 * track the window's current min and max so the spike-trim drops one of each
 * without re-sorting — O(n) overall instead of O(n·window·log window).
 */
export function smoothValues(
  values: number[],
  cum: number[],
  spanMeters: number,
): number[] {
  const n = values.length;

  const out = new Array<number>(n);

  const half = spanMeters / 2;

  let lo = 0;

  let hi = -1;

  let sum = 0;

  let count = 0;

  // Index deques over finite samples only: maxDq values non-increasing, minDq
  // non-decreasing, so each front is the window's current max/min. `head`
  // cursors pop the front without an O(window) Array.shift.
  const maxDq: number[] = [];

  let maxHead = 0;

  const minDq: number[] = [];

  let minHead = 0;

  let prev = NaN;

  for (let i = 0; i < n; i++) {
    const left = cum[i]! - half;

    const right = cum[i]! + half;

    // Pull the right edge in to cover every vertex within +half of point i.
    while (hi + 1 < n && cum[hi + 1]! <= right) {
      hi++;

      const v = values[hi]!;

      if (Number.isFinite(v)) {
        sum += v;

        count++;

        while (maxDq.length > maxHead && values[maxDq.at(-1)!]! <= v) {
          maxDq.pop();
        }

        maxDq.push(hi);

        while (minDq.length > minHead && values[minDq.at(-1)!]! >= v) {
          minDq.pop();
        }

        minDq.push(hi);
      }
    }

    // Drop the left edge for vertices now beyond -half of point i.
    while (lo < n && cum[lo]! < left) {
      const v = values[lo]!;

      if (Number.isFinite(v)) {
        sum -= v;

        count--;

        if (maxDq.length > maxHead && maxDq[maxHead] === lo) {
          maxHead++;
        }

        if (minDq.length > minHead && minDq[minHead] === lo) {
          minHead++;
        }
      }

      lo++;
    }

    let v: number;

    if (count === 0) {
      v = prev;
    } else if (count >= 5) {
      // Drop the single highest and lowest sample to reject spikes.
      v =
        (sum - values[maxDq[maxHead]!]! - values[minDq[minHead]!]!) /
        (count - 2);
    } else {
      v = sum / count;
    }

    if (!Number.isFinite(v)) {
      v = prev;
    }

    prev = v;

    out[i] = v;
  }

  return out;
}

/**
 * Smooth a per-point series sampled along `coords` with {@link smoothValues}.
 * `spanMeters <= 0` returns `values` unchanged (no smoothing), so a colorizer
 * with no zoom passed keeps its raw samples.
 */
export function smoothSeries(
  coords: number[][],
  values: number[],
  spanMeters: number,
): number[] {
  return spanMeters > 0
    ? smoothValues(values, cumulativeDistances(coords), spanMeters)
    : values;
}

/**
 * Circular low-pass of a per-point angle series (degrees) over a centered
 * metric window: angles are averaged as unit vectors so values that wrap (e.g.
 * 350° and 10° → 0°) combine correctly instead of through their meaningless
 * numeric mean. `spanMeters <= 0` returns the input unchanged; a window whose
 * vectors fully cancel keeps the point's own angle.
 */
export function smoothAngles(
  anglesDeg: number[],
  cum: number[],
  spanMeters: number,
): number[] {
  if (spanMeters <= 0) {
    return anglesDeg;
  }

  return anglesDeg.map((angle, i) => {
    const [lo, hi] = metricWindow(cum, i, spanMeters);

    let x = 0;

    let y = 0;

    for (let j = lo; j <= hi; j++) {
      const a = anglesDeg[j]!;

      if (Number.isFinite(a)) {
        const r = (a * Math.PI) / 180;

        x += Math.cos(r);

        y += Math.sin(r);
      }
    }

    return x === 0 && y === 0 ? angle : (Math.atan2(y, x) * 180) / Math.PI;
  });
}

// returns array of [lon, lat, smoothedEle] triplets
export function smoothElevations(
  coords: number[][],
  spanMeters: number = DEM_RESOLUTION_METERS,
): number[][] {
  const eles = coords.map((c) =>
    typeof c[2] === 'number' && Number.isFinite(c[2]) ? c[2] : NaN,
  );

  const smoothed = smoothValues(eles, cumulativeDistances(coords), spanMeters);

  return coords.map((c, i) => [c[0]!, c[1]!, smoothed[i]!]);
}

export function toLatLng({ lat, lon }: LatLon): LatLngLiteral {
  return { lat, lng: lon };
}

export function toLatLngArr(arr: LatLon[]): LatLngLiteral[] {
  return arr.map(toLatLng);
}

export function latLonToString(
  latLon: LatLon,
  language: string,
  style: GpsCoordStyle = 'DMS',
): string {
  return `${formatGpsCoord(
    latLon.lat,
    'SN',
    style,
    language,
  )}, ${formatGpsCoord(latLon.lon, 'WE', style, language)}`;
}

export function positionsEqual(pt1?: Position, pt2?: Position): boolean {
  if (!pt1 || !pt2) {
    throw new Error();
  }

  return pt1[0] === pt2?.[0] && pt1[1] === pt2[1];
}

export function mergeLines<T extends Geometry>(
  features: Feature<T>[],
  properties: GeoJsonProperties = {},
): void {
  restart: for (;;) {
    for (let i = 0; i < features.length - 1; i++) {
      const f1 = features[i]!;

      const g1 = f1.geometry;

      if (g1.type !== 'LineString') {
        continue;
      }

      for (let j = i + 1; j < features.length; j++) {
        const f2 = features[j]!;

        const g2 = f2.geometry;

        if (g2.type !== 'LineString') {
          continue;
        }

        if (positionsEqual(g1.coordinates[0], g2.coordinates[0])) {
          g1.coordinates.unshift(...g2.coordinates.slice(1).reverse());

          features.splice(j, 1);

          f1.properties = properties;

          // f1.properties = Object.assign({}, f1.properties, f2.properties);
          continue restart;
        }

        if (positionsEqual(g1.coordinates[0], g2.coordinates.at(-1))) {
          g1.coordinates.splice(0, 1, ...g2.coordinates);

          features.splice(j, 1);

          f1.properties = properties;

          // f1.properties = Object.assign({}, f1.properties, f2.properties);
          continue restart;
        }

        if (positionsEqual(g1.coordinates.at(-1), g2.coordinates[0])) {
          g1.coordinates.push(...g2.coordinates.slice(1));

          features.splice(j, 1);

          f1.properties = properties;

          // f1.properties = Object.assign({}, f1.properties, f2.properties);
          continue restart;
        }

        if (positionsEqual(g1.coordinates.at(-1), g2.coordinates.at(-1))) {
          g1.coordinates.push(...g2.coordinates.reverse().slice(1));

          features.splice(j, 1);

          f1.properties = properties;

          // f1.properties = Object.assign({}, f1.properties, f2.properties);
          continue restart;
        }
      }
    }

    break;
  }

  for (const f of features) {
    const g = f.geometry;

    if (
      g.type === 'LineString' &&
      positionsEqual(g.coordinates[0], g.coordinates.at(-1))
    ) {
      // Build a fresh geometry rather than mutating `g` in place: the geometry
      // can be a frozen object carried over from the source feature, and
      // redefining its `type` throws on strict engines (Firefox).
      f.geometry = { type: 'Polygon', coordinates: [g.coordinates] } as T;
    }
  }

  restart: for (;;) {
    for (let i = 0; i < features.length; i++) {
      const f1 = features[i]!;

      const g1 = f1.geometry;

      if (g1.type !== 'Polygon') {
        continue;
      }

      for (let j = 0; j < features.length; j++) {
        if (i === j) {
          continue;
        }

        const f2 = features[j]!;

        const g2 = f2.geometry;

        if (g2.type === 'Polygon' && booleanContains(g1, g2)) {
          g1.coordinates.push(...g2.coordinates);

          f1.properties = properties;

          features.splice(j, 1);

          continue restart;
        }
      }
    }

    break;
  }
}

export function shouldBeArea(tags?: GeoJsonProperties): boolean {
  return (
    // taken from https://wiki.openstreetmap.org/wiki/Key:area
    tags !== null &&
    tags !== undefined &&
    tags['area'] !== 'no' &&
    !tags['barrier'] &&
    !tags['highway']
  );
}
