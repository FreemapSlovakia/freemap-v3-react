import { lineString, polygon } from '@turf/helpers';
import { assert } from 'typia';
import { clearMapFeatures } from '../actions/mainActions.js';
import { osmLoadWay } from '../actions/osmActions.js';
import { searchSelectResult } from '../actions/searchActions.js';
import { positionsEqual, shouldBeArea } from '../geoutils.js';
import { httpRequest } from '../httpRequest.js';
import type { Processor } from '../middlewares/processorMiddleware.js';
import type { OsmResult } from '../types/osm.js';

export const osmLoadWayProcessor: Processor<typeof osmLoadWay> = {
  actionCreator: osmLoadWay,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const { id, focus, showToast } = action.payload;

    const res = await httpRequest({
      getState,
      url: `//api.openstreetmap.org/api/0.6/way/${id}/full.json`,
      expectedStatus: 200,
      cancelActions: [clearMapFeatures, searchSelectResult],
    });

    const nodes: Record<string, [number, number]> = {};

    const { elements } = assert<OsmResult>(await res.json());

    for (const item of elements) {
      if (item.type === 'node') {
        nodes[item.id] = [item.lon, item.lat];
      } else if (item.type === 'way') {
        const coordinates = item.nodes.map((ref) => nodes[ref]);

        dispatch(
          searchSelectResult({
            result: {
              source: 'osm',
              id: { type: 'way', id },
              geojson:
                positionsEqual(coordinates[0], coordinates.at(-1)!) &&
                shouldBeArea(item.tags)
                  ? polygon([coordinates], item.tags)
                  : lineString(coordinates, item.tags),
            },
            showToast: showToast || window.isRobot,
            focus,
          }),
        );
      }
    }
  },
};
