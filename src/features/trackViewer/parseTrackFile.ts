import * as toGeoJSON from '@tmcw/togeojson';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { parseGeojsonFile } from './parseGeojsonFile.js';

// A dropped/opened track file resolved to how the store should consume it. GPX
// stays raw text — the set-data processor parses and enriches it for the
// drawing-conversion path; KML/TCX/GeoJSON are converted to a FeatureCollection
// here.
export type ParsedTrackFile =
  | { kind: 'gpx'; text: string }
  | { kind: 'geojson'; geojson: FeatureCollection }
  | { kind: 'error' };

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

// togeojson types geometry as nullable (it can drop a degenerate line);
// keep only real geometries and surface the result as a plain FeatureCollection.
function toGeojson(fc: FeatureCollection<Geometry | null>): ParsedTrackFile {
  const features = fc.features.filter(
    (f): f is Feature<Geometry> => f.geometry != null,
  );

  return features.length > 0
    ? { kind: 'geojson', geojson: { type: 'FeatureCollection', features } }
    : { kind: 'error' };
}

// Resolves a track file's format from its name, falling back to its XML root
// element, and converts it for the store. Unknown files default to GPX, matching
// the historical drop behavior.
export function parseTrackFile(
  text: string,
  filename: string,
): ParsedTrackFile {
  const name = filename.toLowerCase();

  if (name.endsWith('.geojson') || name.endsWith('.json')) {
    const geojson = parseGeojsonFile(text);

    return geojson ? { kind: 'geojson', geojson } : { kind: 'error' };
  }

  const doc = parseXml(text);

  const root = doc?.documentElement.localName;

  // `.kmz` arrives already unzipped to KML text (the drop handler unpacks it).
  if (name.endsWith('.kml') || name.endsWith('.kmz') || root === 'kml') {
    return doc ? toGeojson(toGeoJSON.kml(doc)) : { kind: 'error' };
  }

  if (name.endsWith('.tcx') || root === 'TrainingCenterDatabase') {
    return doc
      ? toGeojson(normalizeTcx(toGeoJSON.tcx(doc)))
      : { kind: 'error' };
  }

  // GPX — explicit, sniffed, or the historical default for unknown files.
  return { kind: 'gpx', text };
}
