import type {
  Line,
  Point,
} from '@features/drawing/model/actions/drawingLineActions.js';
import type {
  DrawingPoint,
  DrawingProps,
} from '@features/drawing/model/actions/drawingPointActions.js';
import {
  garminSymToIconSpec,
  iconSpecToGarminSym,
} from '@features/mapFeaturesExport/garminSymMapping.js';
import { isoInstant } from '@shared/dateUtils.js';
import {
  featureDataProps,
  isDataKey,
  KML_IMPORT_KEYS,
  mergeFeatureDataProps,
  ownLabel,
  withEditedLabel,
  withoutKeys,
} from '@shared/featureProperties.js';
import { isClosedGeometry, lineSegments } from '@shared/geoutils.js';
import {
  LINE_STYLE_KEYS,
  lineStyleFromProperties,
  lineStyleToProperties,
  POINT_STYLE_KEYS,
  pointStyleFromProperties,
  pointStyleToProperties,
} from '@shared/styleFromProperties.js';
import { fieldSafe, type TypedValue } from '@shared/urlSerialization.js';
import type { Feature, GeoJsonProperties, Geometry, Position } from 'geojson';
import { COORD_PROPERTIES, readChannels, TIMES } from './trackChannels.js';
import type { TrackLine } from './trackSelection.js';

// The drawing form of a feature, for the URL and a saved map's `points`/`lines`:
// used only where it reads back exactly. The URL's `extended` form also carries
// a recording's per-vertex values, segments and provenance stamps.

/** A vertex; `v` holds its values in its line's `columns`, `null` where missing. */
export type WireVertex = Point & { v?: (number | null)[] };

export type WireLine = Omit<Line, 'points'> & {
  points: WireVertex[];
  /**
   * What the vertex values are: `ele`, `time` (seconds since the epoch), or a
   * channel of `coordinateProperties` by its key.
   */
  columns?: string[];
  /** The vertex each segment after the first starts at — a paused recording. */
  breaks?: number[];
  /** `fm:kind` and togeojson's `_gpxType`, as an import stamped them. */
  kind?: string;
  gpxType?: string;
  /** Data values that aren't strings; `props` has the text. */
  typed?: Record<string, TypedValue>;
  verbatim?: Verbatim;
};

export type WirePoint = DrawingPoint & {
  ele?: number;
  kind?: string;
  typed?: Record<string, TypedValue>;
  verbatim?: Verbatim;
};

/**
 * Keys the editor owns yet can't always reproduce — a symbol no icon of ours
 * says, simplestyle's `marker-size`, a `title` beside the `name` — which the
 * link then carries as they are (`M`).
 */
export const VERBATIM_KEYS = [
  'sym',
  'marker-symbol',
  'icon',
  'marker-size',
  'title',
] as const;

export type VerbatimKey = (typeof VERBATIM_KEYS)[number];

export type Verbatim = Partial<Record<VerbatimKey, string>>;

/** The table a label template reads: the text values and the typed ones. */
function labelTable(
  props: DrawingProps | undefined,
  typed: Readonly<Record<string, TypedValue>> | undefined,
): DrawingProps | undefined {
  return typed
    ? {
        ...props,
        ...Object.fromEntries(
          Object.entries(typed).flatMap(([key, value]) =>
            value === null || typeof value === 'object'
              ? []
              : [[key, String(value)]],
          ),
        ),
      }
    : props;
}

