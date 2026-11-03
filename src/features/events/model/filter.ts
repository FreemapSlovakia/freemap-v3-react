import { DIFFICULTIES } from './actions.js';

/** Inclusive; either end may be open. */
export type Range = { min?: number; max?: number };

/** Within `radius` km of a place. */
export type Near = { lat: number; lon: number; radius: number };

/** The events layer's filter. Ranges are in km, hours and meters, as typed. */
export interface EventsFilter {
  from?: Date;
  to?: Date;
  near?: Near;
  transport?: string[];
  distance?: Range;
  duration?: Range;
  ascent?: Range;
  difficulty?: string[];
  /** Only events that said they welcome dogs, or that they don't; unset, any. */
  dogs?: boolean;
  /** Only events that said they suit children, or that they don't; unset, any. */
  children?: boolean;
}

const isEmptyRange = (r: Range | undefined) =>
  r?.min === undefined && r?.max === undefined;

export const isFilterEmpty = (f: EventsFilter): boolean =>
  !f.from &&
  !f.to &&
  !f.near &&
  !f.transport?.length &&
  isEmptyRange(f.distance) &&
  isEmptyRange(f.duration) &&
  isEmptyRange(f.ascent) &&
  !f.difficulty?.length &&
  f.dogs === undefined &&
  f.children === undefined;

/** A date input can yield an Invalid Date (a 6-digit year); it reads as none. */
const validDate = (d: Date | undefined) =>
  d && !Number.isNaN(d.getTime()) ? d : undefined;

const formatDate = (d: Date) => d.toISOString().slice(0, 10);

const formatRange = ({ min, max }: Range) => `${min ?? ''}-${max ?? ''}`;

const parseYesNo = (s: unknown) =>
  s === '1' ? true : s === '0' ? false : undefined;

const parseDate = (s: unknown) =>
  validDate(typeof s === 'string' ? new Date(s) : undefined);

function parseRange(s: unknown): Range | undefined {
  const m = typeof s === 'string' ? /^([\d.]*)-([\d.]*)$/.exec(s) : null;

  if (!m) {
    return undefined;
  }

  const num = (v: string | undefined) => {
    const n = v ? Number(v) : Number.NaN;

    return Number.isFinite(n) ? n : undefined;
  };

  const range = { min: num(m[1]), max: num(m[2]) };

  return isEmptyRange(range) ? undefined : range;
}

function parseNear(near: unknown, radius: unknown): Near | undefined {
  if (typeof near !== 'string' || typeof radius !== 'string') {
    return undefined;
  }

  const [lat, lon] = near.split(',').map(Number);

  const r = Number(radius);

  return lat !== undefined &&
    lon !== undefined &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180 &&
    r >= MIN_RADIUS &&
    r <= MAX_RADIUS
    ? { lat, lon, radius: r }
    : undefined;
}

/** Km; the API's own bound. */
export const MAX_RADIUS = 1000;

/** Km; a smaller circle catches next to no events. */
export const MIN_RADIUS = 10;

/** One decade of the slider's stops: round numbers about 1.1× apart. */
const DECADE = [
  10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 25, 28, 30, 35, 40, 45, 50, 55, 60,
  70, 80, 90,
];

/** The radius slider's stops, km, from {@link MIN_RADIUS} to {@link MAX_RADIUS}. */
export const RADIUS_STOPS = [
  ...DECADE,
  ...DECADE.map((km) => km * 10),
  MAX_RADIUS,
];

/** The stop nearest to a radius on a log scale, for one typed off the series. */
export const nearestRadiusStop = (km: number): number =>
  RADIUS_STOPS.reduce(
    (best, stop, i) =>
      Math.abs(Math.log(stop / km)) <
      Math.abs(Math.log(RADIUS_STOPS[best]! / km))
        ? i
        : best,
    0,
  );

const formatCoord = (n: number) => String(Math.round(n * 1e5) / 1e5);

