import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { lineString } from '@turf/helpers';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import { selectFeature, Tool } from 'fm3/actions/mainActions';
import {
  distanceMeasurementAddPoint,
  Point,
} from 'fm3/actions/distanceMeasurementActions';

import { elevationMeasurementSetPoint } from 'fm3/actions/elevationMeasurementActions';

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
import { LatLon } from 'fm3/types/common';
import { GeoJsonObject } from 'geojson';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const MeasurementMenuInt: React.FC<Props> = ({
  onToolSet,
  selection,
  elevationChartTrackGeojson,
  t,
  onElePointSet,
  distancePoints,
  onDistPointAdd,
  onElevationChartTrackGeojsonSet,
  onElevationChartClose,
}) => {
  const handlePoiAdd = useCallback(
    (lat: number, lon: number, position?: number, id0?: number) => {
      const tool = selection?.type;

      if (tool === 'measure-ele') {
        onElePointSet({ lat, lon });
        return;
      }

      const points = distancePoints;

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
        tool === 'measure-dist' ? 'distance' : 'area',
        selection?.id,
        { lat, lon, id },
        pos,
      );
    },
    [selection, distancePoints, onElePointSet, onDistPointAdd],
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
        lineString(distancePoints.map(p => [p.lon, p.lat])),
      );
    }
  }, [
    distancePoints,
    elevationChartTrackGeojson,
    onElevationChartClose,
    onElevationChartTrackGeojsonSet,
  ]);

  const tool = selection?.type;

  return (
    <>
      <ButtonGroup>
        <Button
          onClick={() => onToolSet('measure-dist')}
          active={tool === 'measure-dist'}
          title={t('measurement.distance')}
        >
          <FontAwesomeIcon icon="arrows-h" />
          <span className="hidden-xs"> {t('measurement.distance')}</span>
        </Button>
        <Button
          onClick={() => onToolSet('measure-ele')}
          active={tool === 'measure-ele'}
          title={t('measurement.elevation')}
        >
          <FontAwesomeIcon icon="long-arrow-up" />
          <span className="hidden-xs"> {t('measurement.elevation')}</span>
        </Button>
        <Button
          onClick={() => onToolSet('measure-area')}
          active={tool === 'measure-area'}
          title={t('measurement.area')}
        >
          <FontAwesomeIcon icon="square" />
          <span className="hidden-xs"> {t('measurement.area')}</span>
        </Button>
      </ButtonGroup>{' '}
      {tool === 'measure-dist' && (
        <Button
          active={elevationChartTrackGeojson !== null}
          onClick={toggleElevationChart}
          disabled={distancePoints.length > 1}
        >
          <FontAwesomeIcon icon="bar-chart" />
          <span className="hidden-xs"> {t('general.elevationProfile')}</span>
        </Button>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  selection: state.main.selection,
  distancePoints:
    (state.main.selection?.type === 'measure-dist' ||
      state.main.selection?.type === 'measure-area') &&
    state.main.selection.id != null
      ? state.distanceMeasurement.lines[state.main.selection.id].points
      : [],
  elevationChartTrackGeojson: state.elevationChart.trackGeojson,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onToolSet(tool: Tool | null) {
    dispatch(selectFeature(tool && { type: tool }));
  },
  onElevationChartTrackGeojsonSet(trackGeojson: GeoJsonObject) {
    dispatch(elevationChartSetTrackGeojson(trackGeojson));
  },
  onElevationChartClose() {
    dispatch(elevationChartClose());
  },
  onDistPointAdd(
    type: 'area' | 'distance',
    index: number | undefined,
    point: Point,
    position: number,
  ) {
    dispatch(distanceMeasurementAddPoint({ index, point, position, type }));
  },
  onElePointSet(point: LatLon) {
    dispatch(elevationMeasurementSetPoint(point));
  },
});

export const MeasurementMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MeasurementMenuInt));
