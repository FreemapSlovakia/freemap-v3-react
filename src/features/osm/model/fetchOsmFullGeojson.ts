import { httpRequest } from '@app/httpRequest.js';
import { clearMapFeatures } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { mergeLines, positionsEqual, shouldBeArea } from '@shared/geoutils.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
import { featureCollection, lineString, point, polygon } from '@turf/helpers';
import type {
  Feature,
  FeatureCollection,
  LineString,
  Point,
  Polygon,
} from 'geojson';
import {
  type OsmNode,
  type OsmRelation,
  OsmResultSchema,
  type OsmWay,
} from './types.js';

// Fetches an OSM element with its dependencies via the .../full.json endpoint
// (or .json for nodes) and assembles a GeoJSON Feature/FeatureCollection.
// The dispatch-side concerns (copyDisplayName, searchSelectResult) live in the
// osmLoad{Node,Way,Relation} processors; this helper only deals with the
// fetch → parse → build geometry pipeline so it can be reused by
// convertToDrawingProcessor's `objects-geometry` path without round-tripping
// through the search store.
export async function fetchOsmFullGeojson(
  osmId: OsmFeatureId,
  getState: () => RootState,
): Promise<
  | Feature
  | (FeatureCollection<Point | LineString | Polygon> & {
      properties: Record<string, string>;
    })
  | null
> {
  const url =
    osmId.elementType === 'node'
      ? `//api.openstreetmap.org/api/0.6/node/${osmId.id}.json`
      : `//api.openstreetmap.org/api/0.6/${osmId.elementType}/${osmId.id}/full.json`;

  const res = await httpRequest({
    getState,
    url,
    expectedStatus: 200,
    cancelActions: [clearMapFeatures, searchSelectResult],
  });

  const data = OsmResultSchema.parse(await res.json());

  if (osmId.elementType === 'node') {
    const node = data.elements.find((el): el is OsmNode => el.type === 'node');

    return node ? point([node.lon, node.lat], node.tags ?? {}) : null;
  }

  if (osmId.elementType === 'way') {
    const nodes: Record<number, [number, number]> = {};

    let way: OsmWay | undefined;

    for (const item of data.elements) {
      if (item.type === 'node') {
        nodes[item.id] = [item.lon, item.lat];
      } else if (item.type === 'way' && item.id === osmId.id) {
        way = item;
      }
    }

    if (!way) {
      return null;
    }

    const coordinates = way.nodes.map((ref) => nodes[ref]);

    const tags = way.tags ?? {};

    return positionsEqual(coordinates[0], coordinates.at(-1)) &&
      shouldBeArea(tags)
      ? polygon([coordinates], tags)
      : lineString(coordinates, tags);
  }

  const nodesMap: Record<number, OsmNode> = {};

  const waysMap: Record<number, OsmWay> = {};

  for (const item of data.elements) {
    if (item.type === 'node') {
      nodesMap[item.id] = item;
    } else if (item.type === 'way') {
      waysMap[item.id] = item;
    }
  }

  const relation = data.elements.find(
    (el): el is OsmRelation => el.type === 'relation' && el.id === osmId.id,
  );

  if (!relation) {
    return null;
  }

  const tags: Record<string, string> = relation.tags ?? {};

  const features: Feature<Point | LineString | Polygon>[] = [];

  const polyFeatures: Feature<Point | LineString | Polygon>[] = [];

  for (const member of relation.members) {
    const { ref, type } = member;

    if (type === 'node') {
      const n = nodesMap[ref];

      if (n) {
        features.push(point([n.lon, n.lat], n.tags));
      }
    } else if (type === 'way') {
      const w = waysMap[ref];

      if (w) {
        (member.role === 'inner' || member.role === 'outer'
          ? polyFeatures
          : features
        ).push(
          lineString(
            w.nodes.map((ref) => [nodesMap[ref].lon, nodesMap[ref].lat]),
            member.role === 'outer' ? tags : w.tags,
          ),
        );
      }
    }
  }

  mergeLines<LineString | Point | Polygon>(polyFeatures, tags);

  return {
    ...featureCollection([...polyFeatures, ...features]),
    properties: tags,
  };
}
