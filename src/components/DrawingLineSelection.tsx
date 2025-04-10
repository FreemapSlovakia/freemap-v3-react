import { lineString } from '@turf/helpers';
import { ReactElement, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaChartArea,
  FaDrawPolygon,
  FaRegStopCircle,
  FaTag,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { drawingLineStopDrawing } from '../actions/drawingLineActions.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '../actions/elevationChartActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
import { Selection } from './Selection.js';

export default DrawingLineSelection;

export function DrawingLineSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const drawing = useAppSelector((state) => state.drawingLines.drawing);

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

  return !line ? null : (
    <Selection
      icon={line.type === 'line' ? <MdTimeline /> : <FaDrawPolygon />}
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
  );
}
