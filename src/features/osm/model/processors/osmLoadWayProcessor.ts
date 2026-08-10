import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
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
      if (isResultLoadingSelector(getState(), osmId)) {
        dispatch(searchUnselectResult(osmId));
      }

      await toastError(err, loadOsmMessages, 'fetchingError');
    }
  },
};
