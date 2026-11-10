import type { RootState } from '@app/store/store.js';
import {
  minQueryLength,
  suggestDelayMs,
} from '@features/search/components/searchInput.js';
import { useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import z from 'zod';
import { type EventSummary, EventSummarySchema } from './model/actions.js';
import { filterToRequest } from './model/filter.js';

/** How many the search box lists. */
const LIMIT = 5;

const NONE: EventSummary[] = [];

/**
 * The upcoming events whose title holds the query's words, nearest to the
 * map's center first. A failed request lists none: the section is extra.
 */
export function useEventMatches(query: string): EventSummary[] {
  const trimmed = query.trim();

  const worthAsking = trimmed.length >= minQueryLength;

  const store = useStore<RootState>();

  // The last answer stays up until the next replaces it, as the places do.
  const [events, setEvents] = useState(NONE);

  useEffect(() => {
    // Gone with the query, as the places are.
    if (!worthAsking) {
      setEvents(NONE);

      return;
    }

    // Not `httpRequest`, which takes no signal for the next keystroke's abort.
    const ac = new AbortController();

    // Its own request, not the geocoder's: a slow one holds nothing up.
    const timeout = setTimeout(async () => {
      const { lat, lon } = store.getState().map;

      const params = new URLSearchParams({
        // Not ended yet, as the layer's list has it.
        ...filterToRequest({}),
        // As much as the API takes.
        q: trimmed.slice(0, 100),
        // Leaflet doesn't wrap a center panned past the antimeridian.
        near: `${lat},${((((lon + 180) % 360) + 360) % 360) - 180}`,
        sort: 'near',
        limit: String(LIMIT),
        summary: '1',
      });

      let found = NONE;

      try {
        const res = await fetch(`${process.env['API_URL']}/events?${params}`, {
          signal: ac.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        found = z
          .array(EventSummarySchema)
          .parse(await res.json())
          .slice(0, LIMIT);
      } catch (err) {
        // Aborted by the next keystroke.
        if (ac.signal.aborted) {
          return;
        }

        console.warn('Event search failed', err);
      }

      setEvents(found);
    }, suggestDelayMs);

    return () => {
      clearTimeout(timeout);

      ac.abort();
    };
  }, [trimmed, worthAsking, store]);

  return worthAsking ? events : NONE;
}
