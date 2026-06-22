import type { LatLon } from '@shared/types/common.js';
import { booleanContains } from '@turf/boolean-contains';
import type {
  Feature,
  GeoJsonProperties,
  Geometry,
  LineString,
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
 * True only when every coordinate of a `LineString` carries elevation. Any gap
 * (an all-2D OSRM track, or a GraphHopper route with no-data points) yields
 * `false` so the consumer fills elevation from the server rather than rendering
 * a profile with holes.
 */
export function containsElevations(geojson: Feature): boolean {
  return (
    geojson.geometry.type === 'LineString' &&
    geojson.geometry.coordinates.length > 0 &&
    geojson.geometry.coordinates.every((c) => c.length === 3)
  );
}

/**
 * Elevation coverage across the coordinates of the given `LineString` features:
 * `'none'` when no point carries elevation, `'full'` when every point does,
 * `'partial'` otherwise (and when there are no coordinates at all → `'none'`).
 */
export function elevationCoverage(
  features: Feature<LineString>[],
): 'none' | 'partial' | 'full' {
  let withEle = 0;

  let total = 0;

  for (const feature of features) {
    for (const coord of feature.geometry.coordinates) {
      total++;

      if (coord.length >= 3 && Number.isFinite(coord[2])) {
        withEle++;
      }
    }
  }

  if (withEle === 0) {
    return 'none';
  }

  return withEle === total ? 'full' : 'partial';
}

// TODO consider distance between points
// returns array of [lat, lon, smoothedEle] triplets
export function smoothElevations(
  coords: number[][],
  eleSmoothingFactor: number,
): number[][] {
  const half = Math.floor(eleSmoothingFactor / 2);

  let prevEle = 0;

  return coords.map((lonLatEle, i) => {
    // Centered window, clamped at the ends. A forward-only window would
    // phase-shift the profile and collapse at the end, flattening the last
    // points to a carried-forward value (zeroing the final grade).
    const window = coords
      .slice(Math.max(0, i - half), i + half + 1)
      .map((c) => c[2])
      .filter((e): e is number => typeof e === 'number' && Number.isFinite(e))
      // Sorted by elevation so the extreme-removal below drops the actual
      // highest and lowest samples.
      .sort((a, b) => a - b);

    // Drop the highest and lowest sample to reject spikes, but only when the
    // window is large enough to keep a meaningful average.
    const trimmed = window.length >= 5 ? window.slice(1, -1) : window;

    let ele = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;

    if (!Number.isFinite(ele)) {
      ele = prevEle;
    }

    prevEle = ele;

    return [lonLatEle[0]!, lonLatEle[1]!, ele];
  });
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
      Object.assign(g, { type: 'Polygon', coordinates: [g.coordinates] });
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
