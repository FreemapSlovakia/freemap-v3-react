import { closeTool } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  type SearchResult,
  searchKeepResults,
  searchSelectResult,
} from '@features/search/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import { point } from '@turf/helpers';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import {
  type ObjectsResult,
  objectsSetFilter,
  objectsShowAsLookup,
} from './actions.js';

/**
 * How many objects can be handed over at once. Each becomes a kept result the
 * URL names separately, so what limits this is the length of the link — the
 * reload behind it is one batched Overpass query however many there are.
 */
const MAX_LOOKUPS = 500;

function toResult(object: ObjectsResult): SearchResult {
  return {
    source: 'osm',
    id: object.id,
    // The point the marker sits at, so the geometry behind it is fetched when it
    // is looked at and not before — a screenful of objects would otherwise be
    // hundreds of ways and relations resolved down to their nodes for nothing.
    geojson: point([object.coords.lon, object.coords.lat], object.tags),
    incomplete: true,
  };
}

/**
 * Shows objects as lookup results.
 *
 * One object is shown the way a result picked from the list is — it becomes the
 * one being looked at, and the rest of the objects are untouched. All of them
 * are instead handed over for good: they arrive kept, none of them transient,
 * and the objects go with the predicate that fetched them. Leaving it set would
 * fetch them again on the next pan and draw them over what they became.
 */
export const objectsLookupProcessor: Processor<typeof objectsShowAsLookup> = {
  actionCreator: objectsShowAsLookup,
  handle: async ({ getState, dispatch, action }) => {
    const { objects } = getState().objects;

    const { id } = action.payload;

    if (id) {
      const object = objects.find((o) => featureIdsEqual(o.id, id));

      if (object) {
        dispatch(searchSelectResult({ result: toResult(object) }));
      }

      return;
    }

    if (objects.length === 0) {
      return;
    }

    if (objects.length > MAX_LOOKUPS) {
      dispatch(
        toastsAdd({
          id: 'objects.tooManyForLookup',
          messageKey: 'tooManyForLookup',
          messageLoader: loadObjectsMessages,
          messageParams: { count: objects.length, limit: MAX_LOOKUPS },
          style: 'warning',
          timeout: 5000,
        }),
      );

      return;
    }

    dispatch(searchKeepResults(objects.map(toResult)));

    dispatch(objectsSetFilter([]));

    dispatch(closeTool('objects'));
  },
};
