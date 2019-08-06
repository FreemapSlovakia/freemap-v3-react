import { point } from '@turf/helpers';

import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toNodes } from 'fm3/logic/osmUtils.js';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { osmLoadNode } from 'fm3/actions/osmActions';
import { httpRequest } from 'fm3/authAxios';
import { dispatchAxiosErrorAsToast } from './utils';

export const osmLoadNodeProcessor: IProcessor = {
  actionCreator: osmLoadNode,
  handle: async ({ dispatch, getState }) => {
    try {
      const { data } = await httpRequest({
        getState,
        method: 'GET',
        url: `//api.openstreetmap.org/api/0.6/node/${
          getState().trackViewer.osmNodeId
        }`,
        responseType: 'document',
        expectedStatus: 200,
      });

      if (!(data instanceof Document)) {
        throw new Error('not a document');
      }

      const nodes = toNodes(data);

      dispatch(
        trackViewerSetData({
          trackGeojson: {
            type: 'FeatureCollection',
            features: Object.keys(nodes).map(id => point(nodes[id])),
          },
          startPoints: [],
          finishPoints: [],
        }),
      );
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'osm.fetchingError', err);
    }
  },
};
