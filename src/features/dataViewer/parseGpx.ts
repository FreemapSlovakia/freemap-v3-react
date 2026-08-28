import {
  FM_NS,
  FM_TAGS,
  GPX_STYLE_NS,
  KNOWN_NS_PREFIXES,
  OSMAND_NS,
  POINT_CHANNELS,
} from '@features/mapFeaturesExport/model/processors/gpxExporter.js';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';

/**
 * GPX → GeoJSON, in document order and one pass. Shapes the app relies on: one
 * `<trkseg>` is a `LineString` and several a `MultiLineString`, with the
 * `coordinateProperties` series flat for the former and one array per segment
 * for the latter. See `doc/elevation-and-colorizers.md` for the rest.
 */
export function parseGpx(doc: Document): FeatureCollection<Geometry> {
  const features: Feature<Geometry>[] = [];

  // Direct children only: a subtree search finds a trackpoint's `<name>` and
  // `<time>` too, and one point's value then stands for the whole line.
  for (const el of Array.from(doc.documentElement.children)) {
    const feature =
      el.localName === 'wpt'
        ? waypointFeature(el)
        : el.localName === 'trk' || el.localName === 'rte'
          ? lineFeature(el, el.localName)
          : null;

    if (feature) {
      features.push(feature);
    }
  }

  return { type: 'FeatureCollection', features };
}

// Index loops rather than `Array.from`: these run per trackpoint, and a track
// is routinely six figures of them.
function childNamed(el: Element, local: string): Element | undefined {
  const { children } = el;

  for (let i = 0; i < children.length; i++) {
    if (children[i]!.localName === local) {
      return children[i];
    }
  }

  return undefined;
}

function childrenNamed(el: Element, local: string): Element[] {
  const found: Element[] = [];

  const { children } = el;

  for (let i = 0; i < children.length; i++) {
    if (children[i]!.localName === local) {
      found.push(children[i]!);
    }
  }

  return found;
}

const textOf = (el: Element | null | undefined): string | undefined =>
  el?.textContent?.trim() || undefined;

function numberOf(el: Element | null | undefined): number | undefined {
  // Through `textOf`, or an empty `<ele/>` reads as 0 rather than as absent.
  const value = textOf(el);

  const n = value === undefined ? Number.NaN : Number(value);

  return Number.isFinite(n) ? n : undefined;
}

const firstNS = (el: Element, ns: string, local: string): Element | undefined =>
  el.getElementsByTagNameNS(ns, local)[0];

/** The points of one `<trkseg>`, or of a `<rte>`, as coordinates and series. */
type Segment = {
  positions: Position[];
  channels: Map<string, unknown[]>;
};

/** Garmin nests its per-point values; anything else states one of its own. */
const CHANNEL_CONTAINERS = new Set(['TrackPointExtension', 'PowerExtension']);

/**
 * The series an element's values belong to. Memoized because the fallback
 * builds a string per element read, which is per point per channel.
 */
const channelNames = new Map<string, string>([
  ...POINT_CHANNELS.map(({ local, series }): [string, string] => [
    local,
    series,
  ]),
  // What other dialects call two of them.
  ['heart', 'heart'],
  ['PowerInWatts', 'powers'],
]);

function channelName(local: string): string {
  let name = channelNames.get(local);

  if (name === undefined) {
    name = `${local}s`;

    channelNames.set(local, name);
  }

  return name;
}

/**
 * Writes a point's value into its series, filling in for the points that
 * carried nothing — every series has one entry per coordinate, which is what
 * lets simplify, split and export cut them together with the geometry. Assigned
 * by index, since a point may state the same channel twice (a merged file
 * carrying both `<power>` and `<gpxpx:PowerInWatts>`); the last one wins rather
 * than shifting every later point of the segment.
 */
function writeChannel(
  channels: Map<string, unknown[]>,
  name: string,
  at: number,
  value: string | number,
): void {
  let series = channels.get(name);

  if (!series) {
    series = [];

    channels.set(name, series);
  }

  while (series.length < at) {
    series.push(null);
  }

  series[at] = value;
}