/** Value equality, blind to key order and to keys set to `undefined`. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a)) {
    const bs = b as unknown[];

    return a.length === bs.length && a.every((v, i) => sameValue(v, bs[i]));
  }

  const ao = a as Record<string, unknown>;

  const bo = b as Record<string, unknown>;

  const keys = new Set(
    [...Object.keys(ao), ...Object.keys(bo)].filter(
      (k) => ao[k] !== undefined || bo[k] !== undefined,
    ),
  );

  for (const key of keys) {
    if (!sameValue(ao[key], bo[key])) {
      return false;
    }
  }

  return true;
}

function labelled(
  geometry: Geometry,
  properties: Record<string, unknown>,
  label: string | undefined,
  props: Record<string, string> | undefined,
): GeoJsonProperties {
  return withEditedLabel({ geometry, properties }, label ?? '', props ?? {});
}

export function pointToFeature(point: WirePoint): Feature {
  const geometry: Geometry = {
    type: 'Point',
    coordinates:
      point.ele === undefined
        ? [point.coords.lon, point.coords.lat]
        : [point.coords.lon, point.coords.lat, point.ele],
  };

  return {
    type: 'Feature',
    geometry,
    properties: {
      ...labelled(
        geometry,
        {
          ...pointStyleToProperties(
            mergeFeatureDataProps({}, point.props ?? {}),
            {
              color: point.color,
              markerType: point.markerType,
              icon: point.icon,
            },
          ),
          ...point.typed,
          ...(point.kind !== undefined && { 'fm:kind': point.kind }),
        },
        point.label,
        labelTable(point.props, point.typed),
      ),
      // After the label, which would take a `title` for one of its own.
      ...point.verbatim,
    },
  };
}

const ring = (points: Point[]): Position[] => [
  ...points.map((p): Position => [p.lon, p.lat]),
  ...(points[0] ? [[points[0].lon, points[0].lat]] : []),
];

/**
 * Seconds since the epoch as the ISO time a GPX file writes; `null` past what
 * a `Date` holds, where `toISOString` would throw on a hand-edited link.
 */
const isoTime = (seconds: number) => {
  const ms = Math.round(seconds * 1000);

  return Math.abs(ms) <= 8.64e15 ? isoInstant(ms) : null;
};

/** The line's vertices in segments, at its breaks. */
function segmentsOf<T>(items: T[], breaks: number[] | undefined): T[][] {
  const starts = [0, ...(breaks ?? [])];

  return starts.map((start, i) => items.slice(start, starts[i + 1]));
}

/** A line or a polygon, its holes being the lines that name it as theirs. */
export function lineToFeature(line: WireLine, holes: WireLine[] = []): Feature {
  const columns = line.columns ?? [];

  const ele = columns.indexOf('ele');

  const position = (p: WireVertex): Position => {
    const z = ele < 0 ? null : (p.v?.[ele] ?? null);

    return z === null ? [p.lon, p.lat] : [p.lon, p.lat, z];
  };

  const segments = segmentsOf(line.points, line.breaks);

  const geometry: Geometry =
    line.type === 'polygon'
      ? {
          type: 'Polygon',
          coordinates: [ring(line.points), ...holes.map((h) => ring(h.points))],
        }
      : segments.length > 1
        ? {
            type: 'MultiLineString',
            coordinates: segments.map((s) => s.map(position)),
          }
        : { type: 'LineString', coordinates: line.points.map(position) };

  // The channels, laid out as `writeChannels` would: flat for one line, a
  // list per segment for several.
  const channels: Record<string, unknown> = {};

  for (const [i, column] of columns.entries()) {
    if (column === 'ele') {
      continue;
    }

    const values = segments.map((segment) =>
      segment.map((p) => {
        const value = p.v?.[i] ?? null;

        return column === 'time' && value !== null ? isoTime(value) : value;
      }),
    );

    channels[column === 'time' ? TIMES : column] =
      segments.length > 1 ? values : values[0];
  }

  return {
    type: 'Feature',
    geometry,
    properties: {
      ...labelled(
        geometry,
        {
          ...lineStyleToProperties(
            mergeFeatureDataProps({}, line.props ?? {}),
            {
              type: line.type,
              color: line.color,
              fillColor: line.fillColor,
              width: line.width,
              dashArray: line.dashArray,
              lineCap: line.lineCap,
              lineJoin: line.lineJoin,
            },
          ),
          ...(Object.keys(channels).length > 0 && {
            [COORD_PROPERTIES]: channels,
          }),
          ...line.typed,
          ...(line.kind !== undefined && { 'fm:kind': line.kind }),
          ...(line.gpxType !== undefined && { _gpxType: line.gpxType }),
        },
        line.label,
        labelTable(line.props, line.typed),
      ),
      // After the label, which would take a `title` for one of its own.
      ...line.verbatim,
    },
  };
}

function labelOf(properties: GeoJsonProperties): string | undefined {
  const name = properties?.['name'];

  return ownLabel(properties) ?? (typeof name === 'string' ? name : undefined);
}

