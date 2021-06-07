import center from '@turf/center';
import { featureCollection, lineString } from '@turf/helpers';
import { osmLoadWay } from 'fm3/actions/osmActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OsmResult } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const osmLoadWayProcessor: Processor<typeof osmLoadWay> = {
  actionCreator: osmLoadWay,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const id = action.payload;

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `//api.openstreetmap.org/api/0.6/way/${id}/full`,
      expectedStatus: 200,
    });

    const nodes: Record<string, [number, number]> = {};

    const ways: Record<string, [number, number][]> = {};

    const { elements } = assertType<OsmResult>(data);

    let tags: Record<string, string> = {};

    for (const item of elements) {
      if (item.type === 'node') {
        nodes[item.id] = [item.lon, item.lat];
      } else if (item.type === 'way') {
        ways[item.id] = item.nodes.map((ref) => nodes[ref]);
        tags = item.tags ?? {};
      }
    }

    const f = featureCollection(
      Object.keys(ways).map((id) => lineString(ways[id])),
    );

    const c = center(f);

    dispatch(
      searchSelectResult({
        osmType: 'way',
        id,
        tags,
        geojson: f,
        lon: c.geometry.coordinates[0],
        lat: c.geometry.coordinates[1],
      }),
    );
  },
};
