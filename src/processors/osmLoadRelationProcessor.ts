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
import { OsmNode, OsmRelation, OsmResult, OsmWay } from 'fm3/types/common';
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

    const nodes: Record<number, OsmNode> = {};

    const ways: Record<number, OsmWay> = {};

    for (const item of assertType<OsmResult>(data).elements) {
      if (item.type === 'node') {
        nodes[item.id] = item;
      } else if (item.type === 'way') {
        ways[item.id] = item;
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
            const n = nodes[ref];

            if (n) {
              const props: Record<string, string> = {};

              if (n.tags?.['name']) {
                props['name'] = n.tags['name'];
              }

              if (n.tags?.['ele']) {
                props['ele'] = n.tags['ele'];
              }

              features.push(point([n.lon, n.lat], props));
            }
            break;
          case 'way':
            const w = ways[ref];

            if (w) {
              features.push(
                lineString(
                  w.nodes.map((ref) => [nodes[ref].lon, nodes[ref].lat]),
                  // no street names pls // w.tags?.name ? { name: w.tags.name } : {},
                ),
              );
            }
            break;
          case 'relation':
          // TODO add support for relations in relation
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