function readChannels(
  extensions: Element,
  channels: Map<string, unknown[]>,
  at: number,
): void {
  const { children } = extensions;

  for (let i = 0; i < children.length; i++) {
    const el = children[i]!;

    if (CHANNEL_CONTAINERS.has(el.localName)) {
      readChannels(el, channels, at);

      continue;
    }

    const value = textOf(el);

    if (value !== undefined) {
      const n = Number(value);

      writeChannel(
        channels,
        channelName(el.localName),
        at,
        Number.isFinite(n) ? n : value,
      );
    }
  }
}

/** One `<trkseg>`/`<rte>`'s points; `null` where they don't make a line. */
function readSegment(parent: Element, pointTag: string): Segment | null {
  const positions: Position[] = [];

  const channels = new Map<string, unknown[]>();

  const points = parent.children;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i]!;

    if (pt.localName !== pointTag) {
      continue;
    }

    const lat = Number(pt.getAttribute('lat'));

    const lon = Number(pt.getAttribute('lon'));

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      continue;
    }

    // One pass over the point's children for all three of them.
    let ele: number | undefined;

    let time: string | undefined;

    let extensions: Element | undefined;

    const { children } = pt;

    for (let j = 0; j < children.length; j++) {
      const child = children[j]!;

      switch (child.localName) {
        case 'ele':
          ele = numberOf(child);
          break;
        case 'time':
          time = textOf(child);
          break;
        case 'extensions':
          extensions = child;
          break;
      }
    }

    const at =
      positions.push(ele === undefined ? [lon, lat] : [lon, lat, ele]) - 1;

    if (time !== undefined) {
      writeChannel(channels, 'times', at, time);
    }

    if (extensions) {
      readChannels(extensions, channels, at);
    }
  }

  // One position is not a line — GeoJSON says so, and turf and Leaflet both
  // read it as one anyway.
  if (positions.length < 2) {
    return null;
  }

  for (const series of channels.values()) {
    while (series.length < positions.length) {
      series.push(null);
    }
  }

  return { positions, channels };
}

/** The segments' series, laid out alongside their coordinates. */
function collectChannels(
  segments: Segment[],
): Record<string, unknown> | undefined {
  const names = new Set<string>();

  for (const segment of segments) {
    for (const name of segment.channels.keys()) {
      names.add(name);
    }
  }

  if (names.size === 0) {
    return undefined;
  }

  const multi = segments.length > 1;

  const channels: Record<string, unknown> = {};

  for (const name of names) {
    const perSegment = segments.map(
      (segment) =>
        segment.channels.get(name) ??
        new Array<null>(segment.positions.length).fill(null),
    );

    channels[name] = multi ? perSegment : perSegment[0];
  }

  return channels;
}

/** GPX metadata every kind of element carries in the same place. */
function commonProperties(el: Element): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  for (const tag of ['name', 'cmt', 'desc', 'src', 'type', 'time'] as const) {
    const value = textOf(childNamed(el, tag));

    if (value !== undefined) {
      properties[tag] = value;
    }
  }

  const links = childrenNamed(el, 'link').map((link) => ({
    href: link.getAttribute('href'),
    text: textOf(childNamed(link, 'text')),
    type: textOf(childNamed(link, 'type')),
  }));

  if (links.length > 0) {
    properties['links'] = links;
  }

  return properties;
}

/** Copies a namespace's fields onto the canonical `<prefix>:<tag>` keys. */
function copyNs(
  extensions: Element,
  ns: string,
  prefix: string,
  tags: readonly string[],
  properties: Record<string, unknown>,
): void {
  for (const tag of tags) {
    const value = textOf(firstNS(extensions, ns, tag));

    if (value !== undefined) {
      properties[`${prefix}:${tag}`] = value;
    }
  }
}

const OSMAND_TAGS = ['icon', 'background', 'color', 'fill_color', 'width'];

/**
 * Our own and the two foreign styling dialects, under the canonical keys
 * `styleFromProperties` reads. Each is stated once: nothing carries the
 * element's own prefix onward.
 */
