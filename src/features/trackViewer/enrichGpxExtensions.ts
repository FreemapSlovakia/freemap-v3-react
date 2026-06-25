import {
  FM_NS,
  GPX_STYLE_NS,
  OSMAND_NS,
} from '@features/mapFeaturesExport/model/processors/gpxExporter.js';
import type { FeatureCollection, Geometry } from 'geojson';

// togeojson pulls registered-namespace elements into properties, but the key
// depends on the source's prefix (`fm:markerType` -> `fm_markerType`). Walk the
// wpt/trk elements ourselves and inject canonical `freemap:*` / `osmand:*` keys
// (plus a `gpx_style:hasFill` polygon hint) so the convert-to-drawing processor
// doesn't have to guess the prefix.
export function enrichGpxExtensions(
  gpxDoc: Document,
  geojson: FeatureCollection<Geometry | null>,
): void {
  enrichWaypointsWithExtensions(gpxDoc, geojson);

  enrichTracksWithExtensions(gpxDoc, geojson);
}

function enrichWaypointsWithExtensions(
  gpxDoc: Document,
  geojson: FeatureCollection<Geometry | null>,
): void {
  const wpts = Array.from(gpxDoc.getElementsByTagName('wpt'));

  if (wpts.length === 0) {
    return;
  }

  // togeojson yields Point features in document order, interleaved with
  // tracks and routes. We pair each wpt to the next Point feature.
  let wptIndex = 0;

  for (const feature of geojson.features) {
    if (feature.geometry?.type !== 'Point' || wptIndex >= wpts.length) {
      continue;
    }

    const wpt = wpts[wptIndex++];

    const props = (feature.properties ??= {});

    for (const tag of ['markerType', 'icon', 'color'] as const) {
      const value = wpt
        .getElementsByTagNameNS(FM_NS, tag)[0]
        ?.textContent?.trim();

      if (value) {
        props[`freemap:${tag}`] = value;
      }
    }

    for (const tag of ['icon', 'background', 'color'] as const) {
      const value = wpt
        .getElementsByTagNameNS(OSMAND_NS, tag)[0]
        ?.textContent?.trim();

      if (value) {
        props[`osmand:${tag}`] = value;
      }
    }
  }
}

// GPX has no polygon type; we treat `<trk>` as either a LineString or a
// closed polygon depending on extension hints. Inject our own canonical
// properties so the convert-to-drawing processor can switch type and
// restore styling without re-walking the XML.
function enrichTracksWithExtensions(
  gpxDoc: Document,
  geojson: FeatureCollection<Geometry | null>,
): void {
  const trks = Array.from(gpxDoc.getElementsByTagName('trk'));

  if (trks.length === 0) {
    return;
  }

  let trkIndex = 0;

  for (const feature of geojson.features) {
    const t = feature.geometry?.type;

    if (
      (t !== 'LineString' && t !== 'MultiLineString') ||
      trkIndex >= trks.length
    ) {
      continue;
    }

    const trk = trks[trkIndex++];

    const props = (feature.properties ??= {});

    for (const tag of [
      'type',
      'color',
      'fillColor',
      'lineCap',
      'lineJoin',
      'dashArray',
      'width',
    ] as const) {
      const value = trk
        .getElementsByTagNameNS(FM_NS, tag)[0]
        ?.textContent?.trim();

      if (value) {
        props[`freemap:${tag}`] = value;
      }
    }

    for (const tag of ['color', 'fill_color', 'width'] as const) {
      const value = trk
        .getElementsByTagNameNS(OSMAND_NS, tag)[0]
        ?.textContent?.trim();

      if (value) {
        props[`osmand:${tag}`] = value;
      }
    }

    // Presence of gpx_style:fill is the de-facto polygon signal used by
    // other consumers (Mapbox tooling, GAIA). Flag it so the importer can
    // fall back when freemap:type is absent.
    const gpxStyleFill = trk.getElementsByTagNameNS(GPX_STYLE_NS, 'fill')[0];

    if (gpxStyleFill) {
      props['gpx_style:hasFill'] = 'true';
    }
  }
}
