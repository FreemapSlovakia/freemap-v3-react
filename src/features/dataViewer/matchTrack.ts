import {
  PATH_DETAILS_PROP,
  type PathDetailSpan,
  type PathDetails,
} from '@shared/colorizers/colorize.js';
import {
  cumulativeDistances,
  lineSegments,
  trackTimeSegments,
  withoutPerPointData,
} from '@shared/geoutils.js';
import type { Feature, LineString, Position } from 'geojson';
import z from 'zod';
import { GeoJSONLineStringSchema } from 'zod-geojson';
import type { TrackLine } from './trackSelection.js';

/**
 * GraphHopper's `gps_accuracy`, in metres. Its own default of 10 is tighter than
 * a real fix and sends the matcher hunting detours that fit the noise; the
 * plateau around 25 is wide.
 *
 * Not offered to the reader: below this the matcher detours or gives up, and
 * above it the graph is loose enough to accept nonsense, so the knob would
 * mostly turn a loud failure into a silent one.
 */
export const MATCH_ACCURACY = 25;

/**
 * How far apart observations are sent. Two fixes closer together than their own
 * error carry no direction, only noise, which the matcher rationalizes by
 * detouring — on a real recording, 1.25× too long at 25 m and 0.96× at 50 m.
 * Nothing is lost by widening: what comes back is the graph's own path.
 */
const MATCH_SPACING_METERS = MATCH_ACCURACY * 2;

/**
 * A match longer than this ratio of the recording is refused. Matching answers
 * only with paths the graph holds, so a stretch taken across open ground — or by
 * a transport the profile cannot follow — comes back routed plausibly around it.
 * Measured, good matches land at 0.96–1.00 and bad ones at 1.17 and up.
 */
export const MATCH_MAX_LENGTH_RATIO = 1.1;

/** Observations one request is thinned to, which is what bounds its size. */
const MATCH_MAX_POINTS = 8000;

/**
 * What the request body must stay under. Thinning keeps it true; this guards a
 * later change to {@link MATCH_MAX_POINTS}, since nginx answers 413 in its own
 * HTML rather than in anything a reader could act on.
 */
export const MATCH_MAX_BYTES = 1024 * 1024;

/** A segment shorter than this is left alone — there is nothing to match. */
const MATCH_MIN_SEGMENT_METERS = 100;

/** ~1 cm, past which a GPS fix is inventing digits and the body pays for them. */
const round = (value: number) => Math.round(value * 1e7) / 1e7;

const MatchResponseSchema = z.object({
  paths: z
    .array(
      z.object({
        points: GeoJSONLineStringSchema,
        details: z
          .record(
            z.string(),
            z.array(z.tuple([z.number(), z.number(), z.unknown()])),
          )
          .optional(),
      }),
    )
    .min(1),
});

/**
 * One segment of a track: its coordinates, the times belonging to it, and the
 * distances along it — walked once here and read by everything downstream.
 */
export type MatchSegment = {
  coordinates: Position[];
  times: number[] | null;
  cum: number[];
  length: number;
};

/**
 * The track's segments, each with its own times.
 *
 * They are matched one at a time and never as one document: GraphHopper reads a
 * GPX as a single sequence of observations, so a recorder that stopped and
 * started again has it route between the two — one real recording carried a
 * stray three-point fragment 28 km from the walk, and matching the file whole
 * came back four times its length.
 */
export function trackSegments(feature: TrackLine): MatchSegment[] {
  const timeSegments = trackTimeSegments(feature);

  return lineSegments(feature.geometry).map((coordinates, i) => {
    const raw = timeSegments[i];

    const cum = cumulativeDistances(coordinates);

    return {
      coordinates,
      times:
        raw?.length === coordinates.length
          ? raw.map((t) =>
              typeof t === 'string' ? new Date(t).getTime() : NaN,
            )
          : null,
      cum,
      length: cum.at(-1) ?? 0,
    };
  });
}

/** Whether a segment is worth sending at all. */
export function isMatchable(segment: MatchSegment): boolean {
  return (
    segment.coordinates.length >= 2 &&
    segment.length >= MATCH_MIN_SEGMENT_METERS
  );
}

/**
 * Whether stripping per-point data would actually take anything away — every
 * channel {@link withoutPerPointData} drops, not just the times: a track can
 * carry heart rate or cadence with no timestamps at all.
 */
