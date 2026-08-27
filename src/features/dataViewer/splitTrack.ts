import {
  clipPathDetails,
  PATH_DETAILS_PROP,
  type PathDetails,
} from '@shared/colorizers/colorize.js';
import { cumulativeDistances, lineSegments } from '@shared/geoutils.js';
import type { LineString, MultiLineString, Position } from 'geojson';
import { type Channel, readChannels, writeChannels } from './trackChannels.js';
import type { TrackLine } from './trackSelection.js';

/**
 * Where a track is cut. Always an existing vertex: the per-point channels run
 * parallel to the coordinates, so an interpolated point would have no values.
 */
export interface TrackSplitPoint {
  featureIndex: number;
  segmentIndex: number;
  pointIndex: number;
}

/** A run of one source segment, `to` exclusive. */
interface Run {
  segment: number;
  from: number;
  to: number;
}

/** What the pieces of one edit are all cut from, read once for the lot. */
interface Source {
  segments: Position[][];
  channels: Channel[];
  details: PathDetails | undefined;
  /** Only measured for `details`, which are metres from the start. */
  distances: number[][] | null;
}

/** A run with a line in it; a lone point draws nothing and is dropped. */
function drawableRuns(runs: Run[]): Run[] {
  return runs.filter((run) => run.to - run.from > 1);
}

function drawableSegments(segments: Position[][]): number {
  return segments.filter((segment) => segment.length > 1).length;
}

function readSource(feature: TrackLine): Source {
  const segments = lineSegments(feature.geometry);

  const details = feature.properties?.[PATH_DETAILS_PROP] as
    | PathDetails
    | undefined;

  return {
    segments,
    channels: readChannels(
      feature,
      segments.map((segment) => segment.length),
    ),
    details,
    distances: details ? vertexDistances(feature) : null,
  };
}

/**
 * The runs either side of a cut. Both keep the cut vertex, and a piece left
 * with a single point is dropped — so an empty side means nothing can be cut
 * here.
 */
function cutRuns(
  segments: Position[][],
  segmentIndex: number,
  pointIndex: number,
): [Run[], Run[]] {
  const segment = segments[segmentIndex];

  if (!segment) {
    return [[], []];
  }

  const whole = (offset: number) => (s: Position[], i: number) => ({
    segment: offset + i,
    from: 0,
    to: s.length,
  });

  return [
    drawableRuns([
      ...segments.slice(0, segmentIndex).map(whole(0)),
      { segment: segmentIndex, from: 0, to: pointIndex + 1 },
    ]),
    drawableRuns([
      { segment: segmentIndex, from: pointIndex, to: segment.length },
      ...segments.slice(segmentIndex + 1).map(whole(segmentIndex + 1)),
    ]),
  ];
}

/** The given runs as a feature of their own, channels cut alongside them. */
function takeRuns(
  feature: TrackLine,
  source: Source,
  runs: Run[],
): TrackLine | null {
  const kept = drawableRuns(runs);

  if (kept.length === 0) {
    return null;
  }

  const coordinates = kept.map((run) =>
    source.segments[run.segment]!.slice(run.from, run.to),
  );

  const geometry: LineString | MultiLineString =
    kept.length === 1
      ? { type: 'LineString', coordinates: coordinates[0]! }
      : { type: 'MultiLineString', coordinates };

  const properties = { ...feature.properties };

  writeChannels(
    properties,
    source.channels,
    geometry.type === 'LineString',
    (channel: Channel) =>
      kept.map((run) => channel.segments[run.segment]!.slice(run.from, run.to)),
  );

  if (source.details && source.distances) {
    const first = kept[0]!;

    const last = kept.at(-1)!;

    const from = source.distances[first.segment]?.[first.from] ?? 0;

    // Spans are metres from the start of the line, so each piece re-bases them.
    properties[PATH_DETAILS_PROP] = clipPathDetails(
      source.details,
      from,
      source.distances[last.segment]?.[last.to - 1] ?? from,
    );
  }

  return { ...feature, geometry, properties };
}

/** A track that has something to cut: a vertex with a piece on either side. */
export function isSplittable(feature: TrackLine): boolean {
  const segments = lineSegments(feature.geometry);

  return (
    segments.some((segment) => segment.length > 2) ||
    drawableSegments(segments) > 1
  );
}