/**
 * The data values the text table can't type: numbers and booleans, which it
 * has as text, and nulls and nested values, which it leaves out.
 */
function typedOf(
  properties: GeoJsonProperties,
): Record<string, TypedValue> | undefined {
  const table = featureDataProps(properties);

  const typed = Object.fromEntries(
    Object.entries(properties ?? {}).flatMap(([key, value]) =>
      ((value === null || typeof value === 'object') &&
        isDataKey(key) &&
        !Object.hasOwn(table, key)) ||
      ((typeof value === 'number' || typeof value === 'boolean') &&
        table[key] === String(value))
        ? [[key, value]]
        : [],
    ),
  );

  return Object.keys(typed).length ? typed : undefined;
}

/** The text table, without what `typed` carries. */
function propsOf(
  properties: GeoJsonProperties,
  typed: Readonly<Record<string, unknown>> | undefined,
) {
  const props = Object.fromEntries(
    Object.entries(featureDataProps(properties)).filter(
      ([key]) => !typed || !Object.hasOwn(typed, key),
    ),
  );

  return Object.keys(props).length ? props : undefined;
}

/**
 * The verbatim keys the feature holds that its style doesn't reproduce: for a
 * point, an unmapped Garmin `sym` or a KML image URL among them.
 */
function verbatimOf(
  properties: GeoJsonProperties,
  point: boolean,
): Verbatim | undefined {
  const style = new Set(point ? pointStyleKeys(properties) : []);

  const verbatim = Object.fromEntries(
    VERBATIM_KEYS.flatMap((key) => {
      const value = properties?.[key];

      return typeof value === 'string' && !style.has(key) ? [[key, value]] : [];
    }),
  );

  return Object.keys(verbatim).length ? verbatim : undefined;
}

/**
 * Keys that say only what the resolved style already does: an `icon` that is
 * an icon spec (a KML image URL is data), and a Garmin `sym` that maps to an
 * icon and back to itself — an unmapped one would be lost.
 */
function pointStyleKeys(properties: GeoJsonProperties): string[] {
  const icon = properties?.['icon'];

  const sym = properties?.['sym'];

  const symbol = properties?.['marker-symbol'];

  const reproduced = (value: unknown) =>
    typeof value === 'string' &&
    iconSpecToGarminSym(garminSymToIconSpec(value)) === value;

  return [
    ...POINT_STYLE_KEYS,
    ...(typeof icon !== 'string' || !icon.includes('/') ? ['icon'] : []),
    ...(sym === undefined || reproduced(sym) ? ['sym'] : []),
    ...(symbol === undefined || reproduced(symbol) ? ['marker-symbol'] : []),
  ];
}

/** Times as instants: a re-spelling (`.000Z`, an offset) names the same one. */
function withInstants(properties: Record<string, unknown>) {
  const cp = properties[COORD_PROPERTIES];

  const times =
    cp && typeof cp === 'object'
      ? (cp as Record<string, unknown>)[TIMES]
      : undefined;

  if (!Array.isArray(times)) {
    return properties;
  }

  const instant = (value: unknown): unknown =>
    Array.isArray(value)
      ? value.map(instant)
      : typeof value === 'string'
        ? Date.parse(value)
        : value;

  return {
    ...properties,
    [COORD_PROPERTIES]: { ...(cp as object), [TIMES]: instant(times) },
  };
}

/** A point's properties as compared; see {@link comparable}. */
function comparablePoint(properties: GeoJsonProperties) {
  return {
    ...withoutKeys(properties, [
      ...pointStyleKeys(properties),
      ...KML_IMPORT_KEYS,
    ]),
    '#style': pointStyleFromProperties(properties),
  };
}

function stamp(properties: GeoJsonProperties, key: string): string | undefined {
  const value = properties?.[key];

  return typeof value === 'string' ? value : undefined;
}

/**
 * A line's properties as compared, by what they mean: the style as resolved
 * (a type the geometry already says left out, so an unstyled import reads as
 * its drawn copy), and times as instants.
 */
