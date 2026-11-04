import color from 'color';
import z from 'zod';
import type { Difficulty, EventItem } from './actions.js';

export const EventsColorizeBySchema = z.enum([
  'when',
  'mine',
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
    half: 7 * DAY_MS,
    colorAt: soonColor,
    ticks: [0, 1, 3, 7, 14, 30, 90],
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

/** Started and not over; one with no end lasts the day it starts. */
function isHappening(event: EventItem, now: number) {
  const start = event.startAt.getTime();

  const end = event.endAt?.getTime() ?? new Date(start).setHours(24, 0, 0, 0);

  return start <= now && now < end;
}

export function mineCategory(
  event: EventItem,
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

/** The marker's colour under a mode. */
export function eventColor(
  event: EventItem,
  by: EventsColorizeBy | null,
  userId: number | undefined,
  now: number,
): string {
  switch (by) {
    case null:
      return EVENT_COLOR;

    case 'when': {
      if (isHappening(event, now)) {
        return HAPPENING_COLOR;
      }

      const ahead = event.startAt.getTime() - now;

      return ahead < 0 ? MUTED_COLOR : stat(EVENT_SCALES.when, ahead);
    }

    case 'mine':
      return MINE_COLORS[mineCategory(event, userId)];

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
