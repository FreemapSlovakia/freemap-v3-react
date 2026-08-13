import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapOpeningSelector } from '@features/myMaps/model/selectors.js';
import {
  searchSelectResult,
  searchUnselectResult,
} from '@features/search/model/actions.js';
import { isResultLoadingSelector } from '@features/search/model/selectors.js';
import { positionsEqual, shouldBeArea } from '@shared/geoutils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type FeatureId, featureIdsEqual } from '@shared/types/featureId.js';
import { lineString, polygon } from '@turf/helpers';
import { loadOsmMessages } from '../../translations/loadOsmMessages.js';
import { fetchOsmElements } from '../fetchOsmElements.js';
import { osmLoadWay } from '../osmActions.js';
import type { OsmWay } from '../types.js';
import { copyDisplayName } from './copyDisplayName.js';

export const osmLoadWayProcessor: Processor<typeof osmLoadWay> = {
  actionCreator: osmLoadWay,
  handle: async ({ dispatch, getState, action, toastError }) => {
    const { id, focus } = action.payload;

    const osmId: FeatureId = { type: 'osm', elementType: 'way', id };

    // Whether this started as a stand-in for a fetch, as opposed to an element
    // already on the map being upgraded — which decides what a failure means.
    const wasPlaceholder = isResultLoadingSelector(getState(), osmId);

    try {
      trackMatomo(['trackEvent', 'Osm', 'view', 'way']);

      const { elements } = await fetchOsmElements('way', id, {
        getState,
        cancelActions: [clearMapFeatures],
        // Only this element going off the map invalidates its own fetch —
        // other results coming and going alongside it don't.
        stateChangePredicate: (state) =>
          state.search.selectedResults.some((result) =>
            featureIdsEqual(result.id, osmId),
          ),
      });

      const nodes: Record<string, [number, number]> = {};

      let way: OsmWay | undefined;

      // Collect all nodes before resolving the way's geometry so the assembly
      // does not depend on nodes preceding the way in the response.
      for (const item of elements) {
        if (item.type === 'node') {
          nodes[item.id] = [item.lon, item.lat];
        } else if (item.type === 'way') {
          way = item;
        }
      }

      if (!way) {
        return;
      }

      const coordinates = way.nodes.map((ref) => nodes[ref]);

      const tags = way.tags ?? {};

      copyDisplayName(getState().search.selectedResults, osmId, tags);

      dispatch(
        searchSelectResult({
          result: {
            source: 'osm',
            id: osmId,
            geojson:
              positionsEqual(coordinates[0], coordinates.at(-1)) &&
              shouldBeArea(tags)
                ? polygon([coordinates], tags)
                : lineString(coordinates, tags),
          },
          focus,
          tier: 'keep',
          select: false,
        }),
      );
    } catch (err) {
      // Only a placeholder goes: it is nothing but an id, and would sit on the
      // map as an empty result and in the URL as a promise that reloading can't
      // keep. A result that arrived from the list with geometry of its own
      // stays — a failed upgrade is no reason to take away what was picked.
      const placeholder = isResultLoadingSelector(getState(), osmId);

      if (placeholder) {
        dispatch(searchUnselectResult(osmId));
      }

      // Nothing to report where a map answers for the element: one on its way in
      // is about to supply it from its document, and one that landed while the
      // fetch was failing already has — which is why a placeholder that stopped
      // being one counts too. Offline that document is the only thing that can.
      //
      // Only for the elements the URL named (`pin`), which are the ones a map
      // being opened carries: an element the user asked for themselves is theirs
      // to hear about, whatever else happens to be loading at the time.
      if (
        action.payload.pin &&
        (mapOpeningSelector(getState()) || (wasPlaceholder && !placeholder))
      ) {
        return;
      }

      await toastError(err, loadOsmMessages, 'fetchingError');
    }
  },
};