/** The filter as URL query parts, `events-*`. */
export function filterToQuery(f: EventsFilter): [string, string][] {
  const parts: [string, string][] = [];

  const from = validDate(f.from);

  const to = validDate(f.to);

  if (from) {
    parts.push(['events-from', formatDate(from)]);
  }

  if (to) {
    parts.push(['events-to', formatDate(to)]);
  }

  if (f.near) {
    parts.push(
      ['events-near', `${formatCoord(f.near.lat)},${formatCoord(f.near.lon)}`],
      ['events-radius', String(f.near.radius)],
    );
  }

  if (f.transport?.length) {
    parts.push(['events-transport', f.transport.join(',')]);
  }

  if (f.difficulty?.length) {
    parts.push(['events-difficulty', f.difficulty.join(',')]);
  }

  if (f.dogs !== undefined) {
    parts.push(['events-dogs', f.dogs ? '1' : '0']);
  }

  if (f.children !== undefined) {
    parts.push(['events-children', f.children ? '1' : '0']);
  }

  for (const [key, range] of [
    ['events-length', f.distance],
    ['events-duration', f.duration],
    ['events-ascent', f.ascent],
  ] as const) {
    if (range && !isEmptyRange(range)) {
      parts.push([key, formatRange(range)]);
    }
  }

  return parts;
}

export function filterFromQuery(
  query: Record<string, string | string[] | undefined>,
): EventsFilter {
  const list = (key: string) => {
    const value = query[key];

    return typeof value === 'string' ? value.split(',').filter(Boolean) : [];
  };

  const transport = list('events-transport');

  // Only known ones: the server refuses a list naming any other.
  const difficulty = list('events-difficulty').filter((d) =>
    (DIFFICULTIES as readonly string[]).includes(d),
  );

  const filter: EventsFilter = {
    from: parseDate(query['events-from']),
    to: parseDate(query['events-to']),
    near: parseNear(query['events-near'], query['events-radius']),
    transport: transport.length ? transport : undefined,
    distance: parseRange(query['events-length']),
    duration: parseRange(query['events-duration']),
    ascent: parseRange(query['events-ascent']),
    difficulty: difficulty.length ? difficulty : undefined,
    dogs: parseYesNo(query['events-dogs']),
    children: parseYesNo(query['events-children']),
  };

  return Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== undefined),
  ) as EventsFilter;
}

/** Whether two filters ask for the same events. */
export const sameFilter = (a: EventsFilter, b: EventsFilter): boolean =>
  JSON.stringify(filterToQuery(a)) === JSON.stringify(filterToQuery(b));

/** The filter as `GET /events` parameters. */
export function filterToRequest(f: EventsFilter): Record<string, string> {
  const params: Record<string, string> = {};

  if (f.near) {
    params['near'] = `${f.near.lat},${f.near.lon}`;

    params['radius'] = String(f.near.radius);
  }

  const from = validDate(f.from);

  const to = validDate(f.to);

  if (from) {
    params['from'] = from.toISOString();
  }

  if (to) {
    // The picker yields UTC midnight, and the bound reads as inclusive of the
    // day it names — so it goes out as that day's last instant.
    params['to'] = new Date(to.getTime() + 86_400_000 - 1).toISOString();
  }

  if (f.transport?.length) {
    params['transport'] = f.transport.join(',');
  }

  const scaled = (
    name: string,
    range: Range | undefined,
    factor: number,
  ): void => {
    if (range?.min !== undefined) {
      params[`min${name}`] = String(Math.round(range.min * factor));
    }

    if (range?.max !== undefined) {
      params[`max${name}`] = String(Math.round(range.max * factor));
    }
  };

  scaled('Distance', f.distance, 1000);

  scaled('Duration', f.duration, 3600);

  scaled('Ascent', f.ascent, 1);

  if (f.difficulty?.length) {
    params['difficulty'] = f.difficulty.join(',');
  }

  if (f.dogs !== undefined) {
    params['dogs'] = f.dogs ? '1' : '0';
  }

  if (f.children !== undefined) {
    params['children'] = f.children ? '1' : '0';
  }

  return params;
}
