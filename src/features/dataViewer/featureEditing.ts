import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import type {
  BatchCounts,
  BatchKind,
  BatchPatch,
} from '@shared/batchProperties.js';
import type {
  FeatureProperties,
  LineKind,
} from '@shared/components/FeaturePropertiesModal.js';
import { isoInstant } from '@shared/dateUtils.js';
import {
  type DetailKind,
  detailKeysOf,
  emptyDetails,
  type FeatureDetails,
  isDetailKey,
  isValidDetailNumber,
} from '@shared/featureDetails.js';
import {
  featureDataProps,
  mergeFeatureDataProps,
  ownLabel,
  textRows,
  typedDataTable,
  withEditedLabel,
} from '@shared/featureProperties.js';
import { isClosedGeometry } from '@shared/geoutils.js';
import {
  lineStyleFromProperties,
  lineStyleToProperties,
  pointStyleFromProperties,
  pointStyleToProperties,
} from '@shared/styleFromProperties.js';
import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { FM_KIND, type FmKind } from './provenance.js';
import { readChannels, withChannelKeys } from './trackChannels.js';
import { isTrackLine } from './trackSelection.js';
import { toLocalInput } from './vertexValues.js';

export const isPoint = (geometry: Geometry) =>
  geometry.type === 'Point' || geometry.type === 'MultiPoint';

/**
 * Whether the line↔polygon switch has anything to switch: a closed line, which
 * `freemap:type` then decides for. A GeoJSON polygon says so in its geometry.
 */
export function closable(geometry: Geometry): boolean {
  return (
    (geometry.type === 'LineString' || geometry.type === 'MultiLineString') &&
    isClosedGeometry(geometry)
  );
}

/** What a line is: drawn, a recorded track or a planned route. */
export function lineKindOf(properties: GeoJsonProperties): LineKind {
  const kind = properties?.[FM_KIND];

  return kind === 'track' || kind === 'route'
    ? kind
    : properties?.['_gpxType'] === 'rte'
      ? 'route'
      : properties?.['_gpxType'] === 'trk'
        ? 'track'
        : 'line';
}

/**
 * The properties stamped as `kind`: `fm:kind` decides the start/finish markers,
 * `_gpxType` the GPX element it exports as. A plain line carries neither.
 */
export function withLineKind(
  properties: GeoJsonProperties,
  kind: LineKind,
): GeoJsonProperties {
  const { [FM_KIND]: _kind, _gpxType, ...rest } = properties ?? {};

  return kind === 'line'
    ? rest
    : {
        ...rest,
        [FM_KIND]: kind satisfies FmKind,
        _gpxType: kind === 'route' ? 'rte' : 'trk',
      };
}

function lineType(feature: Feature): 'line' | 'polygon' {
  const { geometry } = feature;

  return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon'
    ? 'polygon'
    : (lineStyleFromProperties(feature.properties, closable(geometry)).type ??
        'line');
}

/**
 * A loaded feature as the properties editor shows it. One with no style of its
 * own shows the `defaults` it is drawn with. `typed` gives the table its row
 * types, nulls and nested values; a batch edit has the text rows alone.
 */
export function featureEditValues(
  feature: Feature,
  defaults: DrawingStyle,
  typed = true,
): FeatureProperties {
  const { properties } = feature;

  const point = isPoint(feature.geometry);

  const pointStyle = pointStyleFromProperties(properties);

  const lineStyle = lineStyleFromProperties(
    properties,
    closable(feature.geometry),
  );

  const type = lineType(feature);

  const lineKind = isTrackLine(feature) ? lineKindOf(properties) : undefined;

  const detailKind = detailKindOf(feature);

  // A waypoint's, a track's or a route's details are named fields, so not
  // table rows too; a plain line's stay rows.
  const named =
    detailKind === 'point' || lineKind === 'track' || lineKind === 'route';

  const { props: data, types } = typed
    ? typedDataTable(properties)
    : { props: featureDataProps(properties), types: undefined };

  return {
    label: ownLabel(properties) ?? String(properties?.['name'] ?? ''),
    props:
      named && detailKind
        ? Object.fromEntries(
            Object.entries(data).filter(
              ([key]) => !isDetailKey(key, detailKind),
            ),
          )
        : data,
    propTypes: types,
    color: (point ? pointStyle.color : lineStyle.color) ?? defaults.color,
    markerType: pointStyle.markerType ?? defaults.markerType,
    icon: pointStyle.icon ?? '',
    type,
    fillColor:
      type === 'polygon'
        ? (lineStyle.fillColor ?? defaults.fillColor)
        : undefined,
    width: lineStyle.width ?? defaults.width,
    dashArray: lineStyle.dashArray ?? defaults.dashArray,
    lineCap: lineStyle.lineCap ?? defaults.lineCap,
    lineJoin: lineStyle.lineJoin ?? defaults.lineJoin,
    lineKind,
    channels: isTrackLine(feature)
      ? readChannels(feature).map(({ key }) => key)
      : undefined,
    details: detailKind && {
      ...emptyDetails(),
      ...(named &&
        Object.fromEntries(
          detailKeysOf(detailKind).map((key) => [
            key,
            key === 'time'
              ? toLocalInput(properties?.[key])
              : (data[key] ?? ''),
          ]),
        )),
      ele:
        feature.geometry.type === 'Point'
          ? String(feature.geometry.coordinates[2] ?? '')
          : '',
    },
  };
}

