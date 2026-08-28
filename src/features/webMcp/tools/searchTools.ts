import {
  type SearchResult,
  searchClear,
  searchSelectResult,
  searchSetQuery,
} from '@features/search/model/actions.js';
import { resultCoords } from '@features/search/model/resultUtils.js';
import { stringifyFeatureId } from '@shared/types/featureId.js';
import z from 'zod';
import { defineTool } from '../tool.js';
import { waitForState } from '../waitForState.js';

function describeResult(result: SearchResult, index: number) {
  const coords = resultCoords(result);

  return {
    index,
    name:
      result.displayName ?? result.genericName ?? stringifyFeatureId(result.id),
    kind: result.genericName,
    address: result.address,
    lat: coords?.lat,
    lon: coords?.lon,
    source: result.source,
  };
}

export const searchTools = [
  defineTool({
    name: 'search-places',
    description:
      'Searches for a place by name, category, OSM element id (e.g. "way/123"), coordinates, a bounding box or pasted GeoJSON, and fills the app\'s result list. Results are ranked around the current map view. Show one on the map with show-search-result.',
    input: z.object({
      query: z.string().min(1).describe('What to look for.'),
      limit: z.number().int().min(1).max(50).optional(),
    }),
    async execute({ query, limit }, { store, signal }) {
      const before = store.getState().search.results;

      store.dispatch(searchSetQuery({ query, limit }));

      const results = await waitForState(
        store,
        (state) =>
          state.search.query === query &&
          state.search.results !== before &&
          state.search.results,
        { signal },
      );

      return {
        query,
        results: results.map(describeResult),
        more: store.getState().search.more,
      };
    },
  }),

  defineTool({
    name: 'show-search-result',
    description:
      'Draws one result of the last search-places on the map and moves the map to it.',
    input: z.object({
      index: z
        .number()
        .int()
        .min(0)
        .describe("The result's index as search-places returned it."),
    }),
    execute({ index }, { store }) {
      const result = store.getState().search.results[index];

      if (!result) {
        throw new Error(`There is no result ${index} in the current list.`);
      }

      store.dispatch(searchSelectResult({ result, focus: true, tier: 'keep' }));

      return describeResult(result, index);
    },
  }),

  defineTool({
    name: 'clear-search-results',
    description: 'Takes the searched places off the map and empties the list.',
    input: z.object({}),
    execute(_args, { store }) {
      store.dispatch(searchClear());
    },
  }),
];
