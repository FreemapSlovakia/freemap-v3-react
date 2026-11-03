import { DIFFICULTIES } from './actions.js';

/** Inclusive; either end may be open. */
export type Range = { min?: number; max?: number };

/**
 * The events layer's filter. `inMapArea` restricts it to the viewport (the bbox
 * is taken when fetching). Ranges are in km, hours and meters, as typed.
 */
export interface EventsFilter {
  from?: Date;
  to?: Date;
  inMapArea?: boolean;
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
  !f.inMapArea &&
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

  if (f.inMapArea) {
    parts.push(['events-in-map-area', '1']);
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
    inMapArea: query['events-in-map-area'] === '1' || undefined,
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

/** The filter as `GET /events` parameters, except the viewport's bbox. */
export function filterToRequest(f: EventsFilter): Record<string, string> {
  const params: Record<string, string> = {};

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
