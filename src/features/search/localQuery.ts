import { parseCoordinates } from '@shared/coordinatesParser.js';

/**
 * Whether the query answers itself — pasted GeoJSON, a bounding box, tile
 * numbers or coordinates — and so needs no geocoder. Mirrors what
 * `searchProcessorHandler` tries before it asks the server: a parser added
 * there belongs here too, or the search box will offer offline what the handler
 * can't deliver (and refuse what it can).
 *
 * Deliberately free of the turf/Leaflet that turns those into geometry — this
 * runs in the search box, which is in the main bundle, while the handler that
 * builds the results is a chunk of its own.
 */
export function isLocalSearchQuery(query: string): boolean {
  // pasted GeoJSON
  try {
    const geojson = JSON.parse(query);

    if (
      geojson &&
      typeof geojson === 'object' &&
      typeof geojson.type === 'string'
    ) {
      return true;
    }
  } catch {
    // not JSON
  }

  // a bounding box: four numbers, in degrees or in EPSG:3857 metres
  const parts = query.split(/\s*,\s*|\s+/).map((n) => parseFloat(n));

  if (parts.length === 4 && parts.every((part) => !Number.isNaN(part))) {
    return true;
  }

  // a tile, as zoom/x/y
  if (/^\s*\d+\/\d+\/\d+\s*$/.test(query)) {
    return true;
  }

  // human-readable coordinates
  try {
    parseCoordinates(query);

    return true;
  } catch {
    return false;
  }
}
