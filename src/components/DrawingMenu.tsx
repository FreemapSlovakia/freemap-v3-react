import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Feature, LineString, lineString } from '@turf/helpers';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import { selectFeature, Tool } from 'fm3/actions/mainActions';
import { drawingLineAddPoint, Point } from 'fm3/actions/drawingLineActions';

import {
  elevationChartSetTrackGeojson,
  elevationChartClose,
} from 'fm3/actions/elevationChartActions';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import {
  drawingPointAdd,
  drawingPointMeasure,
} from 'fm3/actions/drawingPointActions';
import { setActiveModal } from 'fm3/actions/mainActions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const DrawingMenuInt: React.FC<Props> = ({
  onToolSet,
  selection,
  elevationChartTrackGeojson,
  t,
  onInfoPointAdd,
  linePoints,
  onDistPointAdd,
  onElevationChartTrackGeojsonSet,
  onElevationChartClose,
  onLabelModify,
}) => {
  const handlePoiAdd = useCallback(
    (lat: number, lon: number, position?: number, id0?: number) => {
      const tool = selection?.type;
      if (tool === 'draw-points') {
        onInfoPointAdd(lat, lon);
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

      onDistPointAdd(
        tool === 'draw-lines' ? 'line' : 'polygon',
        selection?.type === 'draw-lines' || selection?.type === 'draw-polygons'
          ? selection?.id
          : undefined,
        { lat, lon, id },
        pos,
      );
    },
    [
      selection?.id,
      selection?.type,
      linePoints,
      onInfoPointAdd,
      onDistPointAdd,
    ],
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
      onElevationChartClose();
    } else {
      onElevationChartTrackGeojsonSet(
        lineString(linePoints.map((p) => [p.lon, p.lat])),
      );
    }
  }, [
    linePoints,
    elevationChartTrackGeojson,
    onElevationChartClose,
    onElevationChartTrackGeojsonSet,
  ]);

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
          onClick={() => onToolSet('draw-lines')}
          active={tool === 'draw-lines'}
          title={t('measurement.distance')}
        >
          <FontAwesomeIcon icon="arrows-h" />
          <span className="hidden-xs"> {t('measurement.distance')}</span>
        </Button>
        <Button
          onClick={() => onToolSet('draw-points')}
          active={tool === 'draw-points'}
          title={t('measurement.elevation')}
        >
          <FontAwesomeIcon icon="map-marker" />
          <span className="hidden-xs"> {t('measurement.elevation')}</span>
        </Button>
        <Button
          onClick={() => onToolSet('draw-polygons')}
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
          <Button onClick={onLabelModify} disabled={!isActive}>
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
};

const mapStateToProps = (state: RootState) => ({
  selection: state.main.selection,
  linePoints:
    (state.main.selection?.type !== 'draw-lines' &&
      state.main.selection?.type !== 'draw-polygons') ||
    state.main.selection.id === undefined
      ? []
      : state.drawingLines.lines[state.main.selection.id].points,
  elevationChartTrackGeojson: state.elevationChart.trackGeojson,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onToolSet(tool: Tool | null) {
    dispatch(selectFeature(tool && { type: tool }));
  },
  onElevationChartTrackGeojsonSet(trackGeojson: Feature<LineString>) {
    dispatch(elevationChartSetTrackGeojson(trackGeojson));
  },
  onElevationChartClose() {
    dispatch(elevationChartClose());
  },
  onDistPointAdd(
    type: 'polygon' | 'line',
    index: number | undefined,
    point: Point,
    position: number,
  ) {
    dispatch(drawingLineAddPoint({ index, point, position, type }));
    dispatch(drawingPointMeasure(true));
  },
  onInfoPointAdd(lat: number, lon: number) {
    dispatch(drawingPointAdd({ lat, lon, label: '' }));
    dispatch(drawingPointMeasure(true));
  },
  onLabelModify() {
    dispatch(setActiveModal('edit-label'));
  },
});

export const DrawingMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(DrawingMenuInt));
