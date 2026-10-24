import type {
  Line,
  Point,
} from '@features/drawing/model/actions/drawingLineActions.js';
import type {
  DrawingPoint,
  DrawingProps,
} from '@features/drawing/model/actions/drawingPointActions.js';
import type { LatLon } from './types/common.js';

/**
 * How drawing features are written into the URL.
 *
 * Also what the my-maps unsaved-changes comparison digests, so the two can't
 * disagree: anything the URL drops here — a default line cap, a point's id — is
 * dropped from the comparison too, and a map restored from its URL therefore
 * still matches the copy it was saved from.
 */
export function serializeLatLon(point: LatLon | null): string {
  return point ? `${point.lat.toFixed(6)}/${point.lon.toFixed(6)}` : '';
}

/**
 * Whether text can stand in a field as written: it holds neither the record
 * nor the unit separator, which delimit the fields and their pairs.
 */
export const fieldSafe = (text: string) =>
  // biome-ignore lint/suspicious/noControlCharactersInRegex: the field separators
  !/[\x1e\x1f]/.test(text);

/**
 * A field of key/value pairs: `code`, then the pairs joined by the unit
 * separator; empty is no field. Keys and values must be {@link fieldSafe}.
 */
function serializePairs(
  code: string,
  record: Readonly<Record<string, string>> | undefined,
): string {
  const entries = Object.entries(record ?? {});

  return entries.length ? `\x1e${code}${entries.flat().join('\x1f')}` : '';
}

/** The data table, as `P`. */
export function serializeDrawingProps(props: DrawingProps | undefined): string {
  return serializePairs('P', props);
}

/** A data value `P` can't say as text: any JSON value but a string. */
export type TypedValue = number | boolean | null | object;

/**
 * Typed data values as `Q`, each as JSON so it reads back with its type. JSON
 * escapes both separators inside a string.
 */
export function serializeTypedProps(
  typed: Readonly<Record<string, TypedValue>> | undefined,
): string {
  return serializePairs(
    'Q',
    typed &&
      Object.fromEntries(
        Object.entries(typed).map(([key, value]) => [
          key,
          JSON.stringify(value),
        ]),
      ),
  );
}

/** A point's provenance stamp, as a field: `Y` the import's `fm:kind`. */
function serializeKind(kind: string | undefined): string {
  return kind === undefined ? '' : `\x1eY${kind}`;
}

export function serializeDrawingPoint(
  point: DrawingPoint & {
    ele?: number;
    kind?: string;
    typed?: Record<string, TypedValue>;
    verbatim?: Record<string, string>;
  },
): string {
  return `${serializeLatLon(point.coords)}${
    point.ele === undefined ? '' : `/${point.ele}`
  }${point.color ? `\x1eC${point.color}` : ''}${
    point.label ? `\x1eL${point.label}` : ''
  }${
    point.markerType === 'square'
      ? '\x1eSs'
      : point.markerType === 'ring'
        ? '\x1eSr'
        : ''
  }${point.icon ? `\x1eI${point.icon}` : ''}${serializeDrawingProps(point.props)}${serializeTypedProps(point.typed)}${serializePairs('M', point.verbatim)}${serializeKind(point.kind)}`;
}

/**
 * A recorded line's vertices: `lat/lon` and then its values in the order the
 * `V` field names them, empty where missing and trailing ones dropped. `time`
 * is seconds since the epoch on the first vertex that has one and the seconds
 * since the previous one after it, which keeps a 1 Hz recording to a digit.
 * Segments are separated by an empty vertex.
 */
function serializeVertices(
  points: readonly (Point & { v?: (number | null)[] })[],
  columns: readonly string[] | undefined,
  breaks: readonly number[] | undefined,
): string {
  const time = columns?.indexOf('time') ?? -1;

  // In whole milliseconds, so the differences carry no float noise and add up
  // to the very times they were taken from.
  let previousMs: number | undefined;

  const vertices = points.map((point) => {
    const values = (point.v ?? []).map((value, i) => {
      if (value === null || i !== time) {
        return value;
      }

      const ms = Math.round(value * 1000);

      const delta = (previousMs === undefined ? ms : ms - previousMs) / 1000;

      previousMs = ms;

      return delta;
    });

    while (values.length && values.at(-1) === null) {
      values.pop();
    }

    return `${serializeLatLon(point)}${values
      .map((value) => `/${value ?? ''}`)
      .join('')}`;
  });

  const breakAt = new Set(breaks);

  return vertices.map((v, i) => (breakAt.has(i) ? `,${v}` : v)).join(',');
}

/**
 * `holeOf` is passed separately rather than read off the line because only the
 * caller knows what position its parent takes in the list being written.
 */
export function serializeDrawingLine(
  line: Line & {
    points: (Point & { v?: (number | null)[] })[];
    columns?: string[];
    breaks?: number[];
    kind?: string;
    gpxType?: string;
    typed?: Record<string, TypedValue>;
    verbatim?: Record<string, string>;
  },
  holeOf?: number,
): string {
  return `${serializeVertices(line.points, line.columns, line.breaks)}${
    line.width ? `\x1eW${line.width}` : ''
  }${line.color ? `\x1eC${line.color}` : ''}${
    line.fillColor ? `\x1eF${line.fillColor}` : ''
  }${line.label ? `\x1eL${line.label}` : ''}${
    // An empty array means no dashes, same as no array at all — writing `D` with
    // no value would read back as unset and so make the round trip lossy.
    line.dashArray?.length ? `\x1eD${line.dashArray}` : ''
  }${
    line.lineCap === 'butt'
      ? '\x1eKb'
      : line.lineCap === 'square'
        ? '\x1eKs'
        : ''
  }${
    line.lineJoin === 'miter'
      ? '\x1eJm'
      : line.lineJoin === 'bevel'
        ? '\x1eJb'
        : ''
  }${holeOf === undefined ? '' : `\x1eH${holeOf}`}${serializeDrawingProps(line.props)}${serializeTypedProps(line.typed)}${serializePairs('M', line.verbatim)}${
    line.columns?.length ? `\x1eV${line.columns.join('\x1f')}` : ''
  }${serializeKind(line.kind)}${line.gpxType === undefined ? '' : `\x1eG${line.gpxType}`}`;
}
