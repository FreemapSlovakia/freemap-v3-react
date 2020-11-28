import React, { useEffect, useCallback, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { lineString } from '@turf/helpers';

import { useTranslator } from 'fm3/l10nInjector';

import { selectFeature, Tool } from 'fm3/actions/mainActions';
import { drawingLineAddPoint } from 'fm3/actions/drawingLineActions';

import {
  elevationChartSetTrackGeojson,
  elevationChartClose,
} from 'fm3/actions/elevationChartActions';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { RootState } from 'fm3/storeCreator';
import {
  drawingPointAdd,
  drawingPointMeasure,
} from 'fm3/actions/drawingPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';

export function DrawingMenu(): ReactElement {
  const dispatch = useDispatch();

  const t = useTranslator();

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

  const handlePoiAdd = useCallback(
    (lat: number, lon: number, position?: number, id0?: number) => {
      const tool = selection?.type;
      if (tool === 'draw-points') {
        dispatch(drawingPointAdd({ lat, lon, label: '' }));
        dispatch(drawingPointMeasure(true));
        return;
      }

      const points = linePoints;

      const pos = position ? Math.ceil(position / 2) : points.length;

      let id: number;

      if (id0) {
        id = id0;
      } else if (pos === 0) {
        id = points.length ? points[pos].id - 1 : 0;
      } else if (pos === points.length) {
        id = points[pos - 1].id + 1;
      } else {
        id = (points[pos - 1].id + points[pos].id) / 2;
      }

      dispatch(
        drawingLineAddPoint({
          index:
            selection?.type === 'draw-lines' ||
            selection?.type === 'draw-polygons'
              ? selection?.id
              : undefined,
          point: { lat, lon, id },
          position: pos,
          type: tool === 'draw-lines' ? 'line' : 'polygon',
        }),
      );
      dispatch(drawingPointMeasure(true));
    },
    [selection?.type, selection?.id, linePoints, dispatch],
  );

  useEffect(() => {
    mapEventEmitter.on('mapClick', handlePoiAdd);
    return () => {
      mapEventEmitter.removeListener('mapClick', handlePoiAdd);
    };
  });

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
          title={t('measurement.distance')}
        >
          <FontAwesomeIcon icon="arrows-h" />
          <span className="hidden-xs"> {t('measurement.distance')}</span>
        </Button>
        <Button
          onClick={() => setTool('draw-points')}
          active={tool === 'draw-points'}
          title={t('measurement.elevation')}
        >
          <FontAwesomeIcon icon="map-marker" />
          <span className="hidden-xs"> {t('measurement.elevation')}</span>
        </Button>
        <Button
          onClick={() => setTool('draw-polygons')}
          active={tool === 'draw-polygons'}
          title={t('measurement.area')}
        >
          <FontAwesomeIcon icon="square-o" />
          <span className="hidden-xs"> {t('measurement.area')}</span>
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
            <span className="hidden-xs"> {t('drawing.modify')}</span>
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
            <span className="hidden-xs"> {t('general.elevationProfile')}</span>
          </Button>
        </>
      )}
    </>
  );
}
