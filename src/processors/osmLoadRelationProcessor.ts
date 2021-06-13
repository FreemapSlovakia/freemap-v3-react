import center from '@turf/center';
import {
  Feature,
  featureCollection,
  lineString,
  LineString,
  point,
  Point,
  Polygon,
} from '@turf/helpers';
import { osmLoadRelation } from 'fm3/actions/osmActions';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { httpRequest } from 'fm3/authAxios';
import { mergeLines } from 'fm3/geoutils';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { OsmNode, OsmRelation, OsmResult, OsmWay } from 'fm3/types/common';
import { assertType } from 'typescript-is';

export const osmLoadRelationProcessor: Processor<typeof osmLoadRelation> = {
  actionCreator: osmLoadRelation,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const id = action.payload;

    const { data } = await httpRequest({
      getState,
      method: 'GET',
      url: `//api.openstreetmap.org/api/0.6/relation/${id}/full`,
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

    const features: Feature<Point | LineString | Polygon>[] = [];

    const polyFeatures: Feature<Point | LineString | Polygon>[] = [];

    const relation = relations.find((relation) => relation.id === id);

    if (!relation) {
      return;
    }

    const tags: Record<string, string> | undefined = relation.tags;

    for (const member of relation.members) {
      const { ref, type } = member;

      switch (type) {
        case 'node':
          const n = nodes[ref];

          if (n) {
            features.push(point([n.lon, n.lat], n.tags));
          }

          break;
        case 'way':
          const w = ways[ref];

          if (w) {
            (member.role === 'inner' || member.role === 'outer'
              ? polyFeatures
              : features
            ).push(
              lineString(
                w.nodes.map((ref) => [nodes[ref].lon, nodes[ref].lat]),
                w.tags,
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

    // TODO add support for areas

    mergeLines<LineString | Point | Polygon>(polyFeatures, tags);

    const geojson = featureCollection([...polyFeatures, ...features]);

    const c = center(geojson);

    dispatch(
      searchSelectResult({
        osmType: 'relation',
        id,
        geojson,
        lon: c.geometry.coordinates[0],
        lat: c.geometry.coordinates[1],
        detailed: true,
      }),
    );
  },
};
