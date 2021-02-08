import { lineString } from '@turf/helpers';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from 'fm3/actions/elevationChartActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { FaChartArea, FaDrawPolygon, FaTag } from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Selection } from './Selection';

export function DrawingLineSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const line = useSelector((state: RootState) =>
    state.main.selection?.type !== 'draw-line-poly' ||
    state.main.selection.id === undefined
      ? undefined
      : state.drawingLines.lines[state.main.selection.id],
  );

  const elevationChartTrackGeojson = useSelector(
    (state: RootState) => state.elevationChart.trackGeojson,
  );

  const toggleElevationChart = useCallback(() => {
    // TODO to processor

    if (elevationChartTrackGeojson) {
      dispatch(elevationChartClose());
    } else if (line) {
      dispatch(
        elevationChartSetTrackGeojson(
          lineString(line.points.map((p) => [p.lon, p.lat])),
        ),
      );
    }
  }, [line, elevationChartTrackGeojson, dispatch]);

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
      <Button
        className="ml-1"
        variant="secondary"
        onClick={() => dispatch(setActiveModal('edit-label'))}
      >
        <FaTag />
        <span className="d-none d-sm-inline"> {m?.drawing.modify}</span>
      </Button>

      {line.type === 'line' && line.points.length > 1 && (
        <Button
          className="ml-1"
          variant="secondary"
          active={elevationChartTrackGeojson !== null}
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
