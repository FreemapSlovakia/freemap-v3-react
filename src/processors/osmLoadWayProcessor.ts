import center from '@turf/center';
import { lineString } from '@turf/helpers';
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

    const { elements } = assertType<OsmResult>(data);

    for (const item of elements) {
      if (item.type === 'node') {
        nodes[item.id] = [item.lon, item.lat];
      } else if (item.type === 'way') {
        const geojson = lineString(
          item.nodes.map((ref) => nodes[ref]),
          item.tags,
        );

        const c = center(geojson);

        dispatch(
          searchSelectResult({
            osmType: 'way',
            id,
            geojson,
            lon: c.geometry.coordinates[0],
            lat: c.geometry.coordinates[1],
            detailed: true,
          }),
        );
      }
    }
  },
};
