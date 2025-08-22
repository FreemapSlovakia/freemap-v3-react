export type OsmFeatureId = {
  type: 'node' | 'way' | 'relation';
  id: number;
};

export type FeatureId =
  | OsmFeatureId
  | {
      type: 'other';
      id: number;
    };

export function featureIdsEqual(a: FeatureId, b: FeatureId) {
  return a.type === b.type && a.id === b.id;
}
