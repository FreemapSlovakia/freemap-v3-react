import {
  PATH_DETAILS_PROP,
  readPathDetailsParts,
  remapPathDetails,
} from '@shared/colorizers/colorize.js';
import {
  cumulativeDistances,
  lineSegments,
  positionsEqual,
} from '@shared/geoutils.js';
import type { Feature, Geometry, Position } from 'geojson';
import { reversedRows, reversePathDetails } from './joinTracks.js';
import { readChannels, writeChannels } from './trackChannels.js';
import { isTrackLine } from './trackSelection.js';

/**
 * The parts of a geometry whose vertices can be edited one by one, each as a
 * list of positions: the point itself, a line, each segment of a multi-segment
 * track, each ring of a polygon. A ring is listed **open** — its closing
 * position is implied — and written back closed.
 *
 * Collections and multi-polygons are not edited vertex by vertex.
 */
export function editableParts(geometry: Geometry): Position[][] | undefined {
  switch (geometry.type) {
    case 'Point':
      return [[geometry.coordinates]];

    case 'LineString':
      return [geometry.coordinates];

    case 'MultiLineString':
      return geometry.coordinates;

    case 'Polygon':
      return geometry.coordinates.map(openRing);

    default:
      return undefined;
  }
}

// Per ring, so an unchanged ring keeps its identity and its handles don't redo
// their work when another ring of the polygon is edited.
const openRings = new WeakMap<Position[], Position[]>();

function openRing(ring: Position[]): Position[] {
  let open = openRings.get(ring);

  if (!open) {
    // Two positions are a ring of one vertex still being drawn.
    open =
      ring.length > 1 && positionsEqual(ring[0], ring.at(-1))
        ? ring.slice(0, -1)
        : ring;

    openRings.set(ring, open);
  }

  return open;
}

function closeRing(ring: Position[]): Position[] {
  return ring.length === 0 ? ring : [...ring, ring[0]!];
}

/**
 * The geometry with one part replaced, a ring closed again. A part index past
 * the last adds a new one (a hole being cut, a segment being started).
 */
function withPart(
  geometry: Geometry,
  part: number,
  positions: Position[],
): Geometry {
  switch (geometry.type) {
    case 'Point':
      return positions[0]
        ? { ...geometry, coordinates: positions[0] }
        : geometry;

    case 'LineString':
      return { ...geometry, coordinates: positions };

    case 'MultiLineString':
      return {
        ...geometry,
        coordinates: geometry.coordinates.toSpliced(part, 1, positions),
      };

    case 'Polygon':
      return {
        ...geometry,
        coordinates: geometry.coordinates.toSpliced(
          part,
          1,
          closeRing(positions),
        ),
      };

    default:
      return geometry;
  }
}

/** Metres along a part at each of its vertices; a gap where none is known. */
function interpolatedSourceDistances(
  before: number[],
  source: (number | null)[],
): number[] {
  return source.map((j, k) => {
    if (j !== null) {
      return before[j]!;
    }

    // Between the vertices either side, so the spans stretch over the new one.
    const prev = source.slice(0, k).findLast((s) => s !== null);

    const next = source.slice(k + 1).find((s) => s !== null);

    const a = prev == null ? undefined : before[prev];

    const b = next == null ? undefined : before[next];

    return a !== undefined && b !== undefined ? (a + b) / 2 : (a ?? b ?? 0);
  });
}

/**
 * Replaces one part's vertices; `source` names the old vertex each new one
 * stands for (`null` for a new one). Channels follow their vertex, and path
 * details are re-measured along the part.
 */
function editPart(
  feature: Feature,
  part: number,
  positions: Position[],
  source: (number | null)[],
): Feature {
  const geometry = withPart(feature.geometry, part, positions);

  if (!isTrackLine(feature)) {
    return { ...feature, geometry };
  }

  const oldParts = editableParts(feature.geometry) ?? [];

  const properties = { ...feature.properties };

  const channels = readChannels(feature);

  writeChannels(properties, channels, geometry.type === 'LineString', (ch) =>
    ch.segments.toSpliced(
      part,
      1,
      source.map((j) => (j === null ? null : (ch.segments[part]?.[j] ?? null))),
    ),
  );

  const details = readPathDetailsParts(feature);

  const old = oldParts[part];

  if (details?.[part] && old) {
    const before = cumulativeDistances(old);

    properties[PATH_DETAILS_PROP] = details.toSpliced(
      part,
      1,
      remapPathDetails(
        details[part]!,
        interpolatedSourceDistances(before, source),
        cumulativeDistances(positions),
      ),
    );
  }

  return { ...feature, geometry, properties };
}

function partOf(feature: Feature, part: number): Position[] | undefined {
  return editableParts(feature.geometry)?.[part];
}

const identity = (length: number) => Array.from({ length }, (_, i) => i);

