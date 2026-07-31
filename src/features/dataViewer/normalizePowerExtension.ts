import type { Feature, Geometry } from 'geojson';

// togeojson surfaces the Garmin `<gpxpx:PowerExtension>` per-point values under
// the namespaced key `gpxpx:PowerExtensions`. Rename it to `powers` (in place)
// so the power colorizer and GPX re-export treat it like the plain `<power>`
// extension. No-op when a `powers` series is already present.
export function normalizePowerExtension(
  features: Feature<Geometry | null>[],
): void {
  for (const feature of features) {
    const cp = feature.properties?.['coordinateProperties'] as
      | Record<string, unknown>
      | undefined;

    if (cp && cp['gpxpx:PowerExtensions'] != null && cp['powers'] == null) {
      cp['powers'] = cp['gpxpx:PowerExtensions'];

      delete cp['gpxpx:PowerExtensions'];
    }
  }
}
