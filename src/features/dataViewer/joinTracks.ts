import {
  PATH_DETAILS_PROP,
  type PathDetails,
  remapPathDetails,
} from '@shared/colorizers/colorize.js';
import {
  cumulativeDistances,
  distanceTo,
  firstTrackTime,
  lineSegments,
  positionsEqual,
  segmentDistances,
  withoutPerPointData,
} from '@shared/geoutils.js';
import type { Feature, LineString, MultiLineString, Position } from 'geojson';
import { type Channel, readChannels, writeChannels } from './trackChannels.js';
import { isTrackLine, type TrackLine } from './trackSelection.js';

/** How two tracks are put together: end to end, or a segment each. */
export type TrackJoinMode = 'line' | 'segments';

/** Whether these two of the loaded features are a pair a join can take. */
export function canJoinTracks(
  features: Feature[],
  target: number,
  other: number,
): boolean {
  const a = features[target];

  const b = features[other];

  return (
    target !== other &&
    a !== undefined &&
    b !== undefined &&
    isTrackLine(a) &&
    isTrackLine(b)
  );
}

/** One side of a join, read once so it can be turned round and measured. */
interface Side {
  segments: Position[][];
  channels: Channel[];
  details: PathDetails | undefined;
  properties: Record<string, unknown>;
  /** Distance to each vertex, segment gaps excluded; empty unless measured. */
  distances: number[];
  /** Set only where the track was recorded with times, which fix its direction. */
  startTime: number | undefined;
}

/** One segment of one side, whole, in the order it is laid down. */
interface Run {
  side: 0 | 1;
  segment: number;
}

const pathDetailsOf = (feature: TrackLine) =>
  feature.properties?.[PATH_DETAILS_PROP] as PathDetails | undefined;

/** The first recorded time, which is what orders two timed tracks. */
function startTimeOf(feature: TrackLine): number | undefined {
  const first = firstTrackTime(feature);

  const time = first === undefined ? Number.NaN : new Date(first).getTime();

  return Number.isNaN(time) ? undefined : time;
}

/** `measure` walks the whole track, so only the path-detail spans ask for it. */
function readSide(feature: TrackLine, measure: boolean): Side {
  const segments = lineSegments(feature.geometry);

  return {
    segments,
    channels: readChannels(feature),
    details: pathDetailsOf(feature),
    properties: feature.properties ?? {},
    distances: measure ? segmentDistances(segments).flat() : [],
    startTime: startTimeOf(feature),
  };
}

/** Total length, the gaps between segments excluded. */
const sideLength = (side: Side) => side.distances.at(-1) ?? 0;

/** The side without its first vertex, channels alongside — a shared seam. */
function dropLeadingPoint(side: Side): Side {
  const at = side.segments.findIndex((segment) => segment.length > 0);

  const trimmed = <T>(rows: T[][]) =>
    rows.map((row, i) => (i === at ? row.slice(1) : row));

  return at < 0
    ? side
    : {
        ...side,
        segments: trimmed(side.segments),
        channels: side.channels.map((channel) => ({
          ...channel,
          segments: trimmed(channel.segments),
        })),
      };
}

const reversedRows = <T>(rows: T[][]): T[][] =>
  rows.map((row) => [...row].reverse()).reverse();

/** Spans measured from the other end, so they still cover the same stretches. */
function reversePathDetails(details: PathDetails, length: number): PathDetails {
  return Object.fromEntries(
    Object.entries(details).map(([key, spans]) => [
      key,
      spans
        .map(({ start, end, value }) => ({
          start: length - end,
          end: length - start,
          value,
        }))
        .reverse(),
    ]),
  );
}

function reverseSide(side: Side): Side {
  const length = sideLength(side);

  return {
    ...side,
    segments: reversedRows(side.segments),
    channels: side.channels.map((channel) => ({
      ...channel,
      segments: reversedRows(channel.segments),
    })),
    // The axis runs the other way now, so each vertex sits as far from the new
    // start as it did from the old finish.
    distances: side.distances.map((d) => length - d).reverse(),
    details: side.details && reversePathDetails(side.details, length),
  };
}

function head(side: Side): Position | undefined {
  return side.segments.find((segment) => segment.length > 0)?.[0];
}

function tail(side: Side): Position | undefined {
  return side.segments.findLast((segment) => segment.length > 0)?.at(-1);
}

/** Metres between two endpoints, which is the gap a join would close. */
function gap(from: Position | undefined, to: Position | undefined): number {
  return from && to
    ? distanceTo({ lat: from[1]!, lon: from[0]! }, { lat: to[1]!, lon: to[0]! })
    : 0;
}

/**
 * Which track comes first and which is turned round. Recorded times decide it
 * where both have them; otherwise the pairing whose endpoints are nearest wins.
 * A track with times is never reversed — its times would then run backwards.
 */
function orient(a: Side, b: Side, mode: TrackJoinMode): [Side, Side] {
  if (a.startTime !== undefined && b.startTime !== undefined) {
    return b.startTime < a.startTime ? [b, a] : [a, b];
  }

  // Turning a track round only ever closes the seam of a `line` join; kept as
  // segments the two stay apart, so its points would come back reversed for a
  // gap that isn't there.
  const flips = (side: Side) =>
    mode === 'line' && side.startTime === undefined ? [false, true] : [false];

  const candidates = (
    [
      [a, b],
      [b, a],
    ] as const
  ).flatMap(([first, second], order) =>
    flips(first).flatMap((flipFirst) =>
      flips(second).map((flipSecond) => ({
        first,
        flipFirst,
        second,
        flipSecond,
        order,
        turns: Number(flipFirst) + Number(flipSecond),
        // Millimetres, so equal gaps compare equal rather than by float noise.
        gap: Math.round(
          gap(
            flipFirst ? head(first) : tail(first),
            flipSecond ? tail(second) : head(second),
          ) * 1000,
        ),
      })),
    ),
  );

  // Ties go to the arrangement that turns and reorders the least, so joining
  // two tracks that already meet leaves them as they were drawn.
  candidates.sort(
    (x, y) => x.gap - y.gap || x.turns - y.turns || x.order - y.order,
  );

  const { first, flipFirst, second, flipSecond } = candidates[0]!;

  return [
    flipFirst ? reverseSide(first) : first,
    flipSecond ? reverseSide(second) : second,
  ];
}

