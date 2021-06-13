import { lineString, polygon } from '@turf/helpers';
import { osmLoadWay } from 'fm3/actions/osmActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { httpRequest } from 'fm3/authAxios';
import { positionsEqual } from 'fm3/geoutils';
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
        const coordinates = item.nodes.map((ref) => nodes[ref]);

        const tags = item.tags ?? {};

        dispatch(
          searchSelectResult({
            osmType: 'way',
            id,
            geojson:
              positionsEqual(
                coordinates[0],
                coordinates[coordinates.length - 1],
              ) &&
              tags['area'] !== 'no' &&
              !tags['barrier'] &&
              !tags['gihgway'] // taken from https://wiki.openstreetmap.org/wiki/Key:area
                ? polygon([coordinates], item.tags)
                : lineString(coordinates, item.tags),
            tags,
            detailed: true,
          }),
        );
      }
    }
  },
};