function comparable(
  properties: GeoJsonProperties,
  geometry: Geometry,
): GeoJsonProperties {
  const style = lineStyleFromProperties(
    properties,
    geometry.type === 'Polygon' ||
      ((geometry.type === 'LineString' ||
        geometry.type === 'MultiLineString') &&
        isClosedGeometry(geometry)),
  );

  const natural =
    (style.type === 'polygon' && geometry.type === 'Polygon') ||
    (style.type === 'line' &&
      (geometry.type === 'LineString' || geometry.type === 'MultiLineString'));

  return withInstants({
    ...withoutKeys(properties, [...LINE_STYLE_KEYS, ...KML_IMPORT_KEYS]),
    '#style': natural ? { ...style, type: undefined } : style,
  });
}

/**
 * A line's vertices with the columns its recording carries, or `undefined`
 * where a value is nothing a column can hold.
 */
function recordedVertices(
  feature: TrackLine,
): { points: WireVertex[]; columns: string[]; breaks: number[] } | undefined {
  const segments = lineSegments(feature.geometry);

  const positions = segments.flat();

  if (positions.some((p) => p.length > 3)) {
    return undefined;
  }

  const hasEle = positions.some((p) => p.length === 3);

  const channels = readChannels(feature);

  const columns = [
    ...(hasEle ? ['ele'] : []),
    ...channels.map(({ key }) => (key === TIMES ? 'time' : key)),
  ];

  const values: (number | null)[][] = positions.map((p) =>
    hasEle ? [p[2] ?? null] : [],
  );

  for (const channel of channels) {
    for (const [i, value] of channel.segments.flat().entries()) {
      let v: number | null;

      if (value === null || value === undefined) {
        v = null;
      } else if (channel.key === TIMES && typeof value === 'string') {
        v = Date.parse(value) / 1000;
      } else if (typeof value === 'number') {
        v = value;
      } else {
        return undefined;
      }

      if (v !== null && !Number.isFinite(v)) {
        return undefined;
      }

      values[i]!.push(v);
    }
  }

  const breaks: number[] = [];

  let at = 0;

  for (const segment of segments.slice(0, -1)) {
    at += segment.length;

    breaks.push(at);
  }

  return {
    points: positions.map(([lon, lat], id) => ({
      lat: lat!,
      lon: lon!,
      id,
      ...(columns.length > 0 && { v: values[id] }),
    })),
    columns,
    breaks,
  };
}

const flat = (positions: Position[]) => positions.every((p) => p.length === 2);

type FeatureWire = { point: WirePoint } | { lines: WireLine[] } | undefined;

// Per feature object, as an edit replaces only what it touches: re-encoding
// every unchanged feature on each drag move was most of the cost. Read-only.
const wireCaches = [
  new WeakMap<Feature, FeatureWire>(),
  new WeakMap<Feature, FeatureWire>(),
];

/**
 * The feature as the URL and a saved map's `points`/`lines` hold it: one point,
 * or a line, or a polygon followed by its holes (`holeOf` 0 — the caller places
 * them). `extended` takes recorded data too, which only the URL can say.
 * `undefined` when that form would lose anything.
 */
export function featureToWire(feature: Feature, extended = false): FeatureWire {
  const cache = wireCaches[extended ? 1 : 0]!;

  if (cache.has(feature)) {
    return cache.get(feature);
  }

  const wire = encodeFeature(feature, extended);

  cache.set(feature, wire);

  return wire;
}

