import { point } from '@turf/helpers';
import { osmLoadNode } from 'fm3/actions/osmActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OsmNode, OsmResult } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const osmLoadNodeProcessor: Processor = {
  actionCreator: osmLoadNode,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `//api.openstreetmap.org/api/0.6/node/${
        getState().trackViewer.osmNodeId
      }`,
      expectedStatus: 200,
    });

    const nodes = (
      assertType<OsmResult>(data).elements.filter(
        (el) => el.type === 'node',
      ) as OsmNode[]
    ).map((node) => [node.lon, node.lat]);

    dispatch(
      trackViewerSetData({
        trackGeojson: {
          type: 'FeatureCollection',
          features: nodes.map((node) => point(node)),
        },
      }),
    );
  },
};
