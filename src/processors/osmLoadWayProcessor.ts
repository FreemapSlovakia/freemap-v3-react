import { lineString } from '@turf/helpers';
import { osmLoadWay } from 'fm3/actions/osmActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OsmResult } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const osmLoadWayProcessor: Processor = {
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
    });

    const nodes: Record<string, [number, number]> = {};

    const ways: Record<string, [number, number][]> = {};

    for (const item of assertType<OsmResult>(data).elements) {
      if (item.type === 'node') {
        nodes[item.id] = [item.lon, item.lat];
      } else if (item.type === 'way') {
        ways[item.id] = item.nodes.map((ref) => nodes[ref]);
      }
    }

    dispatch(
      trackViewerSetData({
        trackGeojson: {
          type: 'FeatureCollection',
          features: Object.keys(ways).map((id) => lineString(ways[id])),
        },
        startPoints: [],
        finishPoints: [],
      }),
    );
  },
};
