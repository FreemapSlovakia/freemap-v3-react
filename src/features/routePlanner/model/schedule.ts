import { distanceTo } from '@shared/geoutils.js';
import z from 'zod';

/**
 * A waypoint's stop: a pause of some minutes, or nights spent there and the
 * time of day the route goes on. Relative, never a date, so a changed
 * departure moves the whole trip.
 */
export const RouteStopSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('pause'), minutes: z.int().positive() }),
  z.object({
    kind: z.literal('overnight'),
    /** `HH:MM`, local time. */
    resume: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    nights: z.int().min(1).max(30),
  }),
]);

export type RouteStop = z.infer<typeof RouteStopSchema>;

/** A stop as `points=` writes it after its waypoint: `~p30`, `~n2-0730`. */
export function encodeStop(stop: RouteStop): string {
  return stop.kind === 'pause'
    ? `~p${stop.minutes}`
    : `~n${stop.nights}-${stop.resume.replace(':', '')}`;
}

/** {@link encodeStop}'s text without its `~`; undefined when malformed. */
export function decodeStop(text: string): RouteStop | undefined {
  const pause = /^p(\d+)$/.exec(text);

  const night = /^n(\d+)-(\d\d)(\d\d)$/.exec(text);

  return RouteStopSchema.safeParse(
    pause
      ? { kind: 'pause', minutes: Number(pause[1]) }
      : night
        ? {
            kind: 'overnight',
            nights: Number(night[1]),
            resume: `${night[2]}:${night[3]}`,
          }
        : undefined,
  ).data;
}

/** The departure as `departure=` carries it: UTC to the minute. */
export function serializeDeparture(ms: number): string {
  return `${new Date(ms).toISOString().slice(0, 16)}Z`;
}

export function parseDeparture(text: unknown): number | undefined {
  const ms =
    typeof text === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\dZ$/.test(text)
      ? Date.parse(text)
      : Number.NaN;

  return Number.isNaN(ms) ? undefined : ms;
}

/** When the route goes on from a stop it reached at `arrival` (epoch ms). */
export function stopEnd(stop: RouteStop, arrival: number): number {
  if (stop.kind === 'pause') {
    return arrival + stop.minutes * 60_000;
  }

  const [hours = 0, minutes = 0] = stop.resume.split(':').map(Number);

  // The first such time after arriving ends the first night — the same day's
  // for an arrival after midnight — and each further night adds a day.
  const d = new Date(arrival);

  d.setHours(hours, minutes, 0, 0);

  d.setDate(d.getDate() + (d.getTime() > arrival ? 0 : 1) + stop.nights - 1);

  return d.getTime();
}

/**
 * The stop at the end of each leg: an inner waypoint's, in a route through
 * the points in order — never the finish's, which holds nothing up.
 */
export function legStops(
  mode: string | undefined,
  points: readonly ({ stop?: RouteStop } | null | undefined)[],
): (RouteStop | undefined)[] {
  return (mode ?? 'route') === 'route'
    ? points.slice(1, -1).map((point) => point?.stop)
    : [];
}

/**
 * When each waypoint is reached and left (epoch ms), from the legs' own
 * durations; they differ only at a stop.
 */
export function waypointTimes(
  legDurations: readonly number[],
  stops: readonly (RouteStop | undefined)[],
  departure: number,
): { arrival: number; leave: number }[] {
  const times = [{ arrival: departure, leave: departure }];

  let at = departure;

  for (const [i, duration] of legDurations.entries()) {
    const arrival = at + duration * 1000;

    const stop = stops[i];

    at =
      stop && i < legDurations.length - 1
        ? Math.max(arrival, stopEnd(stop, arrival))
        : arrival;

    times.push({ arrival, leave: at });
  }

  return times;
}

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
  /** From the departure, stops included. */
  seconds: number;
  metres: number;
  /** The stop begun here, on the position the route arrives at. */
  stop?: RouteStop;
};

/**
 * Every coordinate of the route with the time it is reached: a step's duration
 * is spread over its coordinates by distance. `stops[i]` holds the route at the
 * end of leg `i`, which is waypoint `i + 1`; an overnight needs the
 * `departure` to tell the time of day.
 */
export function timedPositions(
  route: TimedRoute,
  stops: readonly (RouteStop | undefined)[] = [],
  departure = 0,
): RoutePosition[] {
  const positions: RoutePosition[] = [];

  let seconds = 0;

  let metres = 0;

  for (const [legIndex, leg] of route.legs.entries()) {
    for (const step of leg.steps) {
      const coords = step.geometry.coordinates.map(
        ([lon = 0, lat = 0, ele]) => ({ lat, lon, ele: ele ?? null }),
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

        // A step starts where the previous one ended; after a stop the same
        // place is kept twice, so the route stands still meanwhile.
        if (
          last &&
          last.lat === c.lat &&
          last.lon === c.lon &&
          last.seconds === seconds
        ) {
          continue;
        }

        positions.push({ ...c, seconds, metres });
      }

      // A step with no length still takes its time (a ferry's wait).
      if (length === 0 && coords.length > 0) {
        seconds += step.duration;
      }
    }

    const stop = stops[legIndex];

    const arrived = positions.at(-1);

    if (stop && arrived && legIndex < route.legs.length - 1) {
      arrived.stop = stop;

      const at = departure + seconds * 1000;

      seconds += Math.max(0, stopEnd(stop, at) - at) / 1000;
    }
  }

  return positions;
}
