import * as toGeoJSON from '@tmcw/togeojson';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { enrichGpxExtensions } from './enrichGpxExtensions.js';
import { normalizePowerExtension } from './normalizePowerExtension.js';
import { parseGeojsonFile } from './parseGeojsonFile.js';

// togeojson's `tcx` exposes the extended channels as top-level properties under
// names the colorizers don't read; relocate them onto `coordinateProperties` so
// cadence/speed/power/HR colorize the same as an imported GPX.
const TCX_REMAP: Record<string, string> = {
  cadences: 'cads',
  speeds: 'speeds',
  watts: 'powers',
  heartRates: 'heart',
};

function normalizeTcxFeature(
  feature: Feature<Geometry | null>,
): Feature<Geometry | null> {
  const props = feature.properties;

  if (!props) {
    return feature;
  }

  const cp: Record<string, unknown> = {
    ...(props['coordinateProperties'] as Record<string, unknown> | undefined),
  };

  const next: Record<string, unknown> = { ...props };

  let changed = false;

  for (const [from, to] of Object.entries(TCX_REMAP)) {
    if (from in next) {
      // Keep the core HeartRateBpm series already on coordinateProperties.heart
      // in preference to the `heartRates` activity extension.
      if (!(to in cp)) {
        cp[to] = next[from];
      }

      delete next[from];

      changed = true;
    }
  }

  if (!changed) {
    return feature;
  }

  next['coordinateProperties'] = cp;

  return { ...feature, properties: next };
}

function normalizeTcx(
  fc: FeatureCollection<Geometry | null>,
): FeatureCollection<Geometry | null> {
  return { ...fc, features: fc.features.map(normalizeTcxFeature) };
}

function parseXml(text: string): Document | null {
  const doc = new DOMParser().parseFromString(text, 'text/xml');

  return doc.getElementsByTagName('parsererror').length > 0 ? null : doc;
}

// The track-viewer / convert-to-drawing pipeline keys a feature's label on
// `name`. Foreign GeoJSON carries it under `title` (Mapbox simplestyle) or
// `label`; normalize to `name` so labels survive for every format alike.
function normalizeName<G extends Geometry | null>(
  feature: Feature<G>,
): Feature<G> {
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

// The single finalizer every format funnels through: drop null-geometry
// features (togeojson can emit them) and normalize labels. Returns null when
// nothing usable remains (treated as a parse error).
function toGeojson(
  fc: FeatureCollection<Geometry | null>,
): FeatureCollection | null {
  const features = fc.features
    .filter((f): f is Feature<Geometry> => f.geometry != null)
    .map(normalizeName);

  return features.length > 0 ? { type: 'FeatureCollection', features } : null;
}

// Resolves a track file's format from its name, falling back to its XML root
// element, and converts it to a FeatureCollection for the store — GPX via
// togeojson plus our `freemap:*` / `osmand:*` enrichment, KML/TCX/GeoJSON
// likewise. Unknown XML is tried as GPX; non-XML (and empty results) yield null.
export function parseTrackFile(
  text: string,
  filename: string,
): FeatureCollection | null {
  const name = filename.toLowerCase();

  if (name.endsWith('.geojson') || name.endsWith('.json')) {
    const fc = parseGeojsonFile(text);

    return fc ? toGeojson(fc) : null;
  }

  const doc = parseXml(text);

  if (!doc) {
    return null;
  }

  // A recognized root element is authoritative (so a mislabeled extension still
  // imports); the file extension only disambiguates unrecognized XML, and
  // `.kmz` was unzipped to KML upstream. Anything else is treated as GPX.
  const root = doc.documentElement.localName;

  const format =
    root === 'kml'
      ? 'kml'
      : root === 'TrainingCenterDatabase'
        ? 'tcx'
        : root === 'gpx'
          ? 'gpx'
          : name.endsWith('.kml') || name.endsWith('.kmz')
            ? 'kml'
            : name.endsWith('.tcx')
              ? 'tcx'
              : 'gpx';

  if (format === 'kml') {
    return toGeojson(toGeoJSON.kml(doc));
  }

  if (format === 'tcx') {
    return toGeojson(normalizeTcx(toGeoJSON.tcx(doc)));
  }

  // GPX: enrich togeojson's output with our canonical `freemap:*` / `osmand:*`
  // keys and alias Garmin power so the drawing converter and colorizers read it.
  const geojson = toGeoJSON.gpx(doc);

  enrichGpxExtensions(doc, geojson);

  normalizePowerExtension(geojson.features);

  return toGeojson(geojson);
}
