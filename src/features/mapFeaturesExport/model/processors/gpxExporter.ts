import type { LatLon } from '@shared/types/common.js';

export const GPX_NS = 'http://www.topografix.com/GPX/1/1';

export const GARMIN_NS = 'http://www.garmin.com/xmlschemas/GpxExtensions/v3';

export const GPX_STYLE_NS = 'http://www.topografix.com/GPX/gpx_style/0/2';

export const LOCUS_NS = 'http://www.locusmap.eu';

// Freemap-private namespace, the lossless source of truth for drawing styling
// (markerType + icon spec + color) that has no standard GPX equivalent.
export const FM_NS = 'https://www.freemap.sk/GPX/1/0';

// OsmAnd's GPX extension namespace (icon/background/color, fill_color, width).
export const OSMAND_NS = 'https://osmand.net';

// The namespace that namespace declarations themselves live in. Declaring
// `xmlns:*` attributes via setAttributeNS with this namespace makes
// XMLSerializer treat them as in-scope prefixes instead of redeclaring them
// on every child element.
export const XMLNS_NS = 'http://www.w3.org/2000/xmlns/';

// Garmin TrackPointExtension namespace for per-point sensor values (heart rate,
// cadence, …). togeojson reads these back into `coordinateProperties` when the
// element prefix is `gpxtpx`, so emitting them keeps a GeoJSON-sourced track
// lossless on re-export.
export const GPXTPX_NS =
  'http://www.garmin.com/xmlschemas/TrackPointExtension/v1';

// Garmin's per-point power and per-waypoint extension namespaces, which files
// in the wild carry alongside the two above.
export const GPXPX_NS = 'http://www.garmin.com/xmlschemas/PowerExtension/v1';

export const WPTX1_NS = 'http://www.garmin.com/xmlschemas/WaypointExtension/v1';

/** The `fm:*` fields a file of ours carries, whatever element holds them. */
export const FM_TAGS = [
  'label',
  'markerType',
  'icon',
  'color',
  'type',
  'fillColor',
  'lineCap',
  'lineJoin',
  'dashArray',
  'width',
  // GPX has no interior rings, so a polygon and its holes travel as separate
  // tracks sharing an id.
  'polygonId',
  'holeOf',
] as const;

/**
 * The prefix we spell a namespace with, whatever the file chose — a prefix is
 * only a local alias, so `<garmin:DisplayColor>` and `<gpxx:DisplayColor>` bound
 * to the same namespace have to arrive under the same key, or the property is a
 * different one per source and the writer cannot bind it back.
 */
export const KNOWN_NS_PREFIXES: Record<string, string> = {
  [GARMIN_NS]: 'gpxx',
  [GPXTPX_NS]: 'gpxtpx',
  [GPXPX_NS]: 'gpxpx',
  [WPTX1_NS]: 'wptx1',
  [LOCUS_NS]: 'locus',
};

/**
 * Per-point series ↔ the element carrying it, in one table because the reader's
 * fallback (`${local}s`) names anything, so this list alone decides which
 * channels survive a round trip. `tpx` says Garmin nests the element in its
 * `<gpxtpx:TrackPointExtension>`; the rest sit loose in `<extensions>`.
 */
export const POINT_CHANNELS = [
  { series: 'heart', local: 'hr', tpx: true },
  { series: 'cads', local: 'cad', tpx: true },
  { series: 'atemps', local: 'atemp', tpx: true },
  { series: 'wtemps', local: 'wtemp', tpx: true },
  { series: 'depths', local: 'depth', tpx: true },
  { series: 'speeds', local: 'speed', tpx: true },
  { series: 'courses', local: 'course', tpx: true },
  { series: 'bearings', local: 'bearing', tpx: true },
  { series: 'powers', local: 'power' },
  // No GPX-native home — `<hdop>` is a dimensionless dilution of precision, not
  // the metres a GNSS fix reports.
  { series: 'accuracies', local: 'accuracy' },
] as const;

export function toLatLon(latLon: LatLon): { lat: string; lon: string } {
  return {
    lat: latLon.lat.toString(),
    lon: latLon.lon.toString(),
  };
}

export function createElement(
  parent: Element,
  name: string | [string, string],
  text: { cdata: string } | string | null = null,
  attributes: { [key: string]: string } = {},
  ns = GPX_NS,
): Element {
  const doc = parent.ownerDocument;

  const elem = Array.isArray(name)
    ? doc.createElementNS(name[0], name[1])
    : doc.createElementNS(ns, name);

  if (text == null) {
    // nothing
  } else if (typeof text === 'string') {
    elem.textContent = text;
  } else {
    elem.appendChild(doc.createCDATASection(text.cdata));
  }

  for (const key of Object.keys(attributes)) {
    addAttribute(elem, key, attributes[key]);
  }

  parent.appendChild(elem);

  return elem;
}

/**
 * The feature's own table, one `<fm:prop key="…">` per pair — every key, since
 * `<name>` says only what the label rendered to.
 */
export function appendProps(
  parent: Element,
  props: Record<string, string> | undefined,
): void {
  for (const key in props) {
    createElement(parent, [FM_NS, 'fm:prop'], props[key]!, { key });
  }
}

export function addAttribute(elem: Element, name: string, value: string): void {
  const attr = elem.ownerDocument.createAttribute(name);

  attr.value = value;

  elem.setAttributeNode(attr);
}
