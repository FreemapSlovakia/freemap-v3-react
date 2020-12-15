import { lineString } from '@turf/helpers';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from 'fm3/actions/elevationChartActions';
import { selectFeature, setActiveModal, Tool } from 'fm3/actions/mainActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useDispatch, useSelector } from 'react-redux';

export function DrawingMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  function setTool(tool: Tool | null) {
    dispatch(selectFeature(tool && { type: tool }));
  }

  const selection = useSelector((state: RootState) => state.main.selection);

  const linePoints = useSelector((state: RootState) =>
    (state.main.selection?.type !== 'draw-lines' &&
      state.main.selection?.type !== 'draw-polygons') ||
    state.main.selection.id === undefined
      ? []
      : state.drawingLines.lines[state.main.selection.id].points,
  );

  const elevationChartTrackGeojson = useSelector(
    (state: RootState) => state.elevationChart.trackGeojson,
  );

  const toggleElevationChart = useCallback(() => {
    // TODO to processor

    if (elevationChartTrackGeojson) {
      dispatch(elevationChartClose());
    } else {
      dispatch(
        elevationChartSetTrackGeojson(
          lineString(linePoints.map((p) => [p.lon, p.lat])),
        ),
      );
    }
  }, [linePoints, elevationChartTrackGeojson, dispatch]);

  const tool = selection?.type;

  const isActive =
    selection?.id !== undefined &&
    (tool === 'draw-points' ||
      (tool === 'draw-lines' && linePoints.length > 1) ||
      (tool === 'draw-polygons' && linePoints.length > 2));

  return (
    <>
      <ButtonGroup>
        <Button
          variant="secondary"
          onClick={() => setTool('draw-lines')}
          active={tool === 'draw-lines'}
          title={m?.measurement.distance}
        >
          <FontAwesomeIcon icon="arrows-h" />
          <span className="d-none d-sm-inline"> {m?.measurement.distance}</span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => setTool('draw-points')}
          active={tool === 'draw-points'}
          title={m?.measurement.elevation}
        >
          <FontAwesomeIcon icon="map-marker" />
          <span className="d-none d-sm-inline">
            {' '}
            {m?.measurement.elevation}
          </span>
        </Button>
        <Button
          variant="secondary"
          onClick={() => setTool('draw-polygons')}
          active={tool === 'draw-polygons'}
          title={m?.measurement.area}
        >
          <FontAwesomeIcon icon="square-o" />
          <span className="d-none d-sm-inline"> {m?.measurement.area}</span>
        </Button>
      </ButtonGroup>
      {isActive && (
        <Button
          className="ml-1"
          variant="secondary"
          onClick={() => dispatch(setActiveModal('edit-label'))}
          disabled={!isActive}
        >
          <FontAwesomeIcon icon="tag" />
          <span className="d-none d-sm-inline"> {m?.drawing.modify}</span>
        </Button>
      )}
      {tool === 'draw-lines' && linePoints.length >= 2 && (
        <Button
          className="ml-1"
          variant="secondary"
          active={elevationChartTrackGeojson !== null}
          onClick={toggleElevationChart}
        >
          <FontAwesomeIcon icon="bar-chart" />
          <span className="d-none d-sm-inline">
            {' '}
            {m?.general.elevationProfile}
          </span>
        </Button>
      )}
    </>
  );
}
