import { Feature, FeatureCollection } from 'geojson';
import { GeoJSONSchema } from 'zod-geojson';

// The track-viewer rendering and the convert-to-drawing pipeline key the
// feature label on `name` (as GPX-derived GeoJSON does, via togeojson). Foreign
// GeoJSON — including our own export — carries the label under other keys:
// `title` is the Mapbox simplestyle convention we export, `label` is another
// common one. Normalize to `name` (preferring an explicit `name`) so labels
// survive a GeoJSON round-trip the same way they do for GPX.
function normalizeName(feature: Feature): Feature {
  const props = feature.properties;

  if (!props || props['name'] != null) {
    return feature;
  }

  const label =
    typeof props['title'] === 'string'
      ? props['title']
      : typeof props['label'] === 'string'
        ? props['label']
        : undefined;

  return label === undefined
    ? feature
    : { ...feature, properties: { ...props, name: label } };
}

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
      return {
        type: 'FeatureCollection',
        features: (geojson as FeatureCollection).features.map(normalizeName),
      };

    case 'Feature':
      return {
        type: 'FeatureCollection',
        features: [normalizeName(geojson as Feature)],
      };

    default:
      return {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: geojson, properties: null }],
      };
  }
}
