import { clearMapFeatures } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { mergeLines } from '@shared/geoutils.js';
import { featureCollection, lineString, point } from '@turf/helpers';
import type { Feature, LineString, Point, Polygon } from 'geojson';
import { assert } from 'typia';
import { copyDisplayName } from '../../../../copyDisplayName.js';
import { httpRequest } from '@app/httpRequest.js';
import { FeatureId } from '../../../../types/featureId.js';
import { osmLoadRelation } from '../osmActions.js';
import type { OsmNode, OsmRelation, OsmResult, OsmWay } from '../types.js';

export const osmLoadRelationProcessor: Processor<typeof osmLoadRelation> = {
  actionCreator: osmLoadRelation,
  errorKey: 'osm.fetchingError',
  handle: async ({ dispatch, getState, action }) => {
    const { id, focus, showToast } = action.payload;

    const res = await httpRequest({
      getState,
      url: `//api.openstreetmap.org/api/0.6/relation/${id}/full.json`,
      expectedStatus: 200,
      cancelActions: [clearMapFeatures, searchSelectResult],
    });

    const data = assert<OsmResult>(await res.json());

    const nodes: Record<number, OsmNode> = {};

    const ways: Record<number, OsmWay> = {};

    for (const item of data.elements) {
      if (item.type === 'node') {
        nodes[item.id] = item;
      } else if (item.type === 'way') {
        ways[item.id] = item;
      }
    }

    const relations = data.elements.filter(
      (el) => el.type === 'relation',
    ) as OsmRelation[];

    const features: Feature<Point | LineString | Polygon>[] = [];

    const polyFeatures: Feature<Point | LineString | Polygon>[] = [];

    const relation = relations.find((relation) => relation.id === id);

    if (!relation) {
      return;
    }

    const tags: Record<string, string> = relation.tags ?? {};

    for (const member of relation.members) {
      const { ref, type } = member;

      switch (type) {
        case 'node': {
          const n = nodes[ref];

          if (n) {
            features.push(point([n.lon, n.lat], n.tags));
          }

          break;
        }

        case 'way': {
          const w = ways[ref];

          if (w) {
            (member.role === 'inner' || member.role === 'outer'
              ? polyFeatures
              : features
            ).push(
              lineString(
                w.nodes.map((ref) => [nodes[ref].lon, nodes[ref].lat]),
                member.role === 'outer' ? tags : w.tags,
              ),
            );
          }

          break;
        }

        case 'relation':
          // TODO add support for relations in relation
          break;

        default:
          break;
      }
    }

    mergeLines<LineString | Point | Polygon>(polyFeatures, tags);

    const osmId: FeatureId = { type: 'osm', elementType: 'relation', id };

    copyDisplayName(getState().search.selectedResult, osmId, tags);

    dispatch(
      searchSelectResult({
        result: {
          source: 'osm',
          id: osmId,
          geojson: {
            ...featureCollection([...polyFeatures, ...features]),
            properties: tags,
          },
        },
        showToast: showToast || window.isRobot,
        focus,
      }),
    );
  },
};
