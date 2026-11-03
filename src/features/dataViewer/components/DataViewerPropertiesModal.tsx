import { setActiveModal } from '@app/store/actions.js';
import type { PropRow } from '@features/drawing/components/DrawingPropsEditor.js';
import { drawingAddRecentColors } from '@features/drawing/model/actions/drawingPointActions.js';
import { FeaturePropertiesModal } from '@shared/components/FeaturePropertiesModal.js';
import { detailKeysOf } from '@shared/featureDetails.js';
import type { PropTypes } from '@shared/featureProperties.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { parseDecimal } from '@shared/numberValidator.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Feature, GeoJsonProperties, Position } from 'geojson';
import { type ReactElement, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { channelLabel } from '../channelLabel.js';
import { sameValue } from '../drawingWire.js';
import {
  closable,
  detailKindOf,
  editedProperties,
  featureEditValues,
  isPoint,
  lineKindOf,
} from '../featureEditing.js';
import { dataViewerSetFeatureProperties } from '../model/actions.js';
import { TRACE_PHRASES, type TraceKind } from '../traceServices.js';
import {
  channelSummaries,
  hasChannel,
  readChannels,
} from '../trackChannels.js';
import { isTrackLine, type TrackLine } from '../trackSelection.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';
import { KNOWN_CHANNELS } from '../vertexValues.js';

type Props = { show: boolean };

/**
 * The point's position with the elevation as typed, or `undefined` when that
 * changes nothing (or is no number, which the dialog refuses anyway).
 */
function pointElevation(
  feature: Feature,
  text: string | undefined,
): Position | undefined {
  if (feature.geometry.type !== 'Point' || text === undefined) {
    return undefined;
  }

  const [lon, lat, ele] = feature.geometry.coordinates;

  const typed = text.trim() === '' ? undefined : parseDecimal(text);

  if (text.trim() !== '' && typed === undefined) {
    return undefined;
  }

  return typed === ele || lon === undefined || lat === undefined
    ? undefined
    : typed === undefined
      ? [lon, lat]
      : [lon, lat, typed];
}

/** Each type a save gave a property row it didn't have; a new row was text. */
function trackTypeChanges(
  before: PropTypes | undefined,
  rows: readonly PropRow[],
) {
  // By the row a key was opened as, so renaming a row is no type set.
  const changed = new Set(
    rows.flatMap(([key, , origin, type = 'text']) =>
      !key.trim() ||
      type === (origin === undefined ? 'text' : (before?.[origin] ?? 'text'))
        ? []
        : [type],
    ),
  );

  for (const type of changed) {
    trackMatomo(['trackEvent', 'DataViewer', 'setPropertyType', type]);
  }
}

/** What a save changed of a feature's GPX details, and a line's kind and channels. */
function trackLineEdits(feature: Feature, properties: GeoJsonProperties) {
  const detailKind = detailKindOf(feature);

  if (
    detailKind &&
    detailKeysOf(detailKind).some(
      (key) => !sameValue(feature.properties?.[key], properties?.[key]),
    )
  ) {
    trackMatomo(['trackEvent', 'DataViewer', 'editDetails', detailKind]);
  }

  if (!isTrackLine(feature)) {
    return;
  }

  const after = { ...feature, properties };

  const kind = lineKindOf(properties);

  if (kind !== lineKindOf(feature.properties)) {
    trackMatomo(['trackEvent', 'DataViewer', 'setLineKind', kind]);
  }

  const keys = (line: TrackLine) =>
    readChannels(line)
      .map(({ key }) => key)
      .toSorted()
      .join();

  if (keys(after) !== keys(feature)) {
    trackMatomo(['trackEvent', 'DataViewer', 'editChannels']);
  }
}

export default function DataViewerPropertiesModal({
  show,
}: Props): ReactElement | null {
  const index = useAppSelector((state) =>
    state.main.selection?.type === 'feature'
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

  const dvm = useDataViewerMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const gone = !feature || index === undefined;

  // Its feature gone, as after a Back that rebuilt the data: no modal to stay open.
  useEffect(() => {
    if (show && gone) {
      dispatch(setActiveModal(null));
    }
  }, [show, gone, dispatch]);

  if (gone) {
    return null;
  }

  const initial = featureEditValues(feature, defaults);

  return (
    <FeaturePropertiesModal
      show={show}
      kind={isPoint(feature.geometry) ? 'point' : 'line-poly'}
      initial={initial}
      channelOptions={
        isTrackLine(feature)
          ? [
              ...channelSummaries(feature).map(({ key, filled, total }) => ({
                key,
                label: channelLabel(key, dvm),
                note: dvm?.vertex.filled({ filled, total }),
              })),
              // Offered by name, as read in the user's language.
              ...KNOWN_CHANNELS.filter((key) => !hasChannel(feature, key))
                .map((key) => ({ key, label: channelLabel(key, dvm) }))
                .toSorted((a, b) => a.label.localeCompare(b.label, language)),
            ]
          : undefined
      }
      closable={
        closable(feature.geometry) ||
        feature.geometry.type === 'Polygon' ||
        (feature.geometry.type === 'LineString' &&
          feature.geometry.coordinates.length > 2)
      }
      onSave={(values, { rows }) => {
        const legacyKind =
          feature.geometry.type === 'Polygon'
            ? (Object.keys(TRACE_PHRASES) as TraceKind[]).find(
                (kind) => TRACE_PHRASES[kind] === values.label,
              )
            : undefined;

        // A polygon labelled with a trace phrase opens the trace modal instead of saving.
        if (legacyKind) {
          dispatch(
            setActiveModal({
              type: 'data-viewer-trace',
              kind: legacyKind,
              legacy: true,
            }),
          );

          // The trace modal replaces this one; closing would close it.
          return true;
        }

        const properties = editedProperties(feature, values);

        trackLineEdits(feature, properties);

        if (values.propTypes) {
          trackTypeChanges(initial.propTypes, rows);
        }

        // One action, so one history step: a waypoint's elevation is its
        // coordinate's, not a property.
        const position = pointElevation(feature, values.details?.ele);

        dispatch(
          dataViewerSetFeatureProperties([{ index, properties, position }]),
        );

        dispatch(
          drawingAddRecentColors(
            [values.color, values.fillColor].filter((color): color is string =>
              Boolean(color),
            ),
          ),
        );

        return undefined;
      }}
    />
  );
}
