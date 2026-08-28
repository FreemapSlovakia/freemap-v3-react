import { splitColorAlpha } from '@shared/colorAlpha.js';
import { featureExportTable } from '@shared/featureProperties.js';
import { isClosedGeometry } from '@shared/geoutils.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@shared/styleFromProperties.js';
import type { Feature, FeatureCollection } from 'geojson';
import {
  appendProps,
  createElement,
  FM_NS,
  FM_TAGS,
  GARMIN_NS,
  GPX_NS,
  GPX_STYLE_NS,
  GPXTPX_NS,
  KNOWN_NS_PREFIXES,
  OSMAND_NS,
  POINT_CHANNELS,
  toLatLon,
  WPTX1_NS,
  XMLNS_NS,
} from './gpxExporter.js';

// The two groups `POINT_CHANNELS` names, as series -> element: nested in
// Garmin's `<gpxtpx:TrackPointExtension>`, or loose in `<extensions>`. Split on
// the key being *there*, so a row written `tpx: false` would land in the wrong
// one — leave it off instead.
const [GPXTPX_POINT_PROPS, CUSTOM_POINT_PROPS] = [true, false].map((tpx) =>
  Object.fromEntries(
    POINT_CHANNELS.filter((channel) => 'tpx' in channel === tpx).map(
      ({ series, local }) => [series, local],
    ),
  ),
) as [Record<string, string>, Record<string, string>];

// Reads one per-point value out of a feature's `coordinateProperties`. `seg` is
// the segment index for Multi* geometries (togeojson nests the arrays per
// segment) or null for a single LineString (the arrays are flat).
function coordPropAt(
  props: Feature['properties'],
  key: string,
  seg: number | null,
  i: number,
): number | string | undefined {
  const cp = props?.['coordinateProperties'] as
    | Record<string, unknown>
    | undefined;

  const arr = cp?.[key];

  if (!Array.isArray(arr)) {
    return undefined;
  }

  const row =
    seg === null ? arr : Array.isArray(arr[seg]) ? arr[seg] : undefined;

  const value = (row as unknown[] | undefined)?.[i];

  return typeof value === 'number' || typeof value === 'string'
    ? value
    : undefined;
}

// `<trk>`/`<rte>` child elements carrying the feature's own metadata, in GPX
// 1.1 schema order (they precede `<extensions>` and the points).
const LINE_META = ['name', 'cmt', 'desc', 'src', 'type'] as const;

function addLineMeta(parent: Element, feature: Feature): void {
  for (const tag of LINE_META) {
    const value = feature.properties?.[tag];

    if (value != null && value !== '') {
      createElement(parent, tag, String(value));
    }
  }
}

// `<wpt>` child elements carrying the same, in GPX 1.1 schema order (these
// follow `<ele>`).
const WAYPOINT_META = ['time', 'name', 'cmt', 'desc', 'sym', 'type'] as const;

/** What GPX has an element of its own for, so no table row repeats it. */
const NATIVE_KEYS = new Set<string>([...LINE_META, ...WAYPOINT_META, 'ele']);

// Emits a `<wpt>` for a Point coordinate with its elevation (from the
// coordinate, or an `ele` property as our own GeoJSON export writes it) and the
// standard waypoint metadata, so an imported waypoint round-trips losslessly.
function addWaypoint(doc: Document, coord: number[], feature: Feature): void {
  const wptEle = createElement(
    doc.documentElement,
    'wpt',
    undefined,
    toLatLon({ lat: coord[1], lon: coord[0] }),
  );

  const ele =
    typeof coord[2] === 'number' ? coord[2] : feature.properties?.['ele'];

  if (ele != null && ele !== '') {
    createElement(wptEle, 'ele', String(ele));
  }

  for (const tag of WAYPOINT_META) {
    const value = feature.properties?.[tag];

    if (value != null && value !== '') {
      createElement(wptEle, tag, String(value));
    }
  }

  addExtensions(wptEle, feature);
}

