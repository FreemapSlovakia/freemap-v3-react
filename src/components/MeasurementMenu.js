import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import injectL10n from 'fm3/l10nInjector';

import { setTool } from 'fm3/actions/mainActions';
import { distanceMeasurementAddPoint } from 'fm3/actions/distanceMeasurementActions';
import { areaMeasurementAddPoint } from 'fm3/actions/areaMeasurementActions';
import { elevationMeasurementSetPoint } from 'fm3/actions/elevationMeasurementActions';

import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import * as FmPropTypes from 'fm3/propTypes';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

class MeasurementMenu extends React.Component {
  static propTypes = {
    tool: FmPropTypes.tool,
    onToolSet: PropTypes.func.isRequired,
    areaPoints: FmPropTypes.points.isRequired,
    distancePoints: FmPropTypes.points.isRequired,
    routeDefined: PropTypes.bool.isRequired,
    onElevationChartTrackGeojsonSet: PropTypes.func.isRequired,
    onElevationChartClose: PropTypes.func.isRequired,
    elevationChartTrackGeojson: PropTypes.object, // eslint-disable-line
    onAreaPointAdd: PropTypes.func.isRequired,
    onDistPointAdd: PropTypes.func.isRequired,
    onElePointSet: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  componentDidMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdd);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdd);
  }

  handlePoiAdd = (lat, lon, position, id0) => {
    if (this.props.tool === 'measure-ele') {
      this.props.onElePointSet({ lat, lon });
      return;
    }

    const points = this.props.tool === 'measure-area' ? this.props.areaPoints : this.props.distancePoints;
    const pos = position ? Math.ceil(position / 2) : points.length;
    let id;
    if (id0) {
      id = id0;
    } else if (pos === 0) {
      id = points.length ? points[pos].id - 1 : 0;
    } else if (pos === points.length) {
      id = points[pos - 1].id + 1;
    } else {
      id = (points[pos - 1].id + points[pos].id) / 2;
    }

    if (this.props.tool === 'measure-dist') {
      this.props.onDistPointAdd({ lat, lon, id }, pos);
    }

    if (this.props.tool === 'measure-area') {
      this.props.onAreaPointAdd({ lat, lon, id }, pos);
    }
  }

  toggleElevationChart = () => {
    // TODO to logic

    const isActive = this.props.elevationChartTrackGeojson;
    if (isActive) {
      this.props.onElevationChartClose();
    } else {
      this.props.onElevationChartTrackGeojsonSet({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.props.distancePoints.map(p => [p.lon, p.lat]),
        },
      });
    }
  }

  render() {
    const { onToolSet, tool, routeDefined, elevationChartTrackGeojson, t } = this.props;

    return (
      <React.Fragment>
        <span className="fm-label">
          <FontAwesomeIcon icon="!icon-ruler" />
          <span className="hidden-xs"> {t('tools.measurement')}</span>
        </span>
        {' '}
        <ButtonGroup>
          <Button onClick={() => onToolSet('measure-dist')} active={tool === 'measure-dist'} title={t('measurement.distance')}>
            <FontAwesomeIcon icon="arrows-h" />
            <span className="hidden-xs"> {t('measurement.distance')}</span>
          </Button>
          <Button onClick={() => onToolSet('measure-ele')} active={tool === 'measure-ele'} title={t('measurement.elevation')}>
            <FontAwesomeIcon icon="long-arrow-up" />
            <span className="hidden-xs"> {t('measurement.elevation')}</span>
          </Button>
          <Button onClick={() => onToolSet('measure-area')} active={tool === 'measure-area'} title={t('measurement.area')}>
            <FontAwesomeIcon icon="square" />
            <span className="hidden-xs"> {t('measurement.area')}</span>
          </Button>
        </ButtonGroup>
        {' '}
        {tool === 'measure-dist' && (
          <Button active={elevationChartTrackGeojson !== null} onClick={this.toggleElevationChart} disabled={!routeDefined}>
            <FontAwesomeIcon icon="bar-chart" />
            <span className="hidden-xs"> {t('general.elevationProfile')}</span>
          </Button>
        )}
      </React.Fragment>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      tool: state.main.tool,
      distancePoints: state.distanceMeasurement.points,
      areaPoints: state.areaMeasurement.points,
      routeDefined: state.distanceMeasurement.points.length > 1,
      elevationChartTrackGeojson: state.elevationChart.trackGeojson,
    }),
    dispatch => ({
      onToolSet(tool) {
        dispatch(setTool(tool));
      },
      onElevationChartTrackGeojsonSet(trackGeojson) {
        dispatch(elevationChartSetTrackGeojson(trackGeojson));
      },
      onElevationChartClose() {
        dispatch(elevationChartClose());
      },
      onAreaPointAdd(coordinates, position) {
        dispatch(areaMeasurementAddPoint(coordinates, position));
      },
      onDistPointAdd(coordinates, position) {
        dispatch(distanceMeasurementAddPoint(coordinates, position));
      },
      onElePointSet(point) {
        dispatch(elevationMeasurementSetPoint(point));
      },
    }),
  ),
)(MeasurementMenu);
