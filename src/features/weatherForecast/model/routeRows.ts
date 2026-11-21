import type { RoutePosition } from '@features/routePlanner/model/schedule.js';
import { QUARTER_MS } from '@shared/dateUtils.js';

const HOUR_MS = 3_600_000;

const MAX_ROWS = 24;

/** Closer than this to the start, the summit or the finish, a step's row adds nothing. */
const MIN_GAP_MS = 20 * 60_000;

export type RouteRow = RoutePosition & {
  kind: 'start' | 'highest' | 'finish' | 'along' | 'stop';
  /** When the route is there, epoch ms. */
  at: number;
  /** A stop's end: the route stays there until then. */
  until?: number;
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
 * hourly steps and at the start, the highest point and the
 * finish; each stop as one row for its whole length; at most
 * {@link MAX_ROWS}, thinning the steps, and none already past.
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

  // The position a stop is on is followed by the same place once it is over.
  const stops = positions.flatMap((p, i): RouteRow[] => {
    const resume = positions[i + 1];

    return p.stop && resume
      ? [{ ...p, kind: 'stop', at: timeOf(p), until: timeOf(resume) }]
      : [];
  });

  const fixed: RouteRow[] = [
    { ...first, kind: 'start', at: timeOf(first) },
    { ...last, kind: 'finish', at: timeOf(last) },
    ...stops,
  ];

  const highest = positions.reduce((best, p) =>
    p.ele !== null && (best.ele === null || p.ele > best.ele) ? p : best,
  );

  // Not beside a row already there, nor while the route stands at a stop.
  const clear = (at: number) =>
    fixed.every(
      (row) =>
        Math.abs(row.at - at) >= MIN_GAP_MS &&
        (row.until === undefined ||
          at <= row.at ||
          at >= row.until + MIN_GAP_MS),
    );

  if (highest.ele !== null && clear(timeOf(highest))) {
    fixed.push({ ...highest, kind: 'highest', at: timeOf(highest) });
  }

  const end = departure + last.seconds * 1000;

  const steps: number[] = [];

  for (
    let t = Math.ceil(departure / HOUR_MS) * HOUR_MS;
    t < end;
    t += HOUR_MS
  ) {
    steps.push(t);
  }

  const upcoming = (t: number) => t > now - QUARTER_MS;

  // The hours on the move, not standing at a stop.
  const moving = steps.filter((t) =>
    stops.every((row) => t <= row.at || t >= row.until!),
  );

  // Thinned to fit what is still ahead, or a trip under way would get few rows;
  // counted over all the steps, so the rows kept stay put as hours pass.
  const every = Math.ceil(
    moving.filter(upcoming).length / Math.max(1, MAX_ROWS - fixed.length),
  );

  const along = moving
    .filter((t, i) => i % every === 0 && upcoming(t) && clear(t))
    .map(
      (t): RouteRow => ({
        ...positionAt(positions, (t - departure) / 1000),
        kind: 'along',
        at: t,
      }),
    );

  return [
    ...fixed.filter((row) => upcoming(row.until ?? row.at)),
    ...along,
  ].toSorted((a, b) => a.at - b.at);
}
