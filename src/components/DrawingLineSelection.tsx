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
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
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
        title={
          line.type === 'line'
            ? m?.selections.drawLines
            : m?.selections.drawPolygons
        }
        deletable
      >
        {drawing && (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => dispatch(drawingLineStopDrawing())}
          >
            <FaRegStopCircle />
            <span className="d-none d-sm-inline">
              {' '}
              {m?.drawing.stopDrawing} <kbd>Esc</kbd>
            </span>
          </Button>
        )}

        <Button
          className="ms-1"
          variant="secondary"
          onClick={() => dispatch(setActiveModal('edit-label'))}
        >
          <FaTag />
          <span className="d-none d-sm-inline"> {m?.drawing.modify}</span>
        </Button>

        {line.type === 'line' && line.points.length > 0 && (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => setProjectPointDialogVisible(true)}
          >
            <TbAngle />
            <span className="d-none d-sm-inline">
              {' '}
              {m?.drawing.projection.projectPoint}
            </span>
          </Button>
        )}

        {line.type === 'line' && line.points.length > 1 && (
          <Button
            className="ms-1"
            variant="secondary"
            active={showElevationChart}
            onClick={toggleElevationChart}
          >
            <FaChartArea />
            <span className="d-none d-sm-inline">
              {' '}
              {m?.general.elevationProfile}
            </span>
          </Button>
        )}
      </Selection>
    </>
  );
}
