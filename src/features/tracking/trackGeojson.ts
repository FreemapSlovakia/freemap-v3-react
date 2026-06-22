import type { Feature, LineString } from 'geojson';
import type { TrackPoint } from './model/types.js';

/**
 * Adapts tracking points to the GeoJSON `LineString` shape the shared colorizers
 * and the elevation chart consume. Coordinates are `[lon, lat, altitude?]`
 * (altitude omitted when the device didn't report one, so elevation-derived
 * colorizers treat it as a gap), with the per-point series the colorizers read:
 * `coordTimes` (speed/time) and `coordinateProperties` (battery, gsmSignal).
 */
export function trackPointsToFeature(
  points: TrackPoint[],
): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {
      coordTimes: points.map((p) => p.ts.toISOString()),
      coordinateProperties: {
        battery: points.map((p) => p.battery ?? null),
        gsmSignal: points.map((p) => p.gsmSignal ?? null),
      },
    },
    geometry: {
      type: 'LineString',
      coordinates: points.map((p) =>
        typeof p.altitude === 'number' && Number.isFinite(p.altitude)
          ? [p.lon, p.lat, p.altitude]
          : [p.lon, p.lat],
      ),
    },
  };
}
