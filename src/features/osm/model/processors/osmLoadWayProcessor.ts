import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { positionsEqual, shouldBeArea } from '@shared/geoutils.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { FeatureId } from '@shared/types/featureId.js';
import { lineString, polygon } from '@turf/helpers';
import { loadOsmMessages } from '../../translations/loadOsmMessages.js';
import { fetchOsmElements } from '../fetchOsmElements.js';
import { osmLoadWay } from '../osmActions.js';
import type { OsmWay } from '../types.js';
import { copyDisplayName } from './copyDisplayName.js';

export const osmLoadWayProcessor: Processor<typeof osmLoadWay> = {
  actionCreator: osmLoadWay,
  handle: async ({ dispatch, getState, action, toastError }) => {
    try {
      const { id, focus, showToast } = action.payload;

      trackMatomo(['trackEvent', 'Osm', 'view', 'way']);

      const { elements } = await fetchOsmElements('way', id, {
        getState,
        cancelActions: [clearMapFeatures, searchSelectResult],
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

      const osmId: FeatureId = { type: 'osm', elementType: 'way', id };

      const tags = way.tags ?? {};

      copyDisplayName(getState().search.selectedResult, osmId, tags);

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
          showToast: showToast || window.isRobot,
          focus,
        }),
      );
    } catch (err) {
      await toastError(err, loadOsmMessages, 'fetchingError');
    }
  },
};
