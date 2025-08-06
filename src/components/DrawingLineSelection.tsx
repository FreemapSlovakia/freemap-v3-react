import { destination } from '@turf/destination';
import { lineString } from '@turf/helpers';
import { type ReactElement, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaChartArea,
  FaDrawPolygon,
  FaRegStopCircle,
  FaTag,
} from 'react-icons/fa';
import { TbAngle, TbTimeline } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import {
  drawingLineAddPoint,
  drawingLineStopDrawing,
} from '../actions/drawingLineActions.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '../actions/elevationChartActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import ProjectPointModal from './ProjectPointModal.js';
import { Selection } from './Selection.js';

export default DrawingLineSelection;

export function DrawingLineSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const drawing = useAppSelector((state) => state.drawingLines.drawing);

  const lineIndex = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.main.selection.id
      : undefined,
  );

  const line = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[state.main.selection.id]
      : undefined,
  );

  const showElevationChart = useAppSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const toggleElevationChart = useCallback(() => {
    // TODO to processor

    if (showElevationChart) {
      dispatch(elevationChartClose());
    } else if (line) {
      dispatch(
        elevationChartSetTrackGeojson(
          lineString(line.points.map((p) => [p.lon, p.lat])),
        ),
      );
    }
  }, [line, showElevationChart, dispatch]);

  const [projectPointDialogVisible, setProjectPointDialogVisible] =
    useState(false);

  const projectPoint = useCallback(
    (distance: number, azimuth: number) => {
      if (lineIndex === undefined) {
        return;
      }

      const basePoint = line?.points.at(-1);

      if (!basePoint) {
        return;
      }

      setProjectPointDialogVisible(false);

      const p = destination([basePoint.lon, basePoint.lat], distance, azimuth, {
        units: 'meters',
      });

      dispatch(
        drawingLineAddPoint({
          lineIndex,
          indexOfLineToSelect: lineIndex,
          point: {
            id: basePoint.id + 1,
            lon: p.geometry.coordinates[0],
            lat: p.geometry.coordinates[1],
          },
        }),
      );
    },
    [dispatch, line?.points, lineIndex],
  );

  return !line ? null : (
    <>
      <ProjectPointModal
        show={projectPointDialogVisible}
        onClose={() => setProjectPointDialogVisible(false)}
        onAdd={projectPoint}
      />

      <Selection
        icon={line.type === 'line' ? <TbTimeline /> : <FaDrawPolygon />}
        label={
          line.type === 'line'
            ? m?.selections.drawLines
            : m?.selections.drawPolygons
        }
        deletable
      >
        {drawing && (
          <LongPressTooltip
            breakpoint="sm"
            label={m?.drawing.stopDrawing}
            kbd="Esc"
          >
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => dispatch(drawingLineStopDrawing())}
                {...props}
              >
                <FaRegStopCircle />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        <LongPressTooltip breakpoint="sm" label={m?.drawing.modify}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() =>
                dispatch(setActiveModal('current-drawing-properties'))
              }
              {...props}
            >
              <FaTag />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        {line.type === 'line' && line.points.length > 0 && (
          <LongPressTooltip
            breakpoint="sm"
            label={m?.drawing.projection.projectPoint}
          >
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => setProjectPointDialogVisible(true)}
                {...props}
              >
                <TbAngle />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {line.type === 'line' && line.points.length > 1 && (
          <LongPressTooltip breakpoint="sm" label={m?.general.elevationProfile}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                active={showElevationChart}
                onClick={toggleElevationChart}
                {...props}
              >
                <FaChartArea />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}
      </Selection>
    </>
  );
}
