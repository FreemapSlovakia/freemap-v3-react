import * as toGeoJSON from '@tmcw/togeojson';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { enrichGpxExtensions } from './enrichGpxExtensions.js';
import { extractKmlFromKmz } from './kmz.js';
import { normalizePowerExtension } from './normalizePowerExtension.js';
import { parseGeojsonFile } from './parseGeojsonFile.js';
import { FM_KIND, type FmKind, isFmKind } from './provenance.js';

type SourceFormat = 'gpx' | 'tcx' | 'kml' | 'geojson';

// Deterministically classifies a parsed feature by its source. GPX carries
// togeojson's `_gpxType` (`trk`/`rte`); TCX is always a recording; KML/GeoJSON
// geometry is generic. Points are waypoints regardless of format.
function kindForFeature(feature: Feature, format: SourceFormat): FmKind {
  // Respect a kind already stamped by us (e.g. re-importing a GeoJSON we
  // exported) so provenance round-trips instead of collapsing to 'feature'.
  const existing = feature.properties?.[FM_KIND];

  if (isFmKind(existing)) {
    return existing;
  }

  const type = feature.geometry.type;

  if (type === 'Point' || type === 'MultiPoint') {
    return 'waypoint';
  }

  if (format === 'gpx') {
    const gpxType = feature.properties?.['_gpxType'];

    return gpxType === 'trk'
      ? 'track'
      : gpxType === 'rte'
        ? 'route'
        : 'feature';
  }

  if (format === 'tcx') {
    return type === 'LineString' || type === 'MultiLineString'
      ? 'track'
      : 'feature';
  }

  return 'feature';
}

function stampKind<G extends Geometry>(
  feature: Feature<G>,
  format: SourceFormat,
): Feature<G> {
  return {
    ...feature,
    properties: {
      ...feature.properties,
      [FM_KIND]: kindForFeature(feature, format),
    },
  };
}

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
// features (togeojson can emit them), normalize labels, and stamp each
// feature's source provenance (`fm:kind`). Returns null when nothing usable
// remains (treated as a parse error).
function toGeojson(
  fc: FeatureCollection<Geometry | null>,
  format: SourceFormat,
): FeatureCollection | null {
  const features = fc.features
    .filter((f): f is Feature<Geometry> => f.geometry != null)
    .map(normalizeName)
    .map((f) => stampKind(f, format));

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

    return fc ? toGeojson(fc, 'geojson') : null;
  }

  const doc = parseXml(text);

  if (!doc) {
    // Not XML — fall back to GeoJSON detection by content, so a JSON body
    // imports even without a .geojson/.json extension (e.g. a URL with a
    // query string, or a mislabeled file).
    const fc = parseGeojsonFile(text);

    return fc ? toGeojson(fc, 'geojson') : null;
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
    return toGeojson(toGeoJSON.kml(doc), 'kml');
  }

  if (format === 'tcx') {
    return toGeojson(normalizeTcx(toGeoJSON.tcx(doc)), 'tcx');
  }

  // GPX: enrich togeojson's output with our canonical `freemap:*` / `osmand:*`
  // keys and alias Garmin power so the drawing converter and colorizers read it.
  const geojson = toGeoJSON.gpx(doc);

  enrichGpxExtensions(doc, geojson);

  normalizePowerExtension(geojson.features);

  return toGeojson(geojson, 'gpx');
}

// A ZIP archive (and therefore a KMZ) opens with the local-file-header magic
// bytes `PK\x03\x04`.
function isZip(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  );
}

// Parses raw track bytes of any supported format, detecting KMZ by content
// rather than by name: a ZIP archive is unzipped to its contained KML first,
// and everything else is decoded as UTF-8 text. Both paths funnel through
// `parseTrackFile`, so the same GPX/KML/TCX/GeoJSON handling applies. Returns
// null when nothing usable parses.
export async function parseTrackData(
  buffer: ArrayBuffer,
  filename: string,
): Promise<FeatureCollection | null> {
  const bytes = new Uint8Array(buffer);

  if (isZip(bytes)) {
    const kml = await extractKmlFromKmz(buffer);

    return kml == null ? null : parseTrackFile(kml, filename);
  }

  return parseTrackFile(new TextDecoder('utf-8').decode(bytes), filename);
}
