import type { Feature, Geometry, Position } from 'geojson';

/**
 * Metres a degree of latitude is worth. A degree of longitude is worth this
 * times the cosine of the latitude, which is what makes a tolerance in metres
 * mean the same thing whichever way a line wanders.
 */
const METERS_PER_DEGREE = 111320;

/** A ring needs three distinct corners plus the point that closes it. */
const RING_MIN = 4;

/** The middle of the latitudes these lines span, which stands for all of them. */
export function midLatitude(lines: Position[][]): number {
  let min = Number.POSITIVE_INFINITY;

  let max = Number.NEGATIVE_INFINITY;

  for (const line of lines) {
    for (const position of line) {
      const lat = position[1]!;

      if (lat < min) {
        min = lat;
      }

      if (lat > max) {
        max = lat;
      }
    }
  }

  return Number.isFinite(min) ? (min + max) / 2 : 0;
}

function sqSegDist(p: Position, a: Position, b: Position): number {
  let x = a[0]!;

  let y = a[1]!;

  let dx = b[0]! - x;

  let dy = b[1]! - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((p[0]! - x) * dx + (p[1]! - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = b[0]!;

      y = b[1]!;
    } else if (t > 0) {
      x += dx * t;

      y += dy * t;
    }
  }

  dx = p[0]! - x;

  dy = p[1]! - y;

  return dx * dx + dy * dy;
}

/**
 * Douglas–Peucker, reporting which vertices survive rather than the geometry:
 * per-point channels have to be thinned along the very same indices.
 *
 * `meters` is how far a vertex may sit from the line drawn without it. Pass
 * `lat` to measure several lines against one reference latitude; on its own
 * each line uses the middle of its own span.
 */
export function simplifyIndices(
  points: Position[],
  meters: number,
  lat = midLatitude([points]),
): number[] {
  if (points.length < 3 || meters <= 0) {
    return points.map((_, i) => i);
  }

  // Longitude squeezed to latitude's scale, so the distance below is isotropic
  // and the tolerance can be plain degrees of latitude.
  const scale = Math.cos((lat * Math.PI) / 180);

  const scaled = points.map((p): Position => [p[0]! * scale, p[1]!]);

  const tolerance = meters / METERS_PER_DEGREE;

  const sqTolerance = tolerance * tolerance;

  const keep = new Uint8Array(points.length);

  keep[0] = 1;

  keep[points.length - 1] = 1;

  const stack: [number, number][] = [[0, points.length - 1]];

  for (let range = stack.pop(); range; range = stack.pop()) {
    const [first, last] = range;

    let furthest = sqTolerance;

    let index = -1;

    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(scaled[i]!, scaled[first]!, scaled[last]!);

      if (d > furthest) {
        index = i;

        furthest = d;
      }
    }

    if (index !== -1) {
      keep[index] = 1;

      stack.push([first, index], [index, last]);
    }
  }

  const indices: number[] = [];

  for (let i = 0; i < points.length; i++) {
    if (keep[i]) {
      indices.push(i);
    }
  }

  return indices;
}

/** {@link simplifyIndices} applied, keeping the surviving points as they are. */
export function simplifyPositions(
  points: Position[],
  meters: number,
  lat?: number,
): Position[] {
  const indices = simplifyIndices(points, meters, lat);

  return indices.length === points.length
    ? points
    : indices.map((i) => points[i]!);
}

/**
 * A ring thinned as a ring: the tolerance is eased until what is left can still
 * be a polygon, rather than letting it collapse into a line.
 */
export function simplifyRing(
  ring: Position[],
  meters: number,
  lat?: number,
): Position[] {
  if (ring.length <= RING_MIN) {
    return ring;
  }

  for (let tolerance = meters; tolerance > 1e-6; tolerance /= 2) {
    const kept = simplifyPositions(ring, tolerance, lat);

    if (kept.length >= RING_MIN) {
      return kept;
    }
  }

  return ring;
}

/** The geometry thinned; anything without a line in it comes back untouched. */
export function simplifyGeometry<G extends Geometry>(
  geometry: G,
  meters: number,
): G {
  if (meters <= 0) {
    return geometry;
  }

  switch (geometry.type) {
    case 'LineString':
      return {
        ...geometry,
        coordinates: simplifyPositions(geometry.coordinates, meters),
      };

    case 'MultiLineString': {
      const lat = midLatitude(geometry.coordinates);

      return {
        ...geometry,
        coordinates: geometry.coordinates.map((line) =>
          simplifyPositions(line, meters, lat),
        ),
      };
    }

    case 'Polygon': {
      const lat = midLatitude(geometry.coordinates);

      return {
        ...geometry,
        coordinates: geometry.coordinates.map((ring) =>
          simplifyRing(ring, meters, lat),
        ),
      };
    }

    case 'MultiPolygon': {
      const lat = midLatitude(geometry.coordinates.flat());

      return {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon) =>
          polygon.map((ring) => simplifyRing(ring, meters, lat)),
        ),
      };
    }

    default:
      return geometry;
  }
}

export function simplifyFeature<F extends Feature>(
  feature: F,
  meters: number,
): F {
  return feature.geometry
    ? { ...feature, geometry: simplifyGeometry(feature.geometry, meters) }
    : feature;
}