/**
 * Both sides' spans on the joined line's own axis. Each was measured with its
 * own segment gaps left out, and drawn as one line those gaps are edges that
 * count.
 */
function joinedPathDetails(
  first: Side,
  second: Side,
  joined: Position[],
  startsAt: number,
): PathDetails | undefined {
  if (!first.details && !second.details) {
    return undefined;
  }

  const cum = cumulativeDistances(joined);

  return mergePathDetails(
    first.details && remapPathDetails(first.details, first.distances, cum),
    // The second's spans measure from its own first vertex — the one a shared
    // seam dropped, which is where it starts in the result.
    second.details &&
      remapPathDetails(second.details, second.distances, cum.slice(startsAt)),
    0,
  );
}

/** The spans of both, the second's re-based to where it starts in the result. */
function mergePathDetails(
  first: PathDetails | undefined,
  second: PathDetails | undefined,
  offset: number,
): PathDetails | undefined {
  if (!first && !second) {
    return undefined;
  }

  // The spans below are appended onto fresh arrays, so the first's are shared.
  const merged: PathDetails = { ...first };

  for (const [key, spans] of Object.entries(second ?? {})) {
    const shifted = spans.map(({ start, end, value }) => ({
      start: start + offset,
      end: end + offset,
      value,
    }));

    merged[key] = [...(merged[key] ?? []), ...shifted];
  }

  return merged;
}

/**
 * The two tracks as one feature: end to end as a single line, or a segment
 * each. The order is {@link orient}'s, and the per-point channels, path details
 * and elevation credits of both come along. `a`'s own metadata and style win —
 * it is the track the join was started from.
 */
export function joinTrackFeatures(
  a: TrackLine,
  b: TrackLine,
  mode: TrackJoinMode,
): TrackLine {
  // Only the path-detail spans are measured against a track's length, so a
  // track without them is never walked for one.
  const measure = Boolean(pathDetailsOf(a) ?? pathDetailsOf(b));

  const [first, oriented] = orient(
    readSide(a, measure),
    readSide(b, measure),
    mode,
  );

  // A vertex the two tracks share would otherwise sit in the line twice.
  const shared =
    mode === 'line' &&
    tail(first) !== undefined &&
    head(oriented) !== undefined &&
    positionsEqual(tail(first), head(oriented));

  const second = shared ? dropLeadingPoint(oriented) : oriented;

  const sides: [Side, Side] = [first, second];

  const segmentOf = (run: Run) => sides[run.side].segments[run.segment]!;

  const all = ([0, 1] as const).flatMap((side) =>
    sides[side].segments.map((_, segment): Run => ({ side, segment })),
  );

  // A segment with no line in it is a member no GeoJSON reader accepts, so as
  // segments it is dropped — unless that would leave nothing.
  const drawn = all.filter((run) => segmentOf(run).length > 1);

  const runs = mode === 'line' || drawn.length === 0 ? all : drawn;

  const out: Run[][] = mode === 'line' ? [runs] : runs.map((run) => [run]);

  const coordinates = out.map((runs) => runs.flatMap(segmentOf));

  const geometry: LineString | MultiLineString =
    mode === 'line'
      ? { type: 'LineString', coordinates: coordinates[0]! }
      : { type: 'MultiLineString', coordinates };

  const byKey = sides.map(
    (side) => new Map(side.channels.map((channel) => [channel.key, channel])),
  );

  const channels: Channel[] = [
    ...new Map([...byKey[0]!, ...byKey[1]!]).values(),
  ].map(({ key }) => ({
    key,
    segments: out.map((runs) =>
      runs.flatMap((run) => {
        const source = byKey[run.side]!.get(key);

        // A channel only one side records is padded on the other — which is
        // what togeojson itself leaves for a point that carries no value.
        return (
          source?.segments[run.segment] ??
          new Array<unknown>(segmentOf(run).length).fill(null)
        );
      }),
    ),
  }));

  const properties: Record<string, unknown> = {
    ...withoutPerPointData(b.properties),
    ...withoutPerPointData(a.properties),
  };

  const names = [first.properties['name'], second.properties['name']].filter(
    (name): name is string => typeof name === 'string' && name !== '',
  );

  if (names.length > 0) {
    properties['name'] = [...new Set(names)].join(', ');
  }

  // Which vertex of the joined line the second track starts at — the one they
  // share, where a `line` join dropped it from the second.
  const startsAt =
    first.segments.reduce((n, segment) => n + segment.length, 0) -
    (shared ? 1 : 0);

  const details =
    mode === 'line'
      ? // The oriented second, not the trimmed one: its spans still measure
        // from the vertex a shared seam dropped.
        joinedPathDetails(first, oriented, coordinates[0]!, startsAt)
      : // Segment gaps count on neither axis here, so the second's spans only
        // move by the first track's length.
        mergePathDetails(first.details, second.details, sideLength(first));

  if (details) {
    properties[PATH_DETAILS_PROP] = details;
  } else {
    delete properties[PATH_DETAILS_PROP];
  }

  writeChannels(
    properties,
    channels,
    geometry.type === 'LineString',
    (channel) => channel.segments,
  );

  return { ...a, geometry, properties };
}
