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

export function addAttribute(elem: Element, name: string, value: string): void {
  const attr = elem.ownerDocument.createAttribute(name);

  attr.value = value;

  elem.setAttributeNode(attr);
}
