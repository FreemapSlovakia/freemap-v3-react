import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { FeatureId } from '@shared/types/featureId.js';
import { point } from '@turf/helpers';
import { loadOsmMessages } from '../../translations/loadOsmMessages.js';
import { osmLoadNode } from '../osmActions.js';
import { type OsmNode, OsmResultSchema } from '../types.js';
import { copyDisplayName } from './copyDisplayName.js';

export const osmLoadNodeProcessor: Processor<typeof osmLoadNode> = {
  actionCreator: osmLoadNode,
  handle: async ({ dispatch, action, getState, toastError }) => {
    try {
      const { id, focus, showToast } = action.payload;

      trackMatomo(['trackEvent', 'Osm', 'view', 'node']);

      const res = await httpRequest({
        getState,
        url: `//api.openstreetmap.org/api/0.6/node/${id}.json`,
        expectedStatus: 200,
        cancelActions: [clearMapFeatures, searchSelectResult],
      });

      const { elements } = OsmResultSchema.parse(await res.json());

      const nodes = elements
        .filter((el): el is OsmNode => el.type === 'node')
        .map((node) => [node.lon, node.lat]);

      const osmId: FeatureId = { type: 'osm', elementType: 'node', id };

      const tags = elements[0].tags ?? {};

      copyDisplayName(getState().search.selectedResult, osmId, tags);

      dispatch(
        searchSelectResult({
          result: {
            source: 'osm',
            id: osmId,
            geojson: point(nodes[0], tags),
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
