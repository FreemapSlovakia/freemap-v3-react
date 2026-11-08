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
  'nearMap',
  'nearHome',
  'nearPlace',
]);

export type EventsListSort = z.infer<typeof EventsListSortSchema>;

/** Where each distance sort measures from; null where it has no origin now. */
export type SortOrigins = {
  nearMap: LatLon;
  nearHome: LatLon | null;
  nearPlace: LatLon | null;
};

export type ListedEvent = { event: EventSummary; km?: number };

/** By a stat, those without it last, whichever way. */
const byStat =
  (key: 'distance' | 'ascent', sign: 1 | -1) =>
  (a: ListedEvent, b: ListedEvent) => {
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

  switch (sort) {
    case 'title': {
      const collator = new Intl.Collator(language);

      return listed.toSorted((a, b) =>
        collator.compare(a.event.title, b.event.title),
      );
    }

    case 'lengthAsc':
      return listed.toSorted(byStat('distance', 1));

    case 'lengthDesc':
      return listed.toSorted(byStat('distance', -1));

    case 'ascentAsc':
      return listed.toSorted(byStat('ascent', 1));

    case 'ascentDesc':
      return listed.toSorted(byStat('ascent', -1));

    case 'nearMap':
    case 'nearHome':
    case 'nearPlace': {
      const origin = origins[sort];

      if (!origin) {
        return listed.toSorted(byDate);
      }

      return listed
        .map(({ event }) => ({
          event,
          km: distanceTo(origin, event.startPoint) / 1000,
        }))
        .toSorted((a, b) => a.km - b.km);
    }

    default:
      return listed.toSorted(byDate);
  }
}
