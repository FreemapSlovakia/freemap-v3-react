import type { Feature, FeatureCollection } from 'geojson';
import {
  createElement,
  GPX_NS,
  GPXTPX_NS,
  toLatLon,
  XMLNS_NS,
} from './gpxExporter.js';

// coordinateProperties key (as togeojson pluralizes it) -> Garmin
// TrackPointExtension child local name. togeojson maps `<gpxtpx:hr>` &c. back to
// these keys on import, so emitting them round-trips the per-point sensor data.
const GPXTPX_POINT_PROPS: Record<string, string> = {
  heart: 'hr',
  cads: 'cad',
  atemps: 'atemp',
  wtemps: 'wtemp',
  depths: 'depth',
  speeds: 'speed',
  courses: 'course',
  bearings: 'bearing',
};

// Non-namespaced trackpoint extensions togeojson reads as `<name>` -> `${name}s`.
const CUSTOM_POINT_PROPS: Record<string, string> = {
  powers: 'power',
};

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

function addName(parent: Element, feature: Feature): void {
  const name = feature.properties?.['name'];

  if (name) {
    createElement(parent, 'name', String(name));
  }
}

// `<wpt>` child elements togeojson reads back into feature properties, in GPX
// 1.1 schema order (these follow `<ele>`).
const WAYPOINT_META = ['time', 'name', 'cmt', 'desc', 'sym', 'type'] as const;

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

            addName(parentEle, feature);

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

            addName(trkEle, feature);

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

            addName(trkEle, feature);

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

  doc.documentElement.setAttribute('version', '1.1');

  addGeojson(doc, geojson);

  return doc;
}
