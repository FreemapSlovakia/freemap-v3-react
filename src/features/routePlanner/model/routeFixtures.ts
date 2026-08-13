import { lineString } from '@turf/helpers';
import type { Feature, LineString, Position } from 'geojson';
import type { Alternative, Step } from './actions.js';

/**
 * Route shapes for tests. Typed against the real schemas, so a change to `Step`
 * or `Alternative` fails here rather than being cast away at each call site.
 * Imported only by tests, so it never reaches a bundle.
 */

export function step(coordinates: Step['geometry']['coordinates']): Step {
  return {
    maneuver: { type: 'continue' },
    distance: 100,
    duration: 60,
    name: '',
    mode: 'foot',
    geometry: { coordinates },
  };
}

/** A one-leg, one-step route through `coordinates`. */
export function alternative(
  coordinates: Step['geometry']['coordinates'],
): Alternative {
  return {
    distance: 100,
    duration: 60,
    legs: [{ distance: 100, duration: 60, steps: [step(coordinates)] }],
  };
}

/** A sampled elevation line, as `ensureRouteRenderGeojson` would build it. */
export function sampledLine(coordinates: Position[]): Feature<LineString> {
  return lineString(coordinates);
}
