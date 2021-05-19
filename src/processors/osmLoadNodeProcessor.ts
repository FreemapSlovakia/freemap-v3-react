import { osmLoadNode } from 'fm3/actions/osmActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OsmNode, OsmResult } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const osmLoadNodeProcessor: Processor<typeof osmLoadNode> = {
  actionCreator: osmLoadNode,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, action, getState }) => {
    const id = action.payload;

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `//api.openstreetmap.org/api/0.6/node/${id}`,
      expectedStatus: 200,
    });

    const { elements } = assertType<OsmResult>(data);

    const tags: Record<string, string> | undefined = elements[0].tags;

    const nodes = (
      elements.filter((el) => el.type === 'node') as OsmNode[]
    ).map((node) => [node.lon, node.lat]);

    dispatch(
      searchSelectResult({
        osmType: 'way',
        id,
        tags,
        label: 'TODO',
        geojson: { type: 'Point', coordinates: nodes[0] },
        lon: nodes[0][0],
        lat: nodes[0][1],
      }),
    );
  },
};