function encodeFeature(feature: Feature, extended: boolean): FeatureWire {
  const { geometry, properties } = feature;

  const label = labelOf(properties) || undefined;

  // The link alone: a saved map's `points`/`lines` keep the shape older
  // clients read, so a typed value sends the feature to the document's rest.
  const typed = extended ? typedOf(properties) : undefined;

  const props = propsOf(properties, typed);

  const kind = extended ? stamp(properties, 'fm:kind') : undefined;

  const verbatim = extended
    ? verbatimOf(properties, geometry.type === 'Point')
    : undefined;

  if (geometry.type === 'Point') {
    const [lon, lat, ele] = geometry.coordinates;

    if (
      geometry.coordinates.length > (extended ? 3 : 2) ||
      lon === undefined ||
      lat === undefined
    ) {
      return undefined;
    }

    const style = pointStyleFromProperties(properties);

    const point: WirePoint = {
      coords: { lat, lon },
      ...(ele !== undefined && { ele }),
      ...(label !== undefined && { label }),
      ...(style.color !== undefined && { color: style.color }),
      ...(style.markerType !== undefined && { markerType: style.markerType }),
      ...(style.icon !== undefined && { icon: style.icon }),
      ...(props && { props }),
      ...(typed && { typed }),
      ...(verbatim && { verbatim }),
      ...(kind !== undefined && { kind }),
    };

    return (!extended || linkSafe(point)) &&
      sameValue(
        comparablePoint(pointToFeature(point).properties),
        comparablePoint(properties),
      )
      ? { point }
      : undefined;
  }

  let lines: WireLine[];

  if (geometry.type === 'Polygon') {
    if (!geometry.coordinates.every(flat)) {
      return undefined;
    }

    lines = geometry.coordinates.map((r, i) => ({
      type: 'polygon',
      points: r.slice(0, -1).map(([lon, lat], id) => ({
        lat: lat!,
        lon: lon!,
        id,
      })),
      ...(i > 0 && { holeOf: 0 }),
    }));
  } else if (
    geometry.type === 'LineString' ||
    (extended && geometry.type === 'MultiLineString')
  ) {
    const recorded = extended
      ? recordedVertices(feature as TrackLine)
      : geometry.type === 'LineString' && flat(geometry.coordinates)
        ? {
            points: geometry.coordinates.map(([lon, lat], id) => ({
              lat: lat!,
              lon: lon!,
              id,
            })),
            columns: [],
            breaks: [],
          }
        : undefined;

    if (!recorded) {
      return undefined;
    }

    lines = [
      {
        type: 'line',
        points: recorded.points,
        ...(recorded.columns.length > 0 && { columns: recorded.columns }),
        ...(recorded.breaks.length > 0 && { breaks: recorded.breaks }),
        ...(kind !== undefined && { kind }),
        ...(extended &&
          stamp(properties, '_gpxType') !== undefined && {
            gpxType: stamp(properties, '_gpxType'),
          }),
      },
    ];
  } else {
    return undefined;
  }

  const style = lineStyleFromProperties(
    properties,
    geometry.type === 'Polygon',
  );

  const [outer, ...holes] = lines;

  const line: WireLine = {
    ...outer!,
    ...(label !== undefined && { label }),
    ...(props && { props }),
    ...(typed && { typed }),
    ...(verbatim && { verbatim }),
    ...(style.color !== undefined && { color: style.color }),
    ...(style.fillColor !== undefined && { fillColor: style.fillColor }),
    ...(style.width !== undefined && { width: style.width }),
    ...(style.dashArray !== undefined && { dashArray: style.dashArray }),
    ...(style.lineCap !== undefined && { lineCap: style.lineCap }),
    ...(style.lineJoin !== undefined && { lineJoin: style.lineJoin }),
  };

  const back = lineToFeature(line, holes);

  return (!extended || linkSafe(line)) &&
    sameValue(back.geometry, geometry) &&
    sameValue(
      comparable(back.properties, geometry),
      comparable(properties, geometry),
    )
    ? { lines: [line, ...holes] }
    : undefined;
}

/**
 * Whether the link can write the item: it writes its text fields raw, so a
 * separator in one would split it, and its parser drops a `__proto__` key.
 */
function linkSafe(item: WirePoint | WireLine): boolean {
  const pairKeys = [
    ...Object.keys(item.props ?? {}),
    ...Object.keys(item.typed ?? {}),
  ];

  return (
    pairKeys.every((key) => key !== '__proto__') &&
    [
      ...pairKeys,
      ...Object.values(item.props ?? {}),
      ...Object.values(item.verbatim ?? {}),
      ...('columns' in item ? (item.columns ?? []) : []),
      ...('gpxType' in item ? [item.gpxType] : []),
      ...('fillColor' in item ? [item.fillColor] : []),
      ...('icon' in item ? [item.icon] : []),
      item.label,
      item.color,
      item.kind,
    ].every((text) => typeof text !== 'string' || fieldSafe(text))
  );
}

export type WireForm = { points: DrawingPoint[]; lines: Line[] };

