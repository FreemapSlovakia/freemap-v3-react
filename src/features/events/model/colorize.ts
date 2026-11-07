import type { TransportTypeMsgKey } from '@shared/transportTypeDefs.js';
import color from 'color';
import z from 'zod';
import type { Difficulty, EventSummary } from './actions.js';

export const EventsColorizeBySchema = z.enum([
  'when',
  'mine',
  'transport',
  'distance',
  'duration',
  'ascent',
  'difficulty',
  'dogs',
  'children',
]);

export type EventsColorizeBy = z.infer<typeof EventsColorizeBySchema>;

/** Every marker, with no colorize mode. */
export const EVENT_COLOR = '#6f42c1';

/** Ended, or no value for the mode. */
export const MUTED_COLOR = '#888';

export const HAPPENING_COLOR = '#198754';

const YES_COLOR = '#198754';

const NO_COLOR = '#dc3545';

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#198754',
  moderate: '#0d6efd',
  demanding: '#dc3545',
  expert: '#212529',
};

export const MINE_COLORS = {
  mine: '#fd7e14',
  going: '#198754',
  interested: '#0dcaf0',
  others: MUTED_COLOR,
} as const;

export type MineCategory = keyof typeof MINE_COLORS;

/** By family: walking greens, cycling blues, motor reds. */
export const TRANSPORT_COLORS: Partial<Record<TransportTypeMsgKey, string>> = {
  hiking: '#198754',
  easyhike: '#20c997',
  foot: '#5c8a1e',
  stroller: '#a3c94a',
  bike: '#0d6efd',
  ebike: '#6ea8fe',
  gravelbike: '#0dcaf0',
  mtb: '#084298',
  racingbike: '#3d5afe',
  car: '#dc3545',
  car4wd: '#8b1e2b',
  carnotoll: '#fd7e14',
  motorcycle: '#d63384',
};

/** An event naming more than one transport. */
export const SEVERAL_TRANSPORTS_COLOR = EVENT_COLOR;

export const YES_NO_COLORS = {
  yes: YES_COLOR,
  no: NO_COLOR,
  unsaid: MUTED_COLOR,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A gradient mode's curve, `v / (v + half)` stretched so the last tick ends
 * the scale: fine where values are common, and anything beyond the last tick
 * takes the end colour.
 */
export type EventScale = {
  /** Where the curve, before stretching, is at its middle. */
  half: number;
  colorAt: (t: number) => string;
  /** Tick values, in the unit the legend labels them in; the last ends the scale. */
  ticks: number[];
  /** Stored unit per legend unit (m per km, s per h, ms per day). */
  factor: number;
};

const curve = (scale: EventScale, value: number) =>
  Math.max(0, value) / (Math.max(0, value) + scale.half);

const curveMax = (scale: EventScale) =>
  curve(scale, scale.ticks.at(-1)! * scale.factor);

export const tOf = (scale: EventScale, value: number) =>
  Math.min(1, curve(scale, value) / curveMax(scale));

export const valueAt = (scale: EventScale, t: number) => {
  const c = t * curveMax(scale);

  return (scale.half * c) / (1 - c);
};

/** Short to long, green to red. */
const statColor = (t: number) => color.hsl(120 * (1 - t), 80, 40).hex();

/** Soon in orange, fading to the events' own purple further off. */
const soonColor = (t: number) =>
  color('#fd7e14').mix(color(EVENT_COLOR), t).hex();

export const EVENT_SCALES = {
  when: {
    half: 30 * DAY_MS,
    colorAt: soonColor,
    // Up to a year: harvested calendars list events months ahead.
    ticks: [0, 3, 7, 14, 30, 90, 365],
    factor: DAY_MS,
  },
  distance: {
    half: 15_000,
    colorAt: statColor,
    ticks: [0, 5, 10, 20, 50],
    factor: 1000,
  },
  duration: {
    half: 5 * 3600,
    colorAt: statColor,
    ticks: [0, 1, 2, 4, 8, 24],
    factor: 3600,
  },
  ascent: {
    half: 800,
    colorAt: statColor,
    ticks: [0, 250, 500, 1000, 2000],
    factor: 1,
  },
} satisfies Record<string, EventScale>;

/** A date-only event's day (its UTC date) at the viewer's local midnight. */
const localMidnight = (d: Date) =>
  new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/**
 * Its start and end by the viewer's clock; one with no end, or no times,
 * lasts its last day through.
 */
export function spanOf(
  event: Pick<EventSummary, 'startAt' | 'endAt' | 'dateOnly'>,
): [number, number] {
  if (event.dateOnly) {
    return [
      localMidnight(event.startAt).getTime(),
      localMidnight(event.endAt ?? event.startAt).setHours(24, 0, 0, 0),
    ];
  }

  const start = event.startAt.getTime();

  return [
    start,
    event.endAt?.getTime() ?? new Date(start).setHours(24, 0, 0, 0),
  ];
}

export function mineCategory(
  event: EventSummary,
  userId: number | undefined,
): MineCategory {
  return userId !== undefined && event.userId === userId
    ? 'mine'
    : (event.myParticipation ?? 'others');
}

const yesNo = (value: boolean | null) =>
  YES_NO_COLORS[value === null ? 'unsaid' : value ? 'yes' : 'no'];

const stat = (scale: EventScale, value: number | null) =>
  value === null ? MUTED_COLOR : scale.colorAt(tOf(scale, value));

const MINE_RANK: Record<MineCategory, number> = {
  mine: 3,
  going: 2,
  interested: 1,
  others: 0,
};

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  easy: 4,
  moderate: 3,
  demanding: 2,
  expert: 1,
};

