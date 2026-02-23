import { createStringify } from 'typia/lib/json.js';

export type OsmFeatureId = {
  type: 'osm';
  elementType: 'node' | 'way' | 'relation';
  id: number;
};

export type FeatureId =
  | OsmFeatureId
  | ({
      type: 'wms';
      map: string;
      // TODO also layer?
      seq: number;
    } & ({ property: string; id: number | string } | {}))
  | {
      type: 'other';
      id?: unknown;
    };

export const stringifyFeatureId = createStringify<FeatureId>();

export function featureIdsEqual(a: FeatureId, b: FeatureId) {
  return stringifyFeatureId(a) === stringifyFeatureId(b);
}
