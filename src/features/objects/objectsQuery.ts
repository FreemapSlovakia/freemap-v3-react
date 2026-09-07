import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import { fetchFeaturesInBbox, osmApiFeatureId } from '@shared/osmApi.js';
import type { ObjectsResult } from './model/actions.js';

export type ObjectsBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

/**
 * The objects tool's search: one filter per active category, each a
 * comma-joined set of `key=value` pairs (a leading `!` on the key means
 * "without this tag", a missing value means "with any").
 */
export async function fetchObjects(
  {
    active,
    bounds,
    limit,
  }: { active: string[]; bounds: ObjectsBounds; limit: number },
  request: CancelTriggers & { getState: () => RootState },
): Promise<{ objects: ObjectsResult[]; truncated: boolean }> {
  const { features, truncated } = await fetchFeaturesInBbox(
    { bbox: bounds, filters: active, limit },
    request,
  );

  return {
    truncated,
    objects: features.map(
      (feature) =>
        ({
          id: osmApiFeatureId(feature.id),
          coords: {
            lon: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
          },
          tags: feature.properties,
        }) satisfies ObjectsResult,
    ),
  };
}
