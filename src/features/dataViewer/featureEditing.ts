import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import type {
  BatchCounts,
  BatchKind,
  BatchPatch,
} from '@shared/batchProperties.js';
import type { FeatureProperties } from '@shared/components/FeaturePropertiesModal.js';
import {
  featureDataProps,
  mergeFeatureDataProps,
  ownLabel,
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

function lineType(feature: Feature): 'line' | 'polygon' {
  const { geometry } = feature;

  return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon'
    ? 'polygon'
    : (lineStyleFromProperties(feature.properties, closable(geometry)).type ??
        'line');
}

/**
 * A loaded feature as the properties editor shows it. One with no style of its
 * own shows the `defaults` it is drawn with.
 */
export function featureEditValues(
  feature: Feature,
  defaults: DrawingStyle,
): FeatureProperties {
  const { properties } = feature;

  const point = isPoint(feature.geometry);

  const pointStyle = pointStyleFromProperties(properties);

  const lineStyle = lineStyleFromProperties(
    properties,
    closable(feature.geometry),
  );

  const type = lineType(feature);

  return {
    label: ownLabel(properties) ?? String(properties?.['name'] ?? ''),
    props: featureDataProps(properties),
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
  };
}

/** The feature's properties as edited. */
export function editedProperties(
  feature: Feature,
  values: FeatureProperties,
): GeoJsonProperties {
  const rows = values.props ?? {};

  const merged = mergeFeatureDataProps(feature.properties, rows);

  // Styled first: the line↔polygon switch decides what `{area}` answers.
  const styled = isPoint(feature.geometry)
    ? pointStyleToProperties(merged, values)
    : lineStyleToProperties(merged, values);

  return withEditedLabel(
    { geometry: feature.geometry, properties: styled },
    values.label.trim(),
    rows,
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
