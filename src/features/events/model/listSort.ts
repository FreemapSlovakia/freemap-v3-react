import { distanceTo } from '@shared/geoutils.js';
import type { LatLon } from '@shared/types/common.js';
import z from 'zod';
import type { EventSummary } from './actions.js';

/** How the layer's event list is ordered; a stat each way, distance from three origins. */
export const EventsListSortSchema = z.enum([
  'date',
  'title',
  'lengthAsc',
  'lengthDesc',
  'ascentAsc',
  'ascentDesc',
  'durationAsc',
  'durationDesc',
  'nearMap',
  'nearHome',
  'nearPlace',
  'interestedDesc',
  'goingDesc',
]);

export type EventsListSort = z.infer<typeof EventsListSortSchema>;

/** What a row of the list may show beside its dates. */
export const EventsListTraitSchema = z.enum([
  'transport',
  'difficulty',
  'dogs',
  'children',
  'length',
  'duration',
  'ascent',
  'organizer',
  'interested',
  'going',
]);

export type EventsListTrait = z.infer<typeof EventsListTraitSchema>;

export const DEFAULT_LIST_TRAITS: EventsListTrait[] = [
  'transport',
  'difficulty',
  'dogs',
  'children',
  'length',
  'interested',
  'going',
];

type Stat = 'length' | 'duration' | 'ascent' | 'interested' | 'going';

/** The stat a sort orders by and which way; rows show it whatever is ticked. */
export const STAT_SORTS: Partial<
  Record<EventsListSort, { stat: Stat; sign: 1 | -1 }>
> = {
  lengthAsc: { stat: 'length', sign: 1 },
  lengthDesc: { stat: 'length', sign: -1 },
  durationAsc: { stat: 'duration', sign: 1 },
  durationDesc: { stat: 'duration', sign: -1 },
  ascentAsc: { stat: 'ascent', sign: 1 },
  ascentDesc: { stat: 'ascent', sign: -1 },
  interestedDesc: { stat: 'interested', sign: -1 },
  goingDesc: { stat: 'going', sign: -1 },
};

const STAT_FIELD = {
  length: 'distance',
  duration: 'duration',
  ascent: 'ascent',
  interested: 'interestedCount',
  going: 'goingCount',
} as const satisfies Record<Stat, keyof EventSummary>;

const NEAR_SORTS = [
  'nearMap',
  'nearHome',
  'nearPlace',
] as const satisfies EventsListSort[];

export type EventsNearSort = (typeof NEAR_SORTS)[number];

export const isNearSort = (sort: EventsListSort): sort is EventsNearSort =>
  (NEAR_SORTS as readonly EventsListSort[]).includes(sort);

/** Where each distance sort measures from; null where it has no origin now. */
export type SortOrigins = Record<EventsNearSort, LatLon | null>;

export type ListedEvent = { event: EventSummary; km?: number };

/** By a stat, those without it last, whichever way. */
const byStat =
  (stat: Stat, sign: 1 | -1) => (a: ListedEvent, b: ListedEvent) => {
    const key = STAT_FIELD[stat];

    const x = a.event[key];

    const y = b.event[key];

    return x === null ? (y === null ? 0 : 1) : y === null ? -1 : sign * (x - y);
  };

/**
 * The events in `sort`'s order, with each one's distance when it orders by
 * one; a distance sort without its origin falls back to the date.
 */
export function sortEvents(
  events: EventSummary[],
  sort: EventsListSort,
  origins: SortOrigins,
  language: string,
): ListedEvent[] {
  const listed: ListedEvent[] = events.map((event) => ({ event }));

  const byDate = (a: ListedEvent, b: ListedEvent) =>
    a.event.startAt.getTime() - b.event.startAt.getTime();

  // Ties, as the many events nobody has marked yet, by date.
  const sorted = (
    list: ListedEvent[],
    by: (a: ListedEvent, b: ListedEvent) => number,
  ) => list.toSorted((a, b) => by(a, b) || byDate(a, b));

  if (sort === 'title') {
    const collator = new Intl.Collator(language);

    return sorted(listed, (a, b) =>
      collator.compare(a.event.title, b.event.title),
    );
  }

  const statSort = STAT_SORTS[sort];

  if (statSort) {
    return sorted(listed, byStat(statSort.stat, statSort.sign));
  }

  const origin = isNearSort(sort) ? origins[sort] : null;

  if (origin) {
    return listed
      .map(({ event }) => ({
        event,
        km: distanceTo(origin, event.startPoint) / 1000,
      }))
      .toSorted((a, b) => a.km - b.km || byDate(a, b));
  }

  return listed.toSorted(byDate);
}
