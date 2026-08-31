import {
  clipPathDetails,
  PATH_DETAILS_PROP,
  type PathDetailSpan,
  type PathDetails,
} from '@shared/colorizers/colorize.js';
import {
  cumulativeDistances,
  lowerBound,
  withoutPerPointData,
} from '@shared/geoutils.js';
import type { TransportType } from '@shared/transportTypeDefs.js';
import type { Feature, LineString, Position } from 'geojson';
import type { Alternative } from './actions.js';
import { flattenSteps } from './routeGeometry.js';
import { flattenLevelledSpans } from './structureElevation.js';

/**
 * The path details asked of GraphHopper: the ones describing the way itself for
 * every profile, plus the difficulty scale the riding profile is graded on.
 * `road_environment` is not here — it is read as bridges and tunnels rather
 * than as a detail.
 */
export function pathDetailKeys(transport: TransportType): string[] {
  // The ones every profile can be described by. Two extra cost 2.9 % of an
  // uncompressed 200 km response, so asking always beats guessing which profile
  // will want them — a mode with nothing mapped only greys out anyway.
  const keys = ['surface', 'road_class', 'track_type', 'smoothness'];

  // Only a motor vehicle is charged, and only `ALL` charges a car — `HGV` is a
  // road lorries pay for and cars do not.
  if (
    transport === 'car' ||
    transport === 'car4wd' ||
    transport === 'motorcycle'
  ) {
    keys.push('toll');
  }

  // A difficulty scale, though, is the profile's own and means nothing off it.
  switch (transport) {
    case 'foot':
    case 'hiking':
      keys.push('hike_rating');

      break;

    case 'bike':
    case 'mtb':
    case 'racingbike':
      keys.push('mtb_rating');

      break;
  }

  return keys;
}

/**
 * Every consumer that draws or measures the route asks for these, and the walk
 * is over every coordinate — but an alternative is immutable, so it is walked
 * once and remembered until it is dropped.
 */
const flattened = new WeakMap<Alternative, PathDetails>();

/**
 * The path details an alternative carries, as stretches in metres along the
 * line it draws. Ranges are stored per step (that is what survives the legs of
 * several independently-routed segments being concatenated), so they are mapped
 * through the flattened line here, and parts of one stretch reported by
 * adjacent steps are joined back together.
 */
export function flattenPathDetails(alternative: Alternative): PathDetails {
  const hit = flattened.get(alternative);

  if (hit) {
    return hit;
  }

  const details = flattenPathDetailsUncached(alternative);

  flattened.set(alternative, details);

  return details;
}

function flattenPathDetailsUncached(alternative: Alternative): PathDetails {
  const { coordinates, steps } = flattenSteps(alternative);

  const ranges: Record<string, [number, number, string][]> = {};

  for (const { step, indices } of steps) {
    for (const [key, spans] of Object.entries(step.details ?? {})) {
      for (const [from, to, value] of spans) {
        const a = indices[from];

        const b = indices[to];

        if (a === undefined || b === undefined || b <= a) {
          continue;
        }

        ranges[key] ??= [];

        const forKey = ranges[key];

        const last = forKey.at(-1);

        if (last && a <= last[1] && last[2] === value) {
          last[1] = Math.max(last[1], b);
        } else {
          forKey.push([a, b, value]);
        }
      }
    }
  }

  const keys = Object.keys(ranges);

  if (keys.length === 0) {
    return {};
  }

  const cum = cumulativeDistances(coordinates);

  return Object.fromEntries(
    keys.map((key) => [
      key,
      ranges[key]!.map(
        ([a, b, value]): PathDetailSpan => ({
          start: cum[a]!,
          end: cum[b]!,
          value,
        }),
      ),
    ]),
  );
}

/**
 * How far the route runs on road anyone pays for. `HGV` is excluded — it marks
 * road only lorries are charged on, and counting it overstates a car's toll
 * badly: of a 397 km Bratislava–Košice route, 204 km is `ALL` and 152 km `HGV`.
 */
