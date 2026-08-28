import { openTool } from '@app/store/actions.js';
import { objectsSetFilter } from '@features/objects/model/actions.js';
import { objectCategories } from '@features/objects/objectCategories.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { searchSetQuery } from '@features/search/model/actions.js';
import { getOsmMapping } from '@osm/osmNameResolver.js';
import { removeAccents } from '@shared/stringUtils.js';
import z from 'zod';
import { defineTool } from '../tool.js';
import { waitForState } from '../waitForState.js';

/** Categories are in the thousands; a listing names at most this many. */
const MAX_CATEGORIES = 60;

const MAX_OBJECTS = 50;

/** Stands for "nothing here" — a truthy value the wait can resolve with. */
const EMPTY: SearchResult[] = [];

export const objectTools = [
  defineTool({
    name: 'list-object-categories',
    description:
      'Finds the POI categories the objects tool can show — search them by name in the UI language ("water", "shelter", "castle"). Each row carries the filter that show-objects takes.',
    input: z.object({
      search: z
        .string()
        .optional()
        .describe('Part of a category name; omitted lists the first ones.'),
    }),
    async execute({ search }, { store }) {
      const categories = objectCategories(
        await getOsmMapping(store.getState().l10n.language),
      ).filter((category) => category.name);

      const needle = search && removeAccents(search.trim().toLowerCase());

      const matching = needle
        ? categories.filter((category) =>
            removeAccents(category.name.toLowerCase()).includes(needle),
          )
        : categories;

      return {
        categories: matching
          .slice(0, MAX_CATEGORIES)
          .map((category) => ({ name: category.name, filter: category.key })),
        omitted: Math.max(0, matching.length - MAX_CATEGORIES),
      };
    },
  }),

  defineTool({
    name: 'show-objects',
    description:
      'Shows POIs of the given categories (filters from list-object-categories) within the current map view, and returns what was found. The map has to be at zoom 10 or closer, and a wide view finds a lot — zoom in on what is being asked about first.',
    input: z.object({
      categories: z
        .array(z.string())
        .min(1)
        .describe('Filters as list-object-categories gives them.'),
    }),
    async execute({ categories }, { store, signal }) {
      store.dispatch(openTool('objects'));

      // The fetch is edge-triggered on the categories and the map position, so
      // re-asking for the categories already active would fetch nothing and
      // leave the wait to time out — or, after the map moved, answer with what
      // the previous view held. Clearing first makes every call a real fetch.
      if (store.getState().objects.active.length > 0) {
        store.dispatch(objectsSetFilter([]));
      }

      store.dispatch(objectsSetFilter(categories));

      const before = store.getState().objects.objects;

      const objects = await waitForState(
        store,
        (state) => state.objects.objects !== before && state.objects.objects,
        { signal },
      );

      if (store.getState().map.zoom < 10) {
        throw new Error(
          'The map is zoomed too far out to look for objects; zoom in to at least 10.',
        );
      }

      return {
        objects: objects.slice(0, MAX_OBJECTS).map((object) => ({
          name: object.tags['name'],
          lat: object.coords.lat,
          lon: object.coords.lon,
          tags: object.tags,
        })),
        omitted: Math.max(0, objects.length - MAX_OBJECTS),
      };
    },
  }),

  defineTool({
    name: 'describe-place',
    description:
      'Says what is at a point on the map: the nearest addressable place, the OSM elements right there, and the areas containing it. Shows them on the map as it does.',
    input: z.object({
      lat: z.number().min(-90).max(90),
      lon: z.number().min(-180).max(180),
    }),
    async execute({ lat, lon }, { store, signal }) {
      const query = `@${lat},${lon}`;

      const before = store.getState().search.results;

      // A point with nothing on it is answered with a `warning` toast and no
      // results at all, which is an answer rather than a failure.
      const knownToasts = new Set(
        Object.values(store.getState().toasts.toasts),
      );

      store.dispatch(searchSetQuery({ query }));

      const results = await waitForState(
        store,
        (state) =>
          state.search.query === query &&
          ((state.search.results !== before && state.search.results) ||
            (Object.values(state.toasts.toasts).some(
              (toast) => toast.style !== 'danger' && !knownToasts.has(toast),
            ) &&
              EMPTY)),
        { signal },
      );

      return {
        found: results.map((result) => ({
          name: result.displayName ?? result.genericName,
          kind: result.genericName,
          source: result.source,
          tags:
            result.geojson.type === 'Feature'
              ? result.geojson.properties
              : undefined,
        })),
      };
    },
  }),
];
