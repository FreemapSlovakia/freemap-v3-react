import {
  PATH_DETAILS_PROP,
  type PathDetailSpan,
  type PathDetails,
} from '@shared/colorizers/colorize.js';
import { cumulativeDistances } from '@shared/geoutils.js';
import type { TransportType } from '@shared/transportTypeDefs.js';
import type { Feature, LineString } from 'geojson';
import type { Alternative } from './actions.js';
import { alternativeCoordinates, flattenSteps } from './routeGeometry.js';

/**
 * The path details asked of GraphHopper, by what is riding: every extra detail
 * costs response size on every route, so a profile asks only for what its own
 * colorize modes can show. `road_environment` is not here — it is read as
 * bridges and tunnels rather than as a detail.
 */
export function pathDetailKeys(transport: TransportType): string[] {
  const keys = ['surface', 'road_class'];

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
 * The active alternative as the single feature the colorize modes and their
 * legend read: `line` where the elevation pipeline has already built one (it is
 * the same path, densified), else the alternative's own coordinates. The path
 * details ride along as a property, since a `Colorizer` is given nothing but
 * the feature.
 */
export function routeColorizeFeatures(
  alternative: Alternative | undefined,
  line?: Feature<LineString> | null,
): Feature<LineString>[] {
  if (!alternative) {
    return [];
  }

  const properties = {
    ...line?.properties,
    [PATH_DETAILS_PROP]: flattenPathDetails(alternative),
  };

  if (line) {
    return [{ ...line, properties }];
  }

  const coordinates = alternativeCoordinates(alternative);

  return coordinates.length < 2
    ? []
    : [
        {
          type: 'Feature',
          properties,
          geometry: { type: 'LineString', coordinates },
        },
      ];
}
