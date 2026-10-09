import { FeaturePropertiesModal } from '@shared/components/FeaturePropertiesModal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import {
  closable,
  editedProperties,
  featureEditValues,
  isPoint,
} from '../featureEditing.js';
import { dataViewerSetFeatureProperties } from '../model/actions.js';

type Props = { show: boolean };

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

  if (!feature || index === undefined) {
    return null;
  }

  return (
    <FeaturePropertiesModal
      show={show}
      kind={isPoint(feature.geometry) ? 'point' : 'line-poly'}
      initial={featureEditValues(feature, defaults)}
      closable={closable(feature.geometry)}
      onSave={(values) => {
        dispatch(
          dataViewerSetFeatureProperties([
            { index, properties: editedProperties(feature, values) },
          ]),
        );

        return undefined;
      }}
    />
  );
}
