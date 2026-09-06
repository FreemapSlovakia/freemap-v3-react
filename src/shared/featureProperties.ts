import { PROPERTY_PREFIX } from '@features/drawing/interpolateLabel.js';
import type { DrawingProps } from '@features/drawing/model/actions/drawingPointActions.js';
import { isClosedGeometry } from '@shared/geoutils.js';
import { lineStyleFromProperties } from '@shared/styleFromProperties.js';
import type { Feature } from 'geojson';

/**
 * Property keys the editor owns rather than shows: the label it edits, the
 * style it writes in every dialect it can read back, and the per-point channels
 * a recording carries. Everything else is the feature's own data.
 */
const RESERVED_KEYS = new Set([
  'name',
  'title',
  'coordinateProperties',
  '_gpxType',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-dasharray',
  'fill',
  'fill-opacity',
  'marker-color',
  'marker-color-opacity',
  'marker-symbol',
  'marker-size',
  'marker-svg',
  'marker-png',
  'markerType',
  'icon',
  'icon-color',
  'icon-opacity',
  'sym',
  'styleUrl',
  'styleHash',
]);

/** Ours: the style the editor writes, and the provenance the parser stamps. */
const RESERVED_PREFIXES = ['freemap:', 'fm:', 'osmand:', 'gpx_style:'];

function isDataKey(key: string): boolean {
  return (
    !RESERVED_KEYS.has(key) &&
    !RESERVED_PREFIXES.some((prefix) => key.startsWith(prefix))
  );
}

function isScalar(value: unknown): value is string | number | boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/**
 * A file of ours states its data twice — as plain properties and here — and
 * this copy is the one the drawing conversion and both exports read.
 */
const OWN_TABLE = 'freemap:props';

export function ownTable(
  properties: Record<string, unknown> | null | undefined,
): DrawingProps | undefined {
  const table = properties?.[OWN_TABLE];

  if (typeof table !== 'object' || table === null || Array.isArray(table)) {
    return undefined;
  }

  const props: DrawingProps = {};

  for (const [key, value] of Object.entries(table)) {
    if (typeof value === 'string') {
      props[key] = value;
    }
  }

  return props;
}

/** The feature's own data stated as plain properties, as text. */
function plainData(
  properties: Record<string, unknown> | null | undefined,
  keep: (key: string) => boolean = () => true,
): DrawingProps {
  const props: DrawingProps = {};

  for (const [key, value] of Object.entries(properties ?? {})) {
    if (isDataKey(key) && isScalar(value) && keep(key)) {
      props[key] = String(value);
    }
  }

  return props;
}

/**
 * The feature's own data, as editable rows. A nested value has no row form, so
 * it stays out of the table and survives untouched.
 */
export function featureDataProps(
  properties: Record<string, unknown> | null | undefined,
): DrawingProps {
  return { ...plainData(properties), ...ownTable(properties) };
}

/** The label as the author wrote it, template and all, where the file carries one. */
export function ownLabel(
  properties: Record<string, unknown> | null | undefined,
): string | undefined {
  const label = properties?.['freemap:label'];

  return typeof label === 'string' ? label : undefined;
}

/**
 * The label a converted feature gets when nothing was asked for: the one the
 * file carries, else a reference to its name — but not for a plain line, whose
 * name is a street name. `labelLines` is the loaded-data conversion, which
 * labels those too. The dialog seeds its field from this and the conversion
 * falls back to it, so what was previewed is what is drawn.
 */
export function defaultLabel(
  feature: Feature,
  labelLines: boolean,
): string | undefined {
  const own = ownLabel(feature.properties);

  if (own) {
    return own;
  }

  const name = feature.properties?.['name'];

  if (typeof name !== 'string' || !name) {
    return undefined;
  }

  const { geometry } = feature;

  const line =
    geometry?.type === 'LineString' || geometry?.type === 'MultiLineString';

  const polygon = line
    ? lineStyleFromProperties(feature.properties, isClosedGeometry(geometry))
        .type === 'polygon'
    : geometry?.type === 'Polygon' || geometry?.type === 'MultiPolygon';

  return !geometry || (line && !polygon && !labelLines)
    ? undefined
    : `{${PROPERTY_PREFIX}name}`;
}

/**
 * The properties a conversion offers to carry: our own table where the file
 * wrote one, else the feature's data together with its name — a datum to carry
 * here, rather than the label field it is in the editor.
 */
export function convertibleProps(
  properties: Record<string, unknown> | null | undefined,
): DrawingProps {
  const own = ownTable(properties);

  if (own) {
    return own;
  }

  const name = properties?.['name'];

  return {
    ...(typeof name === 'string' && name ? { name } : {}),
    ...plainData(properties),
  };
}

/**
 * The table to carry in a format with no properties of its own. `native` names
 * the keys that format states itself, and filters the plain data alone — a row
 * called `name` is a datum of the user's, not the label GPX writes.
 */
export function featureExportTable(
  properties: Record<string, unknown> | null | undefined,
  native: ReadonlySet<string>,
): DrawingProps {
  return {
    // A prefixed key is a namespaced extension, and travels as one.
    ...plainData(properties, (key) => !native.has(key) && !key.includes(':')),
    ...ownTable(properties),
  };
}

/**
 * Puts the edited table back, keeping everything the table never showed. A row
 * that reads the same as before keeps the value it had, so a GeoJSON `"ele":
 * 1234` stays a number unless the user actually retyped it.
 */
export function mergeFeatureDataProps(
  properties: Record<string, unknown> | null | undefined,
  props: DrawingProps,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties ?? {})) {
    if (!isDataKey(key) || !isScalar(value)) {
      out[key] = value;
    }
  }

  for (const [key, value] of Object.entries(props)) {
    // A row named like something the editor owns would replace it: a typed-in
    // `coordinateProperties` would stand where the per-point series was.
    if (!isDataKey(key)) {
      continue;
    }

    const before = properties?.[key];

    out[key] = isScalar(before) && String(before) === value ? before : value;
  }

  // Both statements stay the same, or the edit shows on screen while every
  // reader of the other copy keeps answering with the old one.
  if (ownTable(properties)) {
    out[OWN_TABLE] = { ...props };
  }

  return out;
}