/** How high its marker stacks under a mode; what the mode greys out lowest. */
function stackRank(
  event: EventSummary,
  by: EventsColorizeBy | null,
  userId: number | undefined,
  now: number,
): number {
  switch (by) {
    case null:
      return 0;

    case 'when': {
      const [start, end] = spanOf(event);

      return start <= now && now < end ? 2 : start > now ? 1 : 0;
    }

    case 'mine':
      return MINE_RANK[mineCategory(event, userId)];

    case 'transport':
      return event.transports.length ? 1 : 0;

    case 'distance':
    case 'duration':
    case 'ascent':
      return event[by] === null ? -Infinity : -event[by];

    case 'difficulty':
      return event.difficulty ? DIFFICULTY_RANK[event.difficulty] : 0;

    case 'dogs':
    case 'children':
      return event[by] === null ? 0 : event[by] ? 2 : 1;
  }
}

/**
 * The events bottom to top as their markers stack: by what the mode shows
 * (mine over others, shorter over longer, the unsaid lowest), then the earlier
 * over the later.
 */
export function stackOrder<T extends EventSummary>(
  events: T[],
  by: EventsColorizeBy | null,
  userId: number | undefined,
  now: number,
): T[] {
  // Ranked once each, not on every comparison.
  return events
    .map((event) => ({ event, rank: stackRank(event, by, userId, now) }))
    .toSorted(
      (a, b) =>
        a.rank - b.rank ||
        b.event.startAt.getTime() - a.event.startAt.getTime(),
    )
    .map(({ event }) => event);
}

/** The marker's colour under a mode. */
export function eventColor(
  event: EventSummary,
  by: EventsColorizeBy | null,
  userId: number | undefined,
  now: number,
): string {
  switch (by) {
    case null:
      return EVENT_COLOR;

    case 'when': {
      const [start, end] = spanOf(event);

      if (start <= now && now < end) {
        return HAPPENING_COLOR;
      }

      const ahead = start - now;

      return ahead < 0 ? MUTED_COLOR : stat(EVENT_SCALES.when, ahead);
    }

    case 'mine':
      return MINE_COLORS[mineCategory(event, userId)];

    case 'transport':
      return event.transports.length > 1
        ? SEVERAL_TRANSPORTS_COLOR
        : (TRANSPORT_COLORS[event.transports[0] as TransportTypeMsgKey] ??
            MUTED_COLOR);

    case 'distance':
    case 'duration':
    case 'ascent':
      return stat(EVENT_SCALES[by], event[by]);

    case 'difficulty':
      return event.difficulty
        ? DIFFICULTY_COLORS[event.difficulty]
        : MUTED_COLOR;

    case 'dogs':
    case 'children':
      return yesNo(event[by]);
  }
}
