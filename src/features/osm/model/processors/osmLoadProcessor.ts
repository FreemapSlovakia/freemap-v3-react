import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapOpeningSelector } from '@features/myMaps/model/selectors.js';
import {
  searchSelectResult,
  searchUnselectResult,
} from '@features/search/model/actions.js';
import { isResultLoadingSelector } from '@features/search/model/selectors.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  featureIdsEqual,
  type OsmFeatureId,
  osmElementTypes,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { loadOsmMessages } from '../../translations/loadOsmMessages.js';
import { assembleOsmGeojson, indexOsmElements } from '../assembleOsmGeojson.js';
import { fetchOsmElements } from '../fetchOsmElements.js';
import { osmLoad } from '../osmActions.js';
import { copyDisplayName } from './copyDisplayName.js';

export const osmLoadProcessor: Processor<typeof osmLoad> = {
  actionCreator: osmLoad,
  handle: async ({ dispatch, action, getState, toastError }) => {
    const { ids, focus, pin } = action.payload;

    if (ids.length === 0) {
      return;
    }

    // Which of them started as stand-ins for a fetch, as opposed to elements
    // already on the map being upgraded — which decides what a failure means.
    const wasPlaceholder = new Set(
      ids
        .filter((id) => isResultLoadingSelector(getState(), id))
        .map(stringifyFeatureId),
    );

    /**
     * Takes the elements that didn't arrive off the map, and reports the
     * failure unless every one of them is a load a map answers for.
     */
    async function fail(failed: OsmFeatureId[], err: unknown) {
      const opening = mapOpeningSelector(getState());

      let report = false;

      for (const id of failed) {
        // Only a placeholder goes: it is nothing but an id, and would sit on the
        // map as an empty result and in the URL as a promise that reloading
        // can't keep. A result that arrived from the list with geometry of its
        // own stays — a failed upgrade is no reason to take away what was
        // picked.
        const placeholder = isResultLoadingSelector(getState(), id);

        if (placeholder) {
          dispatch(searchUnselectResult(id));
        }

        // Nothing to report where a map answers for the element: one on its way
        // in is about to supply it from its document, and one that landed while
        // the fetch was failing already has — which is why a placeholder that
        // stopped being one counts too. Offline that document is the only thing
        // that can.
        //
        // Only for the elements the URL named (`pin`), which are the ones a map
        // being opened carries: an element the user asked for themselves is
        // theirs to hear about, whatever else happens to be loading at the time.
        if (
          !pin ||
          !(
            opening ||
            (wasPlaceholder.has(stringifyFeatureId(id)) && !placeholder)
          )
        ) {
          report = true;
        }
      }

      if (report) {
        await toastError(err, loadOsmMessages, 'fetchingError');
      }
    }

    for (const elementType of osmElementTypes) {
      const count = ids.filter((id) => id.elementType === elementType).length;

      // One event per type rather than per element: a link restoring hundreds
      // of pins is one load, and would otherwise be hundreds of tracker hits.
      if (count > 0) {
        trackMatomo(['trackEvent', 'Osm', 'view', elementType, count]);
      }
    }

    let index;

    try {
      index = indexOsmElements(
        await fetchOsmElements(ids, {
          getState,
          cancelActions: [clearMapFeatures],
          // Only all of them going off the map invalidates the fetch — other
          // results coming and going alongside them don't.
          stateChangePredicate: (state) =>
            ids.some((id) =>
              state.search.selectedResults.some((result) =>
                featureIdsEqual(result.id, id),
              ),
            ),
        }),
      );
    } catch (err) {
      await fail(ids, err);

      return;
    }

    // Elements taken off the map while the batch was in flight are left off:
    // one of them going no longer cancels the fetch (the rest of the batch is
    // still wanted), so what it asked for has to be dropped here instead.
    const stillWanted = ids.filter((id) =>
      getState().search.selectedResults.some((result) =>
        featureIdsEqual(result.id, id),
      ),
    );

    const failed: OsmFeatureId[] = [];

    /**
     * What went wrong for the first element whose geometry didn't add up, which
     * is more telling than the plain "not found" the rest are reported with — a
     * truncated Overpass answer leaves a way without the nodes it is made of,
     * and a way closed on three positions is no polygon.
     */
    let cause: unknown;

    for (const id of stillWanted) {
      let geojson;

      try {
        geojson = assembleOsmGeojson(id, index);
      } catch (err) {
        // One element not adding up is no reason to drop the rest of the batch,
        // which a throw out of this loop would do — placeholders and all.
        cause ??= err;
      }

      if (!geojson) {
        failed.push(id);

        continue;
      }

      copyDisplayName(
        getState().search.selectedResults,
        id,
        geojson.properties,
      );

      dispatch(
        searchSelectResult({
          result: { source: 'osm', id, geojson },
          focus,
          tier: 'keep',
          select: false,
        }),
      );
    }

    if (failed.length > 0) {
      await fail(
        failed,
        cause ??
          new Error(
            `OSM elements not found: ${failed
              .map(({ elementType, id }) => `${elementType} ${id}`)
              .join(', ')}`,
          ),
      );
    }
  },
};
