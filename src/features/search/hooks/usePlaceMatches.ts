import type { SavedPlace } from '@features/homeLocation/useSavedPlaces.js';
import { matchLabel } from '@shared/labelMatch.js';
import { useMemo } from 'react';

export type PlaceMatch = {
  place: SavedPlace;
  /** Indexes into the name of the characters the query matched. */
  positions: number[];
};

/** The places by name, best first; all of them, in order, for no query. */
export function usePlaceMatches(
  query: string,
  places: SavedPlace[],
): PlaceMatch[] {
  return useMemo(() => {
    if (window.fmEmbedded) {
      return [];
    }

    // Only an empty box lists them all; blanks match nothing.
    if (!query) {
      return places.map((place) => ({ place, positions: [] }));
    }

    return places
      .flatMap((place) => {
        const hit = matchLabel(query, place.label, undefined);

        return hit ? [{ place, ...hit }] : [];
      })
      .sort((a, b) => b.score - a.score)
      .map(({ place, positions }) => ({ place, positions }));
  }, [query, places]);
}
