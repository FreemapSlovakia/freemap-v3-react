import type { Feature, LineString } from 'geojson';
import type { RecorderPoint } from './protocol.js';

/**
 * Adapts recorded fixes to the GeoJSON `LineString` the shared colorizers, the
 * elevation chart and the exporters consume. Coordinates are
 * `[lon, lat, altitude?]` — altitude omitted when the fix carried none, so
 * elevation-derived colorizers treat it as a gap — alongside the per-point
 * series those consumers read: `coordTimes` and `coordinateProperties`.
 */
export function recorderPointsToFeature(
  points: RecorderPoint[],
): Feature<LineString> {
  return {
    type: 'Feature',
    properties: {
      coordTimes: points.map((p) => new Date(p.ts).toISOString()),
      coordinateProperties: {
        accuracy: points.map((p) => p.acc),
        speed: points.map((p) => p.spd),
        bearing: points.map((p) => p.brg),
      },
    },
    geometry: {
      type: 'LineString',
      coordinates: points.map((p) =>
        typeof p.alt === 'number' && Number.isFinite(p.alt)
          ? [p.lon, p.lat, p.alt]
          : [p.lon, p.lat],
      ),
    },
  };
}
