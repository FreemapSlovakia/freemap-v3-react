import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  searchSelectResult,
  searchUnselectResult,
} from '@features/search/model/actions.js';
import { isResultLoadingSelector } from '@features/search/model/selectors.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type FeatureId, featureIdsEqual } from '@shared/types/featureId.js';
import { point } from '@turf/helpers';
import { loadOsmMessages } from '../../translations/loadOsmMessages.js';
import { fetchOsmElements } from '../fetchOsmElements.js';
import { osmLoadNode } from '../osmActions.js';
import type { OsmNode } from '../types.js';
import { copyDisplayName } from './copyDisplayName.js';

export const osmLoadNodeProcessor: Processor<typeof osmLoadNode> = {
  actionCreator: osmLoadNode,
  handle: async ({ dispatch, action, getState, toastError }) => {
    const { id, focus } = action.payload;

    const osmId: FeatureId = { type: 'osm', elementType: 'node', id };

    try {
      trackMatomo(['trackEvent', 'Osm', 'view', 'node']);

      const { elements } = await fetchOsmElements('node', id, {
        getState,
        cancelActions: [clearMapFeatures],
        // Only this element going off the map invalidates its own fetch —
        // other results coming and going alongside it don't.
        stateChangePredicate: (state) =>
          state.search.selectedResults.some((result) =>
            featureIdsEqual(result.id, osmId),
          ),
      });

      const nodes = elements
        .filter((el): el is OsmNode => el.type === 'node')
        .map((node) => [node.lon, node.lat]);

      const tags = elements[0].tags ?? {};

      copyDisplayName(getState().search.selectedResults, osmId, tags);

      dispatch(
        searchSelectResult({
          result: {
            source: 'osm',
            id: osmId,
            geojson: point(nodes[0], tags),
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
      if (isResultLoadingSelector(getState(), osmId)) {
        dispatch(searchUnselectResult(osmId));
      }

      await toastError(err, loadOsmMessages, 'fetchingError');
    }
  },
};
