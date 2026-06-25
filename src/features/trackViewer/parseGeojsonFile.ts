import { Feature, FeatureCollection, Geometry } from 'geojson';
import { GeoJSONSchema } from 'zod-geojson';

// Parses a dropped GeoJSON file's text and shapes it into a FeatureCollection
// (accepting a FeatureCollection, a bare Feature, or a bare geometry). Returns
// null when the text is not valid JSON / GeoJSON. Label and null-geometry
// normalization happen in the shared `parseTrackFile` finalizer.
export function parseGeojsonFile(
  text: string,
): FeatureCollection<Geometry | null> | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  const result = GeoJSONSchema.safeParse(parsed);

  if (!result.success) {
    return null;
  }

  const geojson = result.data;

  switch (geojson.type) {
    case 'FeatureCollection':
      return geojson as FeatureCollection<Geometry | null>;

    case 'Feature':
      return {
        type: 'FeatureCollection',
        features: [geojson as Feature<Geometry | null>],
      };

    default:
      return {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: geojson as Geometry, properties: null },
        ],
      };
  }
}
