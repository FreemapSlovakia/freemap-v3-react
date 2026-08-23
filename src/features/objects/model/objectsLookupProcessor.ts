import { closeTool } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  type SearchResult,
  searchKeepResult,
  searchKeepResults,
  searchSelectResult,
} from '@features/search/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import {
  type ObjectsResult,
  objectsSetFilter,
  objectsShowAsLookup,
} from './actions.js';
import { objectToSearchResult } from './objectToSearchResult.js';

/**
 * How many objects can be handed over at once. Each becomes a kept result the
 * URL names separately, so what limits this is the length of the link — the
 * reload behind it is one batched Overpass query however many there are.
 */
const MAX_LOOKUPS = 500;

function toResult(object: ObjectsResult): SearchResult {
  // Kept on the map, so the geometry behind the marker is still to be fetched.
  return { ...objectToSearchResult(object), incomplete: true };
}

/**
 * Shows objects as lookup results.
 *
 * One object becomes a kept result — asked for rather than merely looked at, so
 * it stays until it is taken off — and the rest of the objects are untouched.
 * All of them are instead handed over for good: they arrive kept, none of them
 * transient, and the objects go with the predicate that fetched them. Leaving it
 * set would fetch them again on the next pan and draw them over what they
 * became.
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

        dispatch(searchKeepResult(object.id));
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
