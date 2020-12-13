import {
  Feature,
  featureCollection,
  lineString,
  LineString,
  point,
  Point,
} from '@turf/helpers';
import { osmLoadRelation } from 'fm3/actions/osmActions';
import { trackViewerSetData } from 'fm3/actions/trackViewerActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OsmRelation, OsmResult } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const osmLoadRelationProcessor: Processor = {
  actionCreator: osmLoadRelation,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState }) => {
    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `//api.openstreetmap.org/api/0.6/relation/${
        getState().trackViewer.osmRelationId
      }/full`,
      expectedStatus: 200,
    });

    const nodes: Record<number, [number, number]> = {};
    const ways: Record<number, [number, number][]> = {};

    for (const item of assertType<OsmResult>(data).elements) {
      if (item.type === 'node') {
        nodes[item.id] = [item.lon, item.lat];
      } else if (item.type === 'way') {
        ways[item.id] = item.nodes.map((ref) => nodes[ref]);
      }
    }

    const relations = assertType<OsmResult>(data).elements.filter(
      (el) => el.type === 'relation',
    ) as OsmRelation[];

    const features: Feature<Point | LineString>[] = [];

    for (const relation of relations) {
      for (const member of relation.members) {
        const { ref, type } = member;

        switch (type) {
          case 'node':
            if (nodes[ref]) {
              features.push(point(nodes[ref]));
            }
            break;
          case 'way':
            if (ways[ref]) {
              features.push(lineString(ways[ref]));
            }
            break;
          case 'relation':
          default:
            break;
        }
      }
    }

    const trackGeojson = featureCollection(features);

    dispatch(
      trackViewerSetData({
        trackGeojson,
        startPoints: [],
        finishPoints: [],
      }),
    );
  },
};
