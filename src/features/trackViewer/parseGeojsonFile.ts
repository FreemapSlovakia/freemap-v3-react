import { FeatureCollection } from 'geojson';
import { GeoJSONSchema } from 'zod-geojson';

// Parses a dropped GeoJSON file's text and normalizes it to a FeatureCollection
// so the track-viewer / convert-to-drawing pipeline can consume it the same way
// it consumes GPX-derived GeoJSON. Accepts a FeatureCollection, a bare Feature,
// or a bare geometry. Returns null when the text is not valid JSON / GeoJSON.
export function parseGeojsonFile(text: string): FeatureCollection | null {
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
      return geojson as FeatureCollection;

    case 'Feature':
      return { type: 'FeatureCollection', features: [geojson] };

    default:
      return {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: geojson, properties: null }],
      };
  }
}