/** A track that falls into more than one segment, which is what explode gives. */
export function isExplodable(feature: TrackLine): boolean {
  return drawableSegments(lineSegments(feature.geometry)) > 1;
}

/** Whether cutting at this vertex leaves a drawable piece on both sides. */
export function isCutVertex(
  feature: TrackLine,
  segmentIndex: number,
  pointIndex: number,
): boolean {
  const [head, tail] = cutRuns(
    lineSegments(feature.geometry),
    segmentIndex,
    pointIndex,
  );

  return head.length > 0 && tail.length > 0;
}

/** The coordinates of one vertex, by the indices a {@link TrackSplitPoint} names. */
export function vertexAt(
  feature: TrackLine,
  segmentIndex: number,
  pointIndex: number,
): Position | undefined {
  return lineSegments(feature.geometry)[segmentIndex]?.[pointIndex];
}

/**
 * Distance from the start of the track to each of its vertices, per segment.
 * Summed across segments as `trackEndpoints` measures it, so the gap a paused
 * recording leaves does not count.
 */
export function vertexDistances(feature: TrackLine): number[][] {
  let total = 0;

  return lineSegments(feature.geometry).map((segment) => {
    if (segment.length === 0) {
      return [];
    }

    const cum = cumulativeDistances(segment).map((d) => d + total);

    total = cum.at(-1)!;

    return cum;
  });
}

/** The coordinates either side of a cut, for drawing the halves apart. */
export function splitTrackCoordinates(
  feature: TrackLine,
  segmentIndex: number,
  pointIndex: number,
): { head: Position[][]; tail: Position[][] } {
  const segments = lineSegments(feature.geometry);

  const [head, tail] = cutRuns(segments, segmentIndex, pointIndex);

  const coordinates = (runs: Run[]) =>
    runs.map((run) => segments[run.segment]!.slice(run.from, run.to));

  return { head: coordinates(head), tail: coordinates(tail) };
}

/**
 * The two halves a track falls into when cut at the given vertex, which both
 * halves keep. `null` where one side would be left with nothing to draw.
 */
export function splitTrackFeature(
  feature: TrackLine,
  segmentIndex: number,
  pointIndex: number,
): [TrackLine, TrackLine] | null {
  const source = readSource(feature);

  const [headRuns, tailRuns] = cutRuns(
    source.segments,
    segmentIndex,
    pointIndex,
  );

  const head = takeRuns(feature, source, headRuns);

  const tail = takeRuns(feature, source, tailRuns);

  return head && tail ? [head, tail] : null;
}

/**
 * A multi-segment recording as one feature per segment — the cut a paused
 * recording asks for. `null` when there is only one segment to give.
 */
export function explodeTrackFeature(feature: TrackLine): TrackLine[] | null {
  const source = readSource(feature);

  if (drawableSegments(source.segments) < 2) {
    return null;
  }

  return source.segments.flatMap((segment, i) => {
    const part = takeRuns(feature, source, [
      { segment: i, from: 0, to: segment.length },
    ]);

    return part ? [part] : [];
  });
}

/**
 * The vertex nearest the given position, which is where a cut aimed there
 * lands. Compared in scaled degrees rather than metres: it runs per pointer
 * move over every point of a recording, and only the ordering matters.
 */
export function nearestTrackVertex(
  feature: TrackLine,
  lat: number,
  lon: number,
): { segmentIndex: number; pointIndex: number } | null {
  const scale = Math.cos((lat * Math.PI) / 180);

  let best: { segmentIndex: number; pointIndex: number } | null = null;

  let bestDistance = Number.POSITIVE_INFINITY;

  for (const [segmentIndex, segment] of lineSegments(
    feature.geometry,
  ).entries()) {
    for (const [pointIndex, position] of segment.entries()) {
      const dx = (position[0]! - lon) * scale;

      const dy = position[1]! - lat;

      const distance = dx * dx + dy * dy;

      if (distance < bestDistance) {
        bestDistance = distance;

        best = { segmentIndex, pointIndex };
      }
    }
  }

  return best;
}
