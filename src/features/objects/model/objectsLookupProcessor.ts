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
 * How many objects can be handed over at once. Each becomes a kept result,
 * which the URL names one by one and reloads one by one — a screenful of them
 * (Overpass answers up to some four hundred) would be a hash of several
 * kilobytes and a request per object for whoever opens the link.
 */
const MAX_LOOKUPS = 50;

function toResult(object: ObjectsResult): SearchResult {
  return {
    source: 'osm',
    id: object.id,
    // The point the marker sits at, so the element behind it is fetched when it
    // is looked at and not before: for a whole screenful that would be an OSM
    // request per object, and there can be hundreds.
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
