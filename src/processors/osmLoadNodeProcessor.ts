import { point } from '@turf/helpers';
import { assert } from 'typia';
import { clearMapFeatures } from '../actions/mainActions.js';
import { osmLoadNode } from '../actions/osmActions.js';
import { searchSelectResult } from '../actions/searchActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { OsmNode, OsmResult } from '../types/osm.js';
import { FeatureId } from '../types/featureId.js';
import { copyDisplayName } from '../copyDisplayName.js';

export const osmLoadNodeProcessor: Processor<typeof osmLoadNode> = {
  actionCreator: osmLoadNode,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, action, getState }) => {
    const { id, focus, showToast } = action.payload;

    const res = await httpRequest({
      getState,
      url: `//api.openstreetmap.org/api/0.6/node/${id}.json`,
      expectedStatus: 200,
      cancelActions: [clearMapFeatures, searchSelectResult],
    });

    const { elements } = assert<OsmResult>(await res.json());

    const nodes = (
      elements.filter((el) => el.type === 'node') as OsmNode[]
    ).map((node) => [node.lon, node.lat]);

    const osmId: FeatureId = { type: 'node', id };

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
  },
};
