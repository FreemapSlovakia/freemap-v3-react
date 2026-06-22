import { clearMapFeatures } from '@app/store/actions.js';
import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { enrichElevations } from '@shared/elevation.js';
import type { Feature, LineString } from 'geojson';
import type { Dispatch } from 'redux';
import {
  Alternative,
  routePlannerDelete,
  routePlannerSetEnrichedAlternatives,
  routePlannerSetResult,
  StepCoordinate,
} from './actions.js';

/**
 * Fills the current route's missing elevations from the terrain model, once
 * per result (cached via `elevationsFilled`). A planned route is where
 * GraphHopper ≈ DEM, so the fill is unprompted — unlike imported tracks. The
 * filled `z` is written back into every alternative's step coordinates so the
 * chart and colorize read complete local data.
 */
export async function ensureRouteElevations(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
): Promise<void> {
  const { alternatives, elevationsFilled } = getState().routePlanner;

  if (elevationsFilled || alternatives.length === 0) {
    return;
  }

  // One feature per step, keeping the order so the filled coordinates can be
  // written back into the same slots. `enrichElevations` batches every feature
  // into a single request.
  const features: Feature<LineString>[] = [];

  for (const alt of alternatives) {
    for (const leg of alt.legs) {
      for (const step of leg.steps) {
        features.push({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: step.geometry.coordinates,
          },
        });
      }
    }
  }

  const enriched = await enrichElevations(features, 'missing', getState, [
    routePlannerSetResult,
    routePlannerDelete,
    clearMapFeatures,
  ]);

  let i = 0;

  const filled: Alternative[] = alternatives.map((alt) => ({
    ...alt,
    legs: alt.legs.map((leg) => ({
      ...leg,
      steps: leg.steps.map((step) => ({
        ...step,
        geometry: {
          ...step.geometry,
          coordinates: enriched[i++]!.geometry.coordinates as StepCoordinate[],
        },
      })),
    })),
  }));

  dispatch(routePlannerSetEnrichedAlternatives(filled));
}