/**
 * The `fm:*` fields to write: what the feature states outright, filled in from
 * whichever dialect it is styled in — `fm:*` is what the reader trusts first.
 */
function fmFields(feature: Feature): Record<string, string> {
  const properties = feature.properties;

  const fields: Record<string, string> = {};

  for (const tag of FM_TAGS) {
    const value = properties?.[`freemap:${tag}`];

    if (typeof value === 'string' && value) {
      fields[tag] = value;
    }
  }

  const fallback = (tag: string, value: string | number | undefined) => {
    if (value !== undefined && !(tag in fields)) {
      fields[tag] = String(value);
    }
  };

  const { type } = feature.geometry;

  if (type === 'Point' || type === 'MultiPoint') {
    const style = pointStyleFromProperties(properties);

    fallback('color', style.color);
    fallback('icon', style.icon);
    fallback('markerType', style.markerType);
  } else {
    const style = lineStyleFromProperties(
      properties,
      isClosedGeometry(feature.geometry),
    );

    // GPX has no polygon, so a GeoJSON one says what it is here or comes back
    // as a closed line. Not one with holes: every ring is written as its own
    // `<trkseg>` and nothing tells them apart afterwards, so calling that a
    // polygon paints the holes in.
    const solid =
      (type === 'Polygon' && feature.geometry.coordinates.length === 1) ||
      (type === 'MultiPolygon' &&
        feature.geometry.coordinates.every((rings) => rings.length === 1));

    fallback('type', style.type ?? (solid ? 'polygon' : undefined));
    fallback('color', style.color);
    fallback('fillColor', style.fillColor);
    fallback('width', style.width);
    fallback('lineCap', style.lineCap);
    fallback('lineJoin', style.lineJoin);
    fallback('dashArray', style.dashArray?.join(' '));
  }

  return fields;
}

/**
 * A property keeps a qualified name but not the namespace it was bound to, so
 * writing one back means binding its prefix again. A prefix that is not here is
 * left out rather than bound to a guess.
 */
const KNOWN_PREFIXES = Object.fromEntries(
  Object.entries(KNOWN_NS_PREFIXES).map(([ns, prefix]) => [prefix, ns]),
);

/** Ours, written from the canonical keys above rather than passed through. */
const OWN_PREFIXES = new Set(['freemap', 'fm', 'osmand', 'gpx_style']);

/**
 * The element a namespace's fields sit inside, per kind of feature: Garmin's
 * schema nests them, and one written loose is one its own tools won't find.
 */
const CONTAINERS: Record<string, Partial<Record<string, string>>> = {
  [GARMIN_NS]: {
    trk: 'gpxx:TrackExtension',
    rte: 'gpxx:RouteExtension',
    wpt: 'gpxx:WaypointExtension',
  },
  [WPTX1_NS]: { wpt: 'wptx1:WaypointExtension' },
};

/** The pass-through extensions, each with the namespace to bind it back to. */
function foreignExtensions(feature: Feature): [string, string, string][] {
  const out: [name: string, ns: string, value: string][] = [];

  for (const [key, value] of Object.entries(feature.properties ?? {})) {
    const at = key.indexOf(':');

    if (at < 1 || typeof value !== 'string') {
      continue;
    }

    const prefix = key.slice(0, at);

    const ns = OWN_PREFIXES.has(prefix) ? undefined : KNOWN_PREFIXES[prefix];

    if (ns) {
      out.push([key, ns, value]);
    }
  }

  return out;
}

/** `#rrggbbaa` as gpx_style writes it: bare rgb hex, alpha stated separately. */
function addGpxStyle(
  parent: Element,
  local: 'line' | 'fill',
  color: string,
): Element {
  const { color: rgb, opacity } = splitColorAlpha(color);

  const el = createElement(parent, [GPX_STYLE_NS, local]);

  if (rgb) {
    createElement(el, [GPX_STYLE_NS, 'color'], rgb.slice(1));
  }

  createElement(el, [GPX_STYLE_NS, 'opacity'], opacity.toFixed(2));

  return el;
}

