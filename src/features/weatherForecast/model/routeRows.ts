import { distanceTo } from '@shared/geoutils.js';

/** What the route planner and a saved map store of a route: legs of timed steps. */
export type TimedRoute = {
  legs: {
    steps: {
      duration: number;
      geometry: { coordinates: number[][] };
    }[];
  }[];
};

export type RoutePosition = {
  lat: number;
  lon: number;
  ele: number | null;
  /** From the departure. */
  seconds: number;
  metres: number;
};

/**
 * Every coordinate of the route with the time it is reached: a step's duration
 * is spread over its coordinates by distance.
 */
export function timedPositions(route: TimedRoute): RoutePosition[] {
  const positions: RoutePosition[] = [];

  let seconds = 0;

  let metres = 0;

  for (const leg of route.legs) {
    for (const step of leg.steps) {
      const coords = step.geometry.coordinates.map(
        ([lon = 0, lat = 0, ele]) => ({
          lat,
          lon,
          ele: ele ?? null,
        }),
      );

      const gaps = coords.slice(1).map((c, i) => distanceTo(coords[i]!, c));

      const length = gaps.reduce((a, b) => a + b, 0);

      for (const [i, c] of coords.entries()) {
        if (i > 0) {
          const gap = gaps[i - 1]!;

          metres += gap;

          seconds += length > 0 ? (step.duration * gap) / length : 0;
        }

        const last = positions.at(-1);

        // A step starts where the previous one ended.
        if (last && last.lat === c.lat && last.lon === c.lon) {
          continue;
        }

        positions.push({ ...c, seconds, metres });
      }

      // A step with no length still takes its time (a ferry's wait).
      if (length === 0 && coords.length > 0) {
        seconds += step.duration;
      }
    }
  }

  return positions;
}

const HOUR_MS = 3_600_000;

const SIX_HOURS_MS = 6 * HOUR_MS;

/** How far ahead the forecast goes hourly; then by 6 hours, from 00 UTC. */
const HOURLY_AHEAD_MS = 60 * HOUR_MS;

/** Arrival times are estimates; a quarter of an hour is as exact as they get. */
export const QUARTER_MS = 15 * 60_000;

const MAX_ROWS = 24;

/** Closer than this to the start, the summit or the finish, a step's row adds nothing. */
const MIN_GAP_MS = 20 * 60_000;

export type RouteRow = RoutePosition & {
  kind: 'start' | 'highest' | 'finish' | 'along';
  /** When the route is there, epoch ms. */
  at: number;
};

/** Where the route is `seconds` after departure, between two positions. */
function positionAt(
  positions: RoutePosition[],
  seconds: number,
): RoutePosition {
  const i = positions.findIndex((p) => p.seconds >= seconds);

  const b = positions[i === -1 ? positions.length - 1 : i]!;

  const a = positions[i - 1];

  if (!a || i === -1) {
    return b;
  }

  const f = (seconds - a.seconds) / (b.seconds - a.seconds || 1);

  const lerp = (x: number, y: number) => x + (y - x) * f;

  return {
    lat: lerp(a.lat, b.lat),
    lon: lerp(a.lon, b.lon),
    ele: a.ele === null || b.ele === null ? null : lerp(a.ele, b.ele),
    seconds,
    metres: lerp(a.metres, b.metres),
  };
}

/**
 * Where to ask for the weather: where the route is at each of the forecast's
 * steps (hourly, then 6-hourly) and at the start, the highest point and the
 * finish; at most {@link MAX_ROWS}, thinning the steps, and none already past.
 */
export function routeRows(
  positions: RoutePosition[],
  departure: number,
  now: number,
): RouteRow[] {
  const first = positions[0];

  const last = positions.at(-1);

  if (!first || !last) {
    return [];
  }

  const quarter = (t: number) => Math.round(t / QUARTER_MS) * QUARTER_MS;

  const timeOf = (p: RoutePosition) => quarter(departure + p.seconds * 1000);

  const fixed: RouteRow[] = [
    { ...first, kind: 'start', at: timeOf(first) },
    { ...last, kind: 'finish', at: timeOf(last) },
  ];

  const highest = positions.reduce((best, p) =>
    p.ele !== null && (best.ele === null || p.ele > best.ele) ? p : best,
  );

  const clear = (at: number) =>
    fixed.every((row) => Math.abs(row.at - at) >= MIN_GAP_MS);

  if (highest.ele !== null && clear(timeOf(highest))) {
    fixed.push({ ...highest, kind: 'highest', at: timeOf(highest) });
  }

  const end = departure + last.seconds * 1000;

  const steps: number[] = [];

  const firstHour = Math.ceil(departure / HOUR_MS) * HOUR_MS;

  for (
    let t =
      firstHour < now + HOURLY_AHEAD_MS
        ? firstHour
        : Math.ceil(departure / SIX_HOURS_MS) * SIX_HOURS_MS;
    t < end;
  ) {
    steps.push(t);

    t =
      t + HOUR_MS < now + HOURLY_AHEAD_MS
        ? t + HOUR_MS
        : (Math.floor(t / SIX_HOURS_MS) + 1) * SIX_HOURS_MS;
  }

  const upcoming = (t: number) => t > now - QUARTER_MS;

  // Thinned to fit what is still ahead, or a trip under way would get few rows;
  // counted over all the steps, so the rows kept stay put as hours pass.
  const every = Math.ceil(
    steps.filter(upcoming).length / (MAX_ROWS - fixed.length),
  );

  const along = steps
    .filter((t, i) => i % every === 0 && upcoming(t) && clear(t))
    .map(
      (t): RouteRow => ({
        ...positionAt(positions, (t - departure) / 1000),
        kind: 'along',
        at: t,
      }),
    );

  return [...fixed.filter((row) => upcoming(row.at)), ...along].toSorted(
    (a, b) => a.at - b.at,
  );
}
