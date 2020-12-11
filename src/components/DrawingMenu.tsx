import React, { useCallback, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { lineString } from '@turf/helpers';

import { useMessages } from 'fm3/l10nInjector';

import { selectFeature, Tool } from 'fm3/actions/mainActions';

import {
  elevationChartSetTrackGeojson,
  elevationChartClose,
} from 'fm3/actions/elevationChartActions';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import { RootState } from 'fm3/storeCreator';
import { setActiveModal } from 'fm3/actions/mainActions';

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
    // TODO to logic

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
          onClick={() => setTool('draw-lines')}
          active={tool === 'draw-lines'}
          title={m?.measurement.distance}
        >
          <FontAwesomeIcon icon="arrows-h" />
          <span className="hidden-xs"> {m?.measurement.distance}</span>
        </Button>
        <Button
          onClick={() => setTool('draw-points')}
          active={tool === 'draw-points'}
          title={m?.measurement.elevation}
        >
          <FontAwesomeIcon icon="map-marker" />
          <span className="hidden-xs"> {m?.measurement.elevation}</span>
        </Button>
        <Button
          onClick={() => setTool('draw-polygons')}
          active={tool === 'draw-polygons'}
          title={m?.measurement.area}
        >
          <FontAwesomeIcon icon="square-o" />
          <span className="hidden-xs"> {m?.measurement.area}</span>
        </Button>
      </ButtonGroup>
      {isActive && (
        <>
          {' '}
          <Button
            onClick={() => dispatch(setActiveModal('edit-label'))}
            disabled={!isActive}
          >
            <FontAwesomeIcon icon="tag" />
            <span className="hidden-xs"> {m?.drawing.modify}</span>
          </Button>
        </>
      )}
      {tool === 'draw-lines' && linePoints.length >= 2 && (
        <>
          {' '}
          <Button
            active={elevationChartTrackGeojson !== null}
            onClick={toggleElevationChart}
          >
            <FontAwesomeIcon icon="bar-chart" />
            <span className="hidden-xs"> {m?.general.elevationProfile}</span>
          </Button>
        </>
      )}
    </>
  );
}