/**
 * The feature's label, property table and style, as the elements `parseGpx`
 * reads them from: `fm:*` losslessly, `osmand:*` as it arrived, and gpx_style
 * for consumers that know neither.
 */
function addExtensions(parent: Element, feature: Feature): void {
  const properties = feature.properties;

  const fields = fmFields(feature);

  const osmand = Object.entries(properties ?? {}).filter(
    (entry): entry is [string, string] =>
      entry[0].startsWith('osmand:') && typeof entry[1] === 'string',
  );

  // GPX has no properties of its own, so data it has no element for travels as
  // our table — otherwise a key the user typed into the editor reaches the file
  // nowhere at all.
  const rows = Object.entries(featureExportTable(properties, NATIVE_KEYS));

  // Made only once something needs it, so nothing has to keep a list of what
  // this function writes in step with a guard.
  let extensions: Element | undefined;

  const ext = () => (extensions ??= createElement(parent, 'extensions'));

  for (const [tag, value] of Object.entries(fields)) {
    createElement(ext(), [FM_NS, `fm:${tag}`], value);
  }

  if (rows.length > 0) {
    appendProps(ext(), Object.fromEntries(rows));
  }

  for (const [key, value] of osmand) {
    createElement(
      ext(),
      [OSMAND_NS, `osmand:${key.slice('osmand:'.length)}`],
      value,
    );
  }

  const containers = new Map<string, Element>();

  for (const [name, ns, value] of foreignExtensions(feature)) {
    const wrapper = CONTAINERS[ns]?.[parent.localName];

    let target = ext();

    if (wrapper) {
      let container = containers.get(wrapper);

      if (!container) {
        container = createElement(target, [ns, wrapper]);

        containers.set(wrapper, container);
      }

      target = container;
    }

    createElement(target, [ns, name], value);
  }

  const { type } = feature.geometry;

  if (fields['color'] && type !== 'Point' && type !== 'MultiPoint') {
    // The fill comes first, as the schema and the drawing writer have it.
    if (fields['type'] === 'polygon') {
      addGpxStyle(ext(), 'fill', fields['fillColor'] ?? fields['color']);
    }

    const line = addGpxStyle(ext(), 'line', fields['color']);

    if (fields['width']) {
      createElement(line, [GPX_STYLE_NS, 'width'], fields['width']);
    }
  }
}

// Emits a `<trkpt>`/`<rtept>` with elevation, time and per-point sensor
// extensions reconstructed from the coordinate and `coordinateProperties`, so a
// track imported as GeoJSON re-exports at the same fidelity as a preserved raw
// GPX would.
function addTrackPoint(
  parent: Element,
  name: 'trkpt' | 'rtept',
  coord: number[],
  props: Feature['properties'],
  seg: number | null,
  i: number,
): void {
  const ptEle = createElement(
    parent,
    name,
    undefined,
    toLatLon({ lat: coord[1], lon: coord[0] }),
  );

  if (typeof coord[2] === 'number') {
    createElement(ptEle, 'ele', coord[2].toString());
  }

  const time = coordPropAt(props, 'times', seg, i);

  if (time != null) {
    createElement(ptEle, 'time', String(time));
  }

  const tpx = Object.entries(GPXTPX_POINT_PROPS)
    .map(([key, local]) => [local, coordPropAt(props, key, seg, i)] as const)
    .filter((e): e is [string, number | string] => e[1] != null);

  const custom = Object.entries(CUSTOM_POINT_PROPS)
    .map(([key, local]) => [local, coordPropAt(props, key, seg, i)] as const)
    .filter((e): e is [string, number | string] => e[1] != null);

  if (tpx.length === 0 && custom.length === 0) {
    return;
  }

  const ext = createElement(ptEle, 'extensions');

  if (tpx.length) {
    const tpxEle = createElement(ext, [
      GPXTPX_NS,
      'gpxtpx:TrackPointExtension',
    ]);

    for (const [local, value] of tpx) {
      createElement(tpxEle, [GPXTPX_NS, `gpxtpx:${local}`], String(value));
    }
  }

  for (const [local, value] of custom) {
    createElement(ext, local, String(value));
  }
}

