import { drawingChangePropertiesBatch } from '@features/drawing/model/actions/drawingBatchActions.js';
import {
  batchChanges,
  batchOf,
  pickedColors,
} from '@shared/batchProperties.js';
import { BatchFeaturePropertiesModal } from '@shared/components/BatchFeaturePropertiesModal.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useBatchKind } from '@shared/hooks/useBatchKind.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import {
  drawingBatchIndexes,
  drawingPatch,
  lineProperties,
  pointProperties,
} from '../featureProperties.js';

type Props = { show: boolean };

export default function DrawingBatchPropertiesModal({
  show,
}: Props): ReactElement | null {
  const dispatch = useDispatch();

  const kind = useBatchKind('drawing-batch-properties');

  const points = useAppSelector((state) => state.drawingPoints.points);

  const lines = useAppSelector((state) => state.drawingLines.lines);

  const indexes = drawingBatchIndexes(points, lines, kind ?? 'all');

  const pointValues = indexes.points.map((i) => pointProperties(points[i]!));

  const lineValues = indexes.lines.map((i) => lineProperties(lines[i]!));

  return (
    <BatchFeaturePropertiesModal
      show={show}
      kind={kind}
      form={batchOf(pointValues, lineValues)}
      onSave={(values, edit) => {
        const changes = (
          indexes: number[],
          items: typeof pointValues,
          point: boolean,
        ) =>
          batchChanges(
            indexes.map((index, i) => ({ index, item: items[i]!, point })),
            values,
            edit,
            (index, patch) => ({ index, properties: drawingPatch(patch) }),
          );

        const batch = {
          points: changes(indexes.points, pointValues, true),
          lines: changes(indexes.lines, lineValues, false),
          pickedColors: pickedColors(values, edit),
        };

        if (batch.points.length || batch.lines.length) {
          dispatch(drawingChangePropertiesBatch(batch));
        }
      }}
    />
  );
}
