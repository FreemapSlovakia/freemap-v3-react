import { selectFeature, setActiveModal } from '@app/store/actions.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaDrawPolygon, FaRegPlayCircle, FaTable } from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { RiScissorsFill } from 'react-icons/ri';
import { TbArrowsJoin } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import {
  dataViewerDrawContinue,
  dataViewerSetJoining,
  dataViewerSplitTrack,
} from '../model/actions.js';
import { isCutVertex } from '../splitTrack.js';
import { isTrackLine, trackLineFeatures } from '../trackSelection.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';
import { editableParts } from '../vertexEditing.js';
import { DataViewerToggleButton } from './DataViewerToggleButton.js';

export default function DataViewerVertexSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const dm = useDrawingMessages();

  const dvm = useDataViewerMessages();

  const selection = useAppSelector((state) => state.main.selection);

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const feature =
    selection?.type === 'vertex'
      ? trackGeojson?.features[selection.id]
      : undefined;

  const vertices =
    feature && selection?.type === 'vertex'
      ? editableParts(feature.geometry)?.[selection.part]
      : undefined;

  // The feature or the vertex may have gone while its selection lingers.
  if (
    !feature ||
    !vertices ||
    selection?.type !== 'vertex' ||
    selection.vertex >= vertices.length
  ) {
    return null;
  }

  const { id: index, part, vertex } = selection;

  const ring = feature.geometry.type === 'Polygon';

  const line = isTrackLine(feature) ? feature : undefined;

  const end = vertex === 0 || vertex === vertices.length - 1;

  const single = feature.geometry.type === 'LineString';

  return (
    <Selection
      control={<DataViewerToggleButton />}
      icon={ring ? <FaDrawPolygon /> : <MdTimeline />}
      label={ring ? m?.selections.polygonPoint : m?.selections.linePoint}
      deletable={vertices.length > (ring ? 3 : 2)}
    >
      <LongPressTooltip breakpoint="sm" label={dvm?.vertex.menuItem}>
        {({ label, labelClassName, props }) => (
          <Button
            variant="secondary"
            onClick={() =>
              dispatch(setActiveModal({ type: 'data-viewer-vertex' }))
            }
            {...props}
          >
            <FaTable />
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>

      {line && isCutVertex(line, part, vertex) && (
        <LongPressTooltip breakpoint="sm" label={dm?.split}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() =>
                dispatch(
                  dataViewerSplitTrack({
                    featureIndex: index,
                    segmentIndex: part,
                    pointIndex: vertex,
                  }),
                )
              }
              {...props}
            >
              <RiScissorsFill />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {single && end && trackLineFeatures(trackGeojson).length > 1 && (
        <LongPressTooltip breakpoint="sm" label={dm?.join}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                // The armed join's prompt rides the line's own selection.
                dispatch(selectFeature({ type: 'feature', id: index }));

                dispatch(
                  dataViewerSetJoining({ featureIndex: index, mode: 'line' }),
                );
              }}
              {...props}
            >
              <TbArrowsJoin />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {single && end && (
        <LongPressTooltip breakpoint="sm" label={dm?.continue}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() =>
                dispatch(dataViewerDrawContinue({ index, part, vertex }))
              }
              {...props}
            >
              <FaRegPlayCircle />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}
    </Selection>
  );
}
