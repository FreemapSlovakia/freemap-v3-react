import type { FeatureId } from '@shared/types/featureId.js';
import { describe, expect, it } from 'vitest';
import type { SearchResult } from './actions.js';
import type { SearchState } from './reducer.js';
import { savedSearchResultsFromState } from './savedSearchResults.js';

const result = (id: FeatureId, over: Partial<SearchResult> = {}) =>
  ({
    source: 'osm',
    id,
    geojson: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [17, 48] },
      properties: {},
    },
    ...over,
  }) as SearchResult;

const osmId = (id: number) =>
  ({ type: 'osm', elementType: 'node', id }) as const;

const state = (over: Partial<SearchState>): SearchState =>
  ({
    selectedResults: [],
    previewId: null,
    ...over,
  }) as SearchState;

describe('savedSearchResultsFromState — what a map stores of its pins', () => {
  it('stores the kept results', () => {
    const stored = savedSearchResultsFromState(
      state({ selectedResults: [result(osmId(1)), result(osmId(2))] }),
    );

    expect(stored.map((r) => r.id)).toEqual([osmId(1), osmId(2)]);
  });

  it('leaves out the result being looked at', () => {
    const stored = savedSearchResultsFromState(
      state({
        selectedResults: [result(osmId(1)), result(osmId(2))],
        previewId: osmId(2),
      }),
    );

    expect(stored.map((r) => r.id)).toEqual([osmId(1)]);
  });

  it('leaves out a result standing in for a fetch in flight', () => {
    const stored = savedSearchResultsFromState(
      state({
        selectedResults: [
          result(osmId(1), { loading: true }),
          result(osmId(2)),
        ],
      }),
    );

    expect(stored.map((r) => r.id)).toEqual([osmId(2)]);
  });

  it('stores what the URL cannot name — the only thing that carries it', () => {
    const stored = savedSearchResultsFromState(
      state({
        selectedResults: [
          result(
            { type: 'other', id: 7 },
            { source: 'nominatim-forward', displayName: 'Ganek' },
          ),
        ],
      }),
    );

    expect(stored).toHaveLength(1);
    expect(stored[0]?.displayName).toBe('Ganek');
  });

  it('keeps the in-flight flag off the wire even when it is set false', () => {
    const [stored] = savedSearchResultsFromState(
      state({
        selectedResults: [result(osmId(1), { loading: false as never })],
      }),
    );

    expect(stored).not.toHaveProperty('loading');
  });
});