function readExtensions(el: Element, properties: Record<string, unknown>) {
  const extensions = childNamed(el, 'extensions');

  if (!extensions) {
    return;
  }

  copyNs(extensions, FM_NS, 'freemap', FM_TAGS, properties);

  readFmProps(extensions, properties);

  copyNs(extensions, OSMAND_NS, 'osmand', OSMAND_TAGS, properties);

  const line = firstNS(extensions, GPX_STYLE_NS, 'line');

  if (line) {
    const color = textOf(firstNS(line, GPX_STYLE_NS, 'color'));

    if (color) {
      properties['stroke'] = color.startsWith('#') ? color : `#${color}`;
    }

    const opacity = numberOf(firstNS(line, GPX_STYLE_NS, 'opacity'));

    if (opacity !== undefined) {
      properties['stroke-opacity'] = opacity;
    }

    // The schema says millimetres; every real-world writer (Locus, …) means
    // pixels, and reading it as mm makes a "6" a 23 px slab.
    const width = numberOf(firstNS(line, GPX_STYLE_NS, 'width'));

    if (width !== undefined) {
      properties['stroke-width'] = width;
    }
  }

  // The de-facto polygon signal of other consumers (Mapbox tooling, GAIA),
  // which `lineStyleFromProperties` falls back to without a `freemap:type`.
  if (firstNS(extensions, GPX_STYLE_NS, 'fill')) {
    properties['gpx_style:hasFill'] = 'true';
  }

  readForeignExtensions(extensions, properties);
}

const CANONICALIZED_NS = new Set([FM_NS, OSMAND_NS, GPX_STYLE_NS]);

/**
 * Whatever else the file put in this element's own `<extensions>`, under its
 * qualified name. Leaves only: a container's text is its children's run
 * together.
 */
function readForeignExtensions(
  el: Element,
  properties: Record<string, unknown>,
): void {
  for (const child of Array.from(el.children)) {
    if (child.children.length > 0) {
      readForeignExtensions(child, properties);

      continue;
    }

    const ns = child.namespaceURI ?? '';

    const value = textOf(child);

    if (value === undefined || CANONICALIZED_NS.has(ns)) {
      continue;
    }

    const prefix = KNOWN_NS_PREFIXES[ns];

    const key = prefix ? `${prefix}:${child.localName}` : child.tagName;

    // Never over what the element states itself: an extension in no namespace
    // is keyed by its bare name, and may well be called `name`.
    if (!(key in properties)) {
      properties[key] = value;
    }
  }
}

/**
 * The `<fm:prop>` table an element carries. Its presence is what tells our own
 * file from anyone else's: `<name>` there holds the label already rendered, so
 * the conversion takes the table instead of reading the name back as data.
 */
function readFmProps(
  extensions: Element,
  properties: Record<string, unknown>,
): void {
  const rows = Array.from(extensions.getElementsByTagNameNS(FM_NS, 'prop'));

  if (rows.length === 0) {
    return;
  }

  const table: Record<string, string> = {};

  for (const row of rows) {
    const key = row.getAttribute('key');

    // Untrimmed, and an empty one still counts: the value is the user's.
    if (key) {
      table[key] = row.textContent ?? '';
    }
  }

  properties['freemap:props'] = table;
}

function waypointFeature(wpt: Element): Feature<Geometry> | null {
  const lat = Number(wpt.getAttribute('lat'));

  const lon = Number(wpt.getAttribute('lon'));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const properties = commonProperties(wpt);

  const sym = textOf(childNamed(wpt, 'sym'));

  if (sym !== undefined) {
    properties['sym'] = sym;
  }

  readExtensions(wpt, properties);

  const ele = numberOf(childNamed(wpt, 'ele'));

  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'Point',
      coordinates: ele === undefined ? [lon, lat] : [lon, lat, ele],
    },
  };
}

/**
 * A `<trk>` (points grouped into `<trkseg>`s) or a `<rte>` (points directly
 * under it), as one line feature.
 */
function lineFeature(
  el: Element,
  kind: 'trk' | 'rte',
): Feature<Geometry> | null {
  const pointTag = kind === 'trk' ? 'trkpt' : 'rtept';

  const segments = (
    kind === 'trk' ? childrenNamed(el, 'trkseg') : [el]
  ).flatMap((segment) => readSegment(segment, pointTag) ?? []);

  if (segments.length === 0) {
    return null;
  }

  const properties: Record<string, unknown> = {
    _gpxType: kind,
    ...commonProperties(el),
  };

  readExtensions(el, properties);

  const channels = collectChannels(segments);

  if (channels) {
    properties['coordinateProperties'] = channels;
  }

  const coordinates = segments.map((segment) => segment.positions);

  return {
    type: 'Feature',
    properties,
    geometry:
      coordinates.length > 1
        ? { type: 'MultiLineString', coordinates }
        : { type: 'LineString', coordinates: coordinates[0]! },
  };
}
