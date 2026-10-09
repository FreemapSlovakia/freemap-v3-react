import {
  type FeatureProperties,
  FeaturePropertiesModal,
} from '@shared/components/FeaturePropertiesModal.js';
import {
  featureDataProps,
  mergeFeatureDataProps,
  ownLabel,
  withEditedLabel,
} from '@shared/featureProperties.js';
import { isClosedGeometry } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  lineStyleFromProperties,
  lineStyleToProperties,
  pointStyleFromProperties,
  pointStyleToProperties,
} from '@shared/styleFromProperties.js';
import type { Geometry } from 'geojson';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { dataViewerSetFeatureProperties } from '../model/actions.js';

type Props = { show: boolean };

/**
 * Whether the line↔polygon switch has anything to switch: a closed line, which
 * `freemap:type` then decides for. A GeoJSON polygon says so in its geometry.
 */
function closable(geometry: Geometry): boolean {
  return (
    (geometry.type === 'LineString' || geometry.type === 'MultiLineString') &&
    isClosedGeometry(geometry)
  );
}

export default function DataViewerPropertiesModal({
  show,
}: Props): ReactElement | null {
  const index = useAppSelector((state) =>
    state.main.selection?.type === 'data-viewer'
      ? state.main.selection.id
      : undefined,
  );

  const feature = useAppSelector((state) =>
    index === undefined
      ? undefined
      : state.trackViewer.trackGeojson?.features[index],
  );

  // Imported features carry no style of their own until edited; the form opens
  // showing what they are actually drawn with.
  const defaults = useAppSelector((state) => state.trackViewerSettings.style);

  const dispatch = useDispatch();

  const properties = feature?.properties;

  const geometryType = feature?.geometry.type;

  const isPoint = geometryType === 'Point' || geometryType === 'MultiPoint';

  const handleSave = (values: FeatureProperties): undefined => {
    if (index === undefined || !feature) {
      return;
    }

    const rows = values.props ?? {};

    const merged = mergeFeatureDataProps(properties, rows);

    // Styled first: the line↔polygon switch decides what `{area}` answers.
    const styled = isPoint
      ? pointStyleToProperties(merged, {
          color: values.color,
          markerType: values.markerType,
          icon: values.icon,
        })
      : lineStyleToProperties(merged, values);

    dispatch(
      dataViewerSetFeatureProperties({
        index,
        properties: withEditedLabel(
          { geometry: feature.geometry, properties: styled },
          values.label.trim(),
          rows,
        ),
      }),
    );
  };

  if (!feature) {
    return null;
  }

  const { geometry } = feature;

  const isPolygon =
    geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';

  const canClose = closable(geometry);

  const pointStyle = pointStyleFromProperties(properties);

  const lineStyle = lineStyleFromProperties(properties, canClose);

  const type = isPolygon ? 'polygon' : (lineStyle.type ?? 'line');

  return (
    <FeaturePropertiesModal
      show={show}
      kind={isPoint ? 'point' : 'line-poly'}
      initial={{
        label: ownLabel(properties) ?? String(properties?.['name'] ?? ''),
        props: featureDataProps(properties),
        color: (isPoint ? pointStyle.color : lineStyle.color) ?? defaults.color,
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
      }}
      closable={canClose}
      onSave={handleSave}
    />
  );
}
