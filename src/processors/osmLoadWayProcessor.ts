import { lineString } from '@turf/helpers';

import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { toNodes, toWays } from 'fm3/osmUtils';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { osmLoadWay } from 'fm3/actions/osmActions';
import { httpRequest } from 'fm3/authAxios';

export const osmLoadWayProcessor: IProcessor = {
  actionCreator: osmLoadWay,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `//api.openstreetmap.org/api/0.6/way/${
        getState().trackViewer.osmWayId
      }/full`,
      expectedStatus: 200,
      responseType: 'document',
    });

    if (!(data instanceof Document)) {
      throw new Error('not a document');
    }

    const ways = toWays(data, toNodes(data));

    dispatch(
      trackViewerSetData({
        trackGeojson: {
          type: 'FeatureCollection',
          features: Object.keys(ways).map(id => lineString(ways[id])),
        },
        startPoints: [],
        finishPoints: [],
      }),
    );
  },
};