export function hasPerPointData(feature: TrackLine): boolean {
  const cp = feature.properties?.['coordinateProperties'] as
    | Record<string, unknown>
    | undefined;

  return (
    Boolean(feature.properties?.['coordTimes']) ||
    Object.values(cp ?? {}).some(
      (values) => Array.isArray(values) && values.length > 0,
    )
  );
}

/**
 * The observations to send: never closer than `spacing`, and always including
 * the segment's own last point so thinning cannot shorten it.
 */
function thin(
  { coordinates, times, cum }: MatchSegment,
  spacing: number,
): { coordinates: Position[]; times: number[] | null } {
  const kept: Position[] = [];

  const keptTimes: number[] = [];

  let last = Number.NEGATIVE_INFINITY;

  coordinates.forEach((coord, i) => {
    if (cum[i]! - last >= spacing || i === coordinates.length - 1) {
      kept.push(coord);

      const time = times?.[i];

      if (time !== undefined) {
        keptTimes.push(time);
      }

      last = cum[i]!;
    }
  });

  return {
    coordinates: kept,
    // All or none: an unparseable stamp reads as NaN without shortening the
    // array, and a half-timed sequence is worse than an untimed one.
    times:
      keptTimes.length === kept.length && keptTimes.every(Number.isFinite)
        ? keptTimes
        : null,
  };
}

/**
 * One segment as `/match` wants it — GPX and nothing else (JSON is a 415).
 * Thinned on the way; times ride along where the segment has them, since the
 * matcher is a walk over time steps.
 */
export function segmentToGpx(segment: MatchSegment): string {
  const { coordinates, times } = thin(
    segment,
    // Widened past the standing spacing only where the segment is long enough
    // to overflow the request even thinned.
    Math.max(MATCH_SPACING_METERS, segment.length / MATCH_MAX_POINTS),
  );

  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="freemap" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>',
  ];

  coordinates.forEach(([lon, lat, ele], i) => {
    parts.push(`<trkpt lat="${round(lat!)}" lon="${round(lon!)}">`);

    if (typeof ele === 'number') {
      parts.push(`<ele>${round(ele)}</ele>`);
    }

    const time = times?.[i];

    if (time !== undefined) {
      parts.push(`<time>${new Date(time).toISOString()}</time>`);
    }

    parts.push('</trkpt>');
  });

  parts.push('</trkseg></trk></gpx>');

  return parts.join('');
}

/**
 * The matched line and how long it came out, from one parse of the response.
 *
 * The path details ride along as metre spans — what every categorical colorize
 * mode reads, and the only form that survives the line being densified later.
 * The original's properties come too, minus anything indexed per recorded
 * point: the matched line has its own points.
 *
 * The length is walked here rather than read from the response's own
 * `distance`, which is the graph's edge distance and runs ~2 % above a walk of
 * the points it returns. The caller weighs it against the recording's length,
 * and both sides have to be measured the same way.
 */
export function matchedSegment(
  raw: unknown,
  original: TrackLine,
): { feature: Feature<LineString>; length: number } {
  const path = MatchResponseSchema.parse(raw).paths[0]!;

  const coordinates = path.points.coordinates;

  const cum = cumulativeDistances(coordinates);

  return {
    length: cum.at(-1) ?? 0,
    feature: {
      type: 'Feature',
      properties: {
        ...withoutPerPointData(original.properties),
        [PATH_DETAILS_PROP]: toMetreSpans(cum, path.details),
      },
      geometry: { type: 'LineString', coordinates },
    },
  };
}

/** `/match`'s index ranges as metre spans along the line it returned. */
function toMetreSpans(
  cum: number[],
  details: Record<string, [number, number, unknown][]> | undefined,
): PathDetails {
  if (!details || cum.length < 2) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(details).flatMap(([key, ranges]) => {
      const spans: PathDetailSpan[] = [];

      for (const [from, to, value] of ranges) {
        const start = cum[from];

        const end = cum[to];

        // A null value is what the router reports where it has none; dropping
        // it leaves the stretch to read as unknown rather than as a category.
        if (
          start !== undefined &&
          end !== undefined &&
          end > start &&
          value != null
        ) {
          spans.push({ start, end, value: String(value) });
        }
      }

      return spans.length > 0 ? [[key, spans] as const] : [];
    }),
  );
}