// Appends a GeoJSON feature/collection to an existing `<gpx>` document as
// waypoints, routes and tracks, reconstructing per-point elevation/time/sensor
// data from `coordinateProperties` (see {@link addTrackPoint}). togeojson tags
// GPX routes with `_gpxType: 'rte'`; those round-trip back to `<rte>`.
export function addGeojson(
  doc: Document,
  geojson: Feature | FeatureCollection,
): void {
  for (const pass of ['wpt', 'rte', 'trk'] as const) {
    for (const feature of geojson.type === 'FeatureCollection'
      ? geojson.features
      : [geojson]) {
      const g = feature.geometry;

      const isRoute = feature.properties?.['_gpxType'] === 'rte';

      switch (g.type) {
        case 'Point':
          if (pass === 'wpt') {
            addWaypoint(doc, g.coordinates, feature);
          }

          break;

        case 'MultiPoint':
          if (pass === 'wpt') {
            for (const pt of g.coordinates) {
              addWaypoint(doc, pt, feature);
            }
          }

          break;

        case 'LineString':
          if (isRoute ? pass === 'rte' : pass === 'trk') {
            const parentEle = createElement(
              doc.documentElement,
              isRoute ? 'rte' : 'trk',
            );

            addLineMeta(parentEle, feature);

            // Before the points, as the schema orders a trk's/rte's children.
            addExtensions(parentEle, feature);

            const ptParent = isRoute
              ? parentEle
              : createElement(parentEle, 'trkseg');

            g.coordinates.forEach((pt, i) => {
              addTrackPoint(
                ptParent,
                isRoute ? 'rtept' : 'trkpt',
                pt,
                feature.properties,
                null,
                i,
              );
            });
          }

          break;

        case 'Polygon':

        // eslint-disable-next-line no-fallthrough
        case 'MultiLineString':
          if (pass === 'trk') {
            const trkEle = createElement(doc.documentElement, 'trk');

            addLineMeta(trkEle, feature);

            addExtensions(trkEle, feature);

            g.coordinates.forEach((seg, s) => {
              const trksegEle = createElement(trkEle, 'trkseg');

              seg.forEach((pt, i) => {
                addTrackPoint(trksegEle, 'trkpt', pt, feature.properties, s, i);
              });
            });
          }

          break;

        case 'MultiPolygon':
          if (pass === 'trk') {
            const trkEle = createElement(doc.documentElement, 'trk');

            addLineMeta(trkEle, feature);

            addExtensions(trkEle, feature);

            for (const seg0 of g.coordinates) {
              for (const seg of seg0) {
                const trksegEle = createElement(trkEle, 'trkseg');

                seg.forEach((pt, i) => {
                  addTrackPoint(
                    trksegEle,
                    'trkpt',
                    pt,
                    feature.properties,
                    null,
                    i,
                  );
                });
              }
            }
          }

          break;
      }
    }
  }
}

// Builds a standalone `<gpx>` document from a GeoJSON feature/collection. The
// `addGeojson` passes already append nodes in wpt/rte/trk order, so no
// reordering is needed. Primarily a seam for round-trip testing the writer.
export function geojsonToGpxDoc(
  geojson: Feature | FeatureCollection,
): Document {
  const doc = document.implementation.createDocument(GPX_NS, 'gpx', null);

  doc.documentElement.setAttributeNS(XMLNS_NS, 'xmlns:gpxtpx', GPXTPX_NS);

  doc.documentElement.setAttributeNS(XMLNS_NS, 'xmlns:fm', FM_NS);

  doc.documentElement.setAttributeNS(XMLNS_NS, 'xmlns:osmand', OSMAND_NS);

  doc.documentElement.setAttribute('version', '1.1');

  addGeojson(doc, geojson);

  return doc;
}
