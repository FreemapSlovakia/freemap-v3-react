import { point } from '@turf/helpers';
import { assert } from 'typia';
import { clearMapFeatures } from '../actions/mainActions.js';
import { osmLoadNode } from '../actions/osmActions.js';
import { searchSelectResult } from '../actions/searchActions.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { OsmNode, OsmResult } from '../types/osm.js';

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

    const tags: Record<string, string> = elements[0].tags ?? {};

    const nodes = (
      elements.filter((el) => el.type === 'node') as OsmNode[]
    ).map((node) => [node.lon, node.lat]);

    dispatch(
      searchSelectResult({
        result: {
          osmType: 'node',
          id,
          geojson: point(nodes[0], tags),
          tags,
          detailed: true,
        },
        showToast: showToast || window.isRobot,
        focus,
      }),
    );
  },
};
