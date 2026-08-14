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
import type { OsmNode, OsmRelation, OsmResult, OsmWay } from './types.js';

/**
 * The geometry an OSM element is drawn as: a point for a node, a line or an
 * area for a way, a collection of its member geometry for a relation. The
 * element's tags are the `properties` of either shape, which is what lets a
 * display name be copied onto them without knowing which one it is.
 */
export type OsmGeojson =
  | (Feature<Point | LineString | Polygon> & {
      properties: Record<string, string>;
    })
  | (FeatureCollection<Point | LineString | Polygon> & {
      properties: Record<string, string>;
    });

/** A response's elements by type and id, so any of them can be assembled from it. */
export type OsmElementIndex = {
  node: Map<number, OsmNode>;
  way: Map<number, OsmWay>;
  relation: Map<number, OsmRelation>;
};

export function indexOsmElements({ elements }: OsmResult): OsmElementIndex {
  const index: OsmElementIndex = {
    node: new Map(),
    way: new Map(),
    relation: new Map(),
  };

  for (const element of elements) {
    switch (element.type) {
      case 'node':
        index.node.set(element.id, element);
        break;

      case 'way':
        index.way.set(element.id, element);
        break;

      case 'relation':
        index.relation.set(element.id, element);
        break;
    }
  }

  return index;
}

function coords(node: OsmNode): [number, number] {
  return [node.lon, node.lat];
}

function wayCoords(index: OsmElementIndex, way: OsmWay): [number, number][] {
  return way.nodes.map((ref) => coords(index.node.get(ref)!));
}

/**
 * Builds the GeoJSON for one element out of an index holding it together with
 * the members it references — which is why the index is passed rather than the
 * element: a way is its nodes' positions, and a relation its members' geometry.
 *
 * `null` when the index doesn't hold the element, which is how a batched fetch
 * reports an element that doesn't exist (Overpass simply leaves it out).
 */
export function assembleOsmGeojson(
  { elementType, id }: OsmFeatureId,
  index: OsmElementIndex,
): OsmGeojson | null {
  if (elementType === 'node') {
    const node = index.node.get(id);

    return node ? point(coords(node), node.tags ?? {}) : null;
  }

  if (elementType === 'way') {
    const way = index.way.get(id);

    if (!way) {
      return null;
    }

    const coordinates = wayCoords(index, way);

    const tags = way.tags ?? {};

    return positionsEqual(coordinates[0], coordinates.at(-1)) &&
      shouldBeArea(tags)
      ? polygon([coordinates], tags)
      : lineString(coordinates, tags);
  }

  const relation = index.relation.get(id);

  if (!relation) {
    return null;
  }

  const tags: Record<string, string> = relation.tags ?? {};

  const features: Feature<Point | LineString | Polygon>[] = [];

  const polyFeatures: Feature<Point | LineString | Polygon>[] = [];

  for (const member of relation.members) {
    const { ref, type } = member;

    switch (type) {
      case 'node': {
        const n = index.node.get(ref);

        if (n) {
          features.push(point(coords(n), n.tags));
        }

        break;
      }

      case 'way': {
        const w = index.way.get(ref);

        if (w) {
          (member.role === 'inner' || member.role === 'outer'
            ? polyFeatures
            : features
          ).push(
            lineString(
              wayCoords(index, w),
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

  return {
    ...featureCollection([...polyFeatures, ...features]),
    properties: tags,
  };
}
