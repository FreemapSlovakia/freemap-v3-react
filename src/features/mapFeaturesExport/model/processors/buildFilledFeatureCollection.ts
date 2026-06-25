import type { RootState } from '@app/store/store.js';
import type { FeatureCollection } from 'geojson';
import type { exportMapFeatures } from '../actions.js';
import {
  type BuildExportOptions,
  buildExportFeatureCollection,
  type PointRenderMode,
} from '../buildExportFeatureCollection.js';
import { fillFcElevations } from './fillElevations.js';

/**
 * Shared by the GeoJSON and KML export handlers: build the export
 * FeatureCollection from the selected exportables and, if requested, fill
 * elevation into it.
 *
 * The elevation fill mutates coordinate arrays in place, so when it runs the
 * geometry is detached first (the store pushes some features by reference).
 * Only the geometry is cloned — properties, which can hold large baked marker
 * data URLs, are shared by reference since the fill never touches them.
 */
export async function buildFilledFc(
  getState: () => RootState,
  action: ReturnType<typeof exportMapFeatures>,
  pointMode: PointRenderMode,
  options?: BuildExportOptions,
): Promise<FeatureCollection> {
  const set = new Set(action.payload.exportables);

  const fc = await buildExportFeatureCollection({
    getState,
    include: {
      pictures: set.has('pictures'),
      drawingLines: set.has('drawingLines'),
      drawingAreas: set.has('drawingAreas'),
      drawingPoints: set.has('drawingPoints'),
      objects: set.has('objects'),
      plannedRoute: set.has('plannedRoute'),
      plannedRouteWithStops: set.has('plannedRouteWithStops'),
      tracking: set.has('tracking'),
      import: set.has('import'),
      search: set.has('search'),
    },
    pointMode,
    options,
  });

  const { elevation } = action.payload;

  if (elevation !== 'missing' && elevation !== 'all') {
    return fc;
  }

  const cloned: FeatureCollection = {
    ...fc,
    features: fc.features.map((f) => ({
      ...f,
      geometry: structuredClone(f.geometry),
    })),
  };

  await fillFcElevations(cloned, elevation, getState);

  return cloned;
}