export function tolledMeters(alternative: Alternative | undefined): number {
  if (!alternative) {
    return 0;
  }

  return (flattenPathDetails(alternative)['toll'] ?? []).reduce(
    (sum, span) => (span.value === 'all' ? sum + (span.end - span.start) : sum),
    0,
  );
}

/**
 * Where a run starts along the whole route, in metres. Only the elevation chart
 * reads it — it colors against the profile's own axis, and an unrouted leg cut
 * out from between two runs still counts there. Kept here rather than in the
 * colorize contract: no colorizer looks at it.
 */
export const LINE_START_PROP = 'fm:lineStart';

export function readLineStart(
  feature: Feature<LineString>,
): number | undefined {
  const value = feature.properties?.[LINE_START_PROP];

  return typeof value === 'number' ? value : undefined;
}

/**
 * The active alternative as the features the colorize modes and their legend
 * read: `line` where the elevation pipeline has already built one (it is the
 * same path, densified), else the alternative's own coordinates. The path
 * details ride along as a property, since a `Colorizer` is given nothing but
 * the feature.
 *
 * A stretch that failed to route is cut out rather than colorized, leaving one
 * feature per routed run — see `doc/elevation-and-colorizers.md`.
 */
export function routeColorizeFeatures(
  alternative: Alternative | undefined,
  line?: Feature<LineString> | null,
): Feature<LineString>[] {
  if (!alternative) {
    return [];
  }

  const { coordinates: plain, spans } = flattenLevelledSpans(alternative);

  const coordinates = line?.geometry.coordinates ?? plain;

  if (coordinates.length < 2) {
    return [];
  }

  const details = flattenPathDetails(alternative);

  const unrouted = spans.filter(({ kind }) => kind === 'unrouted');

  return routedRuns(coordinates, unrouted).map(({ from, to, coordinates }) => ({
    type: 'Feature',
    properties: {
      ...(unrouted.length === 0
        ? line?.properties
        : // A run is a piece of the line, so anything of the line's that answers
          // to its length cannot come along.
          withoutPerPointData(line?.properties ?? null)),
      [PATH_DETAILS_PROP]:
        unrouted.length === 0 ? details : clipPathDetails(details, from, to),
      // What was cut out before this run still counts on the whole route's
      // distance axis, which the elevation chart colors against.
      [LINE_START_PROP]: from,
    },
    geometry: { type: 'LineString', coordinates },
  }));
}

/**
 * The line's runs between the unrouted stretches, each measured along the whole
 * line — which is what the details have to be clipped to. A boundary vertex
 * belongs to the run beside it, so a run reaches the waypoint routing gave up
 * at.
 */
function routedRuns(
  coordinates: Position[],
  unrouted: { start: number; end: number }[],
): { from: number; to: number; coordinates: Position[] }[] {
  const cum = cumulativeDistances(coordinates);

  const total = cum[cum.length - 1] ?? 0;

  if (unrouted.length === 0) {
    return [{ from: 0, to: total, coordinates }];
  }

  // The complement of the unrouted stretches, rather than the vertices outside
  // them: a failed leg is a straight line between two waypoints and so has no
  // vertex of its own to drop.
  const kept: [number, number][] = [];

  let from = 0;

  for (const { start, end } of unrouted) {
    if (start > from) {
      kept.push([from, start]);
    }

    from = Math.max(from, end);
  }

  if (total > from) {
    kept.push([from, total]);
  }

  return kept
    .map(([start, end]) => {
      // Distances are re-accumulated on the densified line, so a stretch's ends
      // land on their vertices only to within rounding.
      const eps = 1e-6;

      const lo = lowerBound(cum.length, (i) => cum[i]! >= start - eps);

      const hi = lowerBound(cum.length, (i) => cum[i]! > end + eps);

      return { from: start, to: end, coordinates: coordinates.slice(lo, hi) };
    })
    .filter((run) => run.coordinates.length >= 2);
}
