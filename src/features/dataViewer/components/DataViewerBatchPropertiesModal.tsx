import { batchChanges, batchOf } from '@shared/batchProperties.js';
import { BatchFeaturePropertiesModal } from '@shared/components/BatchFeaturePropertiesModal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useBatchKind } from '@shared/hooks/useBatchKind.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import {
  dataViewerBatchIndexes,
  featureEditValues,
  patchedProperties,
} from '../featureEditing.js';
import { dataViewerSetFeatureProperties } from '../model/actions.js';

type Props = { show: boolean };

export default function DataViewerBatchPropertiesModal({
  show,
}: Props): ReactElement | null {
  const dispatch = useDispatch();

  const kind = useBatchKind('data-viewer-batch-properties');

  const features =
    useAppSelector((state) => state.trackViewer.trackGeojson?.features) ?? [];

  const defaults = useAppSelector((state) => state.trackViewerSettings.style);

  const indexes = dataViewerBatchIndexes(features, kind ?? 'all');

  const pointValues = indexes.points.map((i) =>
    featureEditValues(features[i]!, defaults),
  );

  const lineValues = indexes.lines.map((i) =>
    featureEditValues(features[i]!, defaults),
  );

  return (
    <BatchFeaturePropertiesModal
      show={show}
      kind={kind}
      form={batchOf(pointValues, lineValues)}
      onSave={(values, edit) => {
        // Only what changes, on only the features it changes: an unchanged
        // file stays the file it was loaded from.
        const changes = batchChanges(
          [
            ...indexes.points.map((index, i) => ({
              index,
              item: pointValues[i]!,
              point: true,
            })),
            ...indexes.lines.map((index, i) => ({
              index,
              item: lineValues[i]!,
              point: false,
            })),
          ],
          values,
          edit,
          (index, patch) => ({
            index,
            properties: patchedProperties(features[index]!, patch),
          }),
        );

        if (changes.length > 0) {
          dispatch(dataViewerSetFeatureProperties(changes));
        }
      }}
    />
  );
}