export type WireItem =
  | { kind: 'point'; point: WirePoint }
  | { kind: 'line'; line: WireLine };

/**
 * The features in their wire form, in order — `holeOf` counting lines only, as
 * both the URL and a saved document do. `rest` holds what that form can't say.
 */
export function toWire(
  features: readonly Feature[],
  extended = false,
): {
  items: WireItem[];
  rest: Feature[];
} {
  const items: WireItem[] = [];

  const rest: Feature[] = [];

  let lineCount = 0;

  for (const feature of features) {
    const wire = featureToWire(feature, extended);

    if (!wire) {
      rest.push(feature);
    } else if ('point' in wire) {
      items.push({ kind: 'point', point: wire.point });
    } else {
      const parent = lineCount;

      for (const line of wire.lines) {
        items.push({
          kind: 'line',
          line: line.holeOf === undefined ? line : { ...line, holeOf: parent },
        });

        lineCount++;
      }
    }
  }

  return { items, rest };
}

/** The inverse of {@link toWire}: a hole joins the polygon it names. */
export function fromWire(items: readonly WireItem[]): Feature[] {
  const lines = items.flatMap((item) =>
    item.kind === 'line' ? [item.line] : [],
  );

  // Rings stay flat: a hole of a hole, or of a line, is a polygon of its own.
  const isHole = (line: WireLine) =>
    line.holeOf !== undefined &&
    line.type === 'polygon' &&
    lines[line.holeOf]?.type === 'polygon' &&
    lines[line.holeOf]?.holeOf === undefined &&
    lines[line.holeOf] !== line;

  const features: Feature[] = [];

  let lineIndex = -1;

  for (const item of items) {
    if (item.kind === 'point') {
      features.push(pointToFeature(item.point));

      continue;
    }

    lineIndex++;

    const { line } = item;

    if (isHole(line)) {
      continue;
    }

    const own = lineIndex;

    const holes = lines.filter(
      (candidate) => isHole(candidate) && candidate.holeOf === own,
    );

    if (
      (line.type === 'line' && line.points.length > 1) ||
      (line.type === 'polygon' && line.points.length > 2)
    ) {
      features.push(
        lineToFeature(
          line,
          holes.filter((h) => h.points.length > 2),
        ),
      );
    }
  }

  return features;
}

/**
 * The features split by what can say them, each with its index in the
 * collection: the drawing form's points and lines (a polygon with its holes),
 * and the rest. What the exports write as drawn shapes and as loaded data.
 */
export type FeaturePartition = {
  points: { index: number; point: DrawingPoint }[];
  lines: { index: number; line: Line; holes: Line[] }[];
  rest: { index: number; feature: Feature }[];
};

const partitions = new WeakMap<readonly Feature[], FeaturePartition>();

export function partitionFeatures(
  features: readonly Feature[],
): FeaturePartition {
  let partition = partitions.get(features);

  if (partition) {
    return partition;
  }

  partition = { points: [], lines: [], rest: [] };

  for (const [index, feature] of features.entries()) {
    const wire = featureToWire(feature);

    if (!wire) {
      partition.rest.push({ index, feature });
    } else if ('point' in wire) {
      partition.points.push({ index, point: wire.point });
    } else {
      const [line, ...holes] = wire.lines;

      if (line && line.points.length > (line.type === 'polygon' ? 2 : 1)) {
        partition.lines.push({
          index,
          line,
          holes: holes.filter((hole) => hole.points.length > 2),
        });
      }
    }
  }

  partitions.set(features, partition);

  return partition;
}

/** The pair a saved map's document holds, in the order the features have. */
export function wireForm(items: readonly WireItem[]): WireForm {
  return {
    points: items.flatMap((item) =>
      item.kind === 'point' ? [item.point] : [],
    ),
    lines: items.flatMap((item) => (item.kind === 'line' ? [item.line] : [])),
  };
}

/** A saved map's points then its lines, as items. */
export function wireItems({ points, lines }: WireForm): WireItem[] {
  return [
    ...points.map((point): WireItem => ({ kind: 'point', point })),
    ...lines.map((line): WireItem => ({ kind: 'line', line })),
  ];
}
