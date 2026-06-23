import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { fetchElevations } from '@shared/elevation.js';
import type { FeatureCollection, Position } from 'geojson';
import { exportMapFeatures } from '../actions.js';

// Cancel an in-flight elevation request when the export is restarted, the modal
// is closed, or the map is cleared.
export const exportElevationCancelActions = [
  exportMapFeatures,
  setActiveModal,
  clearMapFeatures,
];

/**
 * Fills elevation (the third coordinate component) into a FeatureCollection's
 * point and line coordinates via the shared elevation API. `missing` fills only
 * coordinates that lack elevation; `all` overwrites every one. Polygons are
 * skipped — elevation has no meaning for an area outline. Coordinates the API
 * has no data for are left unchanged. Mutates `fc` in place, so pass a
 * collection you own (e.g. a clone).
 */
export async function fillFcElevations(
  fc: FeatureCollection,
  mode: 'missing' | 'all',
  getState: () => RootState,
): Promise<void> {
  const positions: Position[] = [];

  for (const { geometry } of fc.features) {
    switch (geometry.type) {
      case 'Point':
        positions.push(geometry.coordinates);
        break;
      case 'MultiPoint':
      case 'LineString':
        positions.push(...geometry.coordinates);
        break;
      case 'MultiLineString':
        for (const line of geometry.coordinates) {
          positions.push(...line);
        }
        break;
      // Polygon / MultiPolygon / GeometryCollection: no elevation.
    }
  }

  const targets = positions.filter((pos) => mode === 'all' || pos.length < 3);

  const eles = await fetchElevations(
    targets.map((pos) => [pos[1], pos[0]]),
    getState,
    exportElevationCancelActions,
  );

  targets.forEach((pos, i) => {
    const ele = eles[i];

    if (ele != null) {
      pos[2] = ele;
    }
  });
}
