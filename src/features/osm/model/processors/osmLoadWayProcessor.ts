import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { positionsEqual, shouldBeArea } from '@shared/geoutils.js';
import { FeatureId } from '@shared/types/featureId.js';
import { lineString, polygon } from '@turf/helpers';
import { loadOsmMessages } from '../../translations/loadOsmMessages.js';
import { osmLoadWay } from '../osmActions.js';
import { OsmResultSchema } from '../types.js';
import { copyDisplayName } from './copyDisplayName.js';

export const osmLoadWayProcessor: Processor<typeof osmLoadWay> = {
  actionCreator: osmLoadWay,
  handle: async ({ dispatch, getState, action, toastError }) => {
    try {
      const { id, focus, showToast } = action.payload;

      window._paq.push(['trackEvent', 'Osm', 'view', 'way']);

      const res = await httpRequest({
        getState,
        url: `//api.openstreetmap.org/api/0.6/way/${id}/full.json`,
        expectedStatus: 200,
        cancelActions: [clearMapFeatures, searchSelectResult],
      });

      const nodes: Record<string, [number, number]> = {};

      const { elements } = OsmResultSchema.parse(await res.json());

      for (const item of elements) {
        if (item.type === 'node') {
          nodes[item.id] = [item.lon, item.lat];
        } else if (item.type === 'way') {
          const coordinates = item.nodes.map((ref) => nodes[ref]);

          const osmId: FeatureId = { type: 'osm', elementType: 'way', id };

          const tags = item.tags ?? {};

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
        }
      }
    } catch (err) {
      await toastError(err, loadOsmMessages, 'fetchingError');
    }
  },
};