/** One vertex moved; elevation and channels stay with it. */
export function moveVertex(
  feature: Feature,
  part: number,
  index: number,
  [lon, lat]: Position,
): Feature {
  const positions = partOf(feature, part);

  const old = positions?.[index];

  if (!positions || !old) {
    return feature;
  }

  return editPart(
    feature,
    part,
    positions.with(index, [lon!, lat!, ...old.slice(2)]),
    identity(positions.length),
  );
}

/**
 * One vertex given a new position (elevation included, or left off) and new
 * values for the channels `values` names; every other channel keeps its own.
 * A channel the line lacks is not created here — see `withChannelKeys`.
 */
export function setVertexValues(
  feature: Feature,
  part: number,
  index: number,
  position: Position,
  values: Readonly<Record<string, unknown>>,
): Feature {
  const positions = partOf(feature, part);

  if (!positions?.[index]) {
    return feature;
  }

  const moved = editPart(
    feature,
    part,
    positions.with(index, position),
    identity(positions.length),
  );

  if (!isTrackLine(moved)) {
    return moved;
  }

  const channels = readChannels(moved).filter((channel) =>
    Object.hasOwn(values, channel.key),
  );

  if (channels.length === 0) {
    return moved;
  }

  const properties = { ...moved.properties };

  writeChannels(
    properties,
    channels,
    moved.geometry.type === 'LineString',
    ({ key, segments }) =>
      segments.with(part, segments[part]!.with(index, values[key])),
  );

  return { ...moved, properties };
}

/** A new vertex at `index`, carrying no recorded data of its own. */
export function insertVertex(
  feature: Feature,
  part: number,
  index: number,
  position: Position,
): Feature {
  const positions = partOf(feature, part) ?? [];

  const source: (number | null)[] = identity(positions.length);

  return editPart(
    feature,
    part,
    positions.toSpliced(index, 0, position),
    source.toSpliced(index, 0, null),
  );
}

export function deleteVertex(
  feature: Feature,
  part: number,
  index: number,
): Feature {
  const positions = partOf(feature, part);

  if (!positions?.[index]) {
    return feature;
  }

  return editPart(
    feature,
    part,
    positions.toSpliced(index, 1),
    identity(positions.length).toSpliced(index, 1),
  );
}

/** A ring dropped from a polygon, or a segment from a multi-segment line. */
export function deletePart(feature: Feature, part: number): Feature {
  const { geometry } = feature;

  if (geometry.type === 'Polygon' && part > 0) {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: geometry.coordinates.toSpliced(part, 1),
      },
    };
  }

  return feature;
}

/** The line turned round, its segments and everything riding on them with it. */
export function reverseFeature(feature: Feature): Feature {
  const { geometry } = feature;

  if (geometry.type === 'Polygon') {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: geometry.coordinates.map((ring) => ring.toReversed()),
      },
    };
  }

  if (!isTrackLine(feature)) {
    return feature;
  }

  const segments = lineSegments(feature.geometry);

  const reversed = reversedRows(segments);

  const properties = { ...feature.properties };

  writeChannels(
    properties,
    readChannels(feature),
    feature.geometry.type === 'LineString',
    (ch) => reversedRows(ch.segments),
  );

  const details = readPathDetailsParts(feature);

  if (details) {
    properties[PATH_DETAILS_PROP] = details
      .map((d, i) =>
        reversePathDetails(
          d,
          cumulativeDistances(segments[i] ?? []).at(-1) ?? 0,
        ),
      )
      .toReversed();
  }

  return {
    ...feature,
    geometry:
      feature.geometry.type === 'LineString'
        ? { type: 'LineString', coordinates: reversed[0] ?? [] }
        : { type: 'MultiLineString', coordinates: reversed },
    properties,
  };
}

/**
 * Whether the feature has enough vertices to be what it is — a line two, a ring
 * three. Anything less exists only while being drawn and never leaves the store.
 */
export function isCompleteFeature(feature: Feature): boolean {
  const { geometry } = feature;

  switch (geometry.type) {
    case 'LineString':
      return geometry.coordinates.length > 1;

    case 'MultiLineString':
      return geometry.coordinates.some((s) => s.length > 1);

    case 'Polygon':
      return (geometry.coordinates[0]?.length ?? 0) > 3;

    default:
      return true;
  }
}

/**
 * The feature without its incomplete parts: a hole or a segment still short of
 * one. `undefined` when what is left is no feature at all.
 */
export function completed(feature: Feature): Feature | undefined {
  const { geometry } = feature;

  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates.filter((ring, i) =>
      i === 0 ? true : ring.length > 3,
    );

    return (rings[0]?.length ?? 0) > 3
      ? rings.length === geometry.coordinates.length
        ? feature
        : { ...feature, geometry: { ...geometry, coordinates: rings } }
      : undefined;
  }

  return isCompleteFeature(feature) ? feature : undefined;
}