/** Which details a feature has: a waypoint's, a line's, or none (a polygon). */
export function detailKindOf(feature: Feature): DetailKind | undefined {
  return feature.geometry.type === 'Point'
    ? 'point'
    : isTrackLine(feature)
      ? 'line'
      : undefined;
}

/**
 * The details written over the properties. A detail left empty goes, unless
 * the table still states it — as a plain line's do, the fields being empty.
 */
function withDetails(
  properties: Record<string, unknown>,
  details: FeatureDetails,
  kind: DetailKind,
  rows: Readonly<Record<string, string>>,
  before: GeoJsonProperties,
): Record<string, unknown> {
  const out = { ...properties };

  // As it was — from `before`, as the table merge has already let it go.
  const keep = (key: string) => {
    if (before?.[key] === undefined) {
      delete out[key];
    } else {
      out[key] = before[key];
    }
  };

  for (const key of detailKeysOf(kind)) {
    const value = details[key].trim();

    // Refused while shown; hidden (the line made a polygon), left as it was.
    if (key === 'number' && !isValidDetailNumber(value)) {
      keep(key);

      continue;
    }

    // Shown in local time; untouched, written back exactly as it was — one the
    // field couldn't show (an epoch number, free text) included.
    if (key === 'time' && value === toLocalInput(before?.[key])) {
      keep(key);

      continue;
    }

    const ms = key === 'time' && value ? Date.parse(value) : undefined;

    if (ms !== undefined && Number.isNaN(ms)) {
      keep(key);
    } else if (value) {
      out[key] =
        key === 'number'
          ? Number(value)
          : ms !== undefined
            ? isoInstant(ms)
            : value;
    } else if (!Object.hasOwn(rows, key)) {
      delete out[key];
    }
  }

  return out;
}

/** The feature's properties as edited. */
export function editedProperties(
  feature: Feature,
  values: FeatureProperties,
): GeoJsonProperties {
  const rows = values.props ?? {};

  const types = values.propTypes;

  const merged = mergeFeatureDataProps(feature.properties, rows, types);

  // Styled first: the line↔polygon switch decides what `{area}` answers.
  const styled = isPoint(feature.geometry)
    ? pointStyleToProperties(merged, values)
    : lineStyleToProperties(merged, values);

  // A closed track turned polygon is no track any more.
  const kind =
    values.lineKind === undefined
      ? undefined
      : values.type === 'polygon'
        ? 'line'
        : values.lineKind;

  // Left alone unless changed, so a KML line's `fm:kind: feature` stays.
  const kinded =
    kind === undefined || kind === lineKindOf(feature.properties)
      ? styled
      : withLineKind(styled, kind);

  const { channels } = values;

  const channelled =
    channels !== undefined &&
    isTrackLine(feature) &&
    new Set(channels).symmetricDifference(
      new Set(readChannels(feature).map(({ key }) => key)),
    ).size > 0
      ? withChannelKeys(feature, kinded ?? {}, channels)
      : kinded;

  const detailKind = detailKindOf(feature);

  const detailed =
    values.details && detailKind
      ? withDetails(
          channelled ?? {},
          values.details,
          detailKind,
          rows,
          feature.properties,
        )
      : channelled;

  // A label reads what an import's would: no nulls or nested values.
  return withEditedLabel(
    { geometry: feature.geometry, properties: detailed },
    values.label.trim(),
    types ? textRows(rows, types) : rows,
  );
}

/**
 * The feature's properties after a batch edit: only what the patch changes is
 * written over its own style, so what was unset keeps following the default
 * style. A template renders again when its properties change.
 */
export function patchedProperties(
  feature: Feature,
  patch: BatchPatch,
): GeoJsonProperties {
  const { geometry } = feature;

  const { label, props, ...style } = patch;

  let properties = props
    ? mergeFeatureDataProps(feature.properties, props)
    : { ...feature.properties };

  if (Object.keys(style).length > 0) {
    properties = isPoint(geometry)
      ? pointStyleToProperties(properties, style)
      : lineStyleToProperties(properties, {
          ...lineStyleFromProperties(properties, closable(geometry)),
          ...style,
          type: lineType(feature),
        });
  }

  const template = label ?? (props ? ownLabel(feature.properties) : undefined);

  return template === undefined
    ? properties
    : withEditedLabel(
        { geometry, properties },
        template.trim(),
        props ?? featureDataProps(properties),
      );
}

/** Which kind of batch edit takes a loaded feature; none for a collection or no geometry. */
function batchKindOf(feature: Feature): keyof BatchCounts | undefined {
  // Typed as present, but a stored copy or a saved map may still carry none.
  const geometry = feature.geometry as Geometry | null;

  switch (geometry?.type) {
    case 'Point':
    case 'MultiPoint':
      return 'points';
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      return lineType(feature) === 'polygon' ? 'polygons' : 'lines';
    default:
      return undefined;
  }
}

/** Which loaded features a batch edit of `kind` takes. */
export function dataViewerBatchIndexes(
  features: readonly Feature[],
  kind: BatchKind,
): { points: number[]; lines: number[] } {
  const points: number[] = [];

  const lines: number[] = [];

  for (const [i, feature] of features.entries()) {
    const of = batchKindOf(feature);

    if (of && (kind === 'all' || kind === of)) {
      (of === 'points' ? points : lines).push(i);
    }
  }

  return { points, lines };
}

export function dataViewerBatchCounts(
  features: readonly Feature[],
): BatchCounts {
  const counts = { points: 0, lines: 0, polygons: 0 };

  for (const feature of features) {
    const of = batchKindOf(feature);

    if (of) {
      counts[of]++;
    }
  }

  return counts;
}
