import React from 'react';
import PropTypes from 'prop-types';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';

import { routePlannerSetStart, routePlannerSetFinish, routePlannerSetTransportType,
  routePlannerSetPickMode, routePlannerToggleItineraryVisibility } from 'fm3/actions/routePlannerActions';
import { setActiveModal, startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { getCurrentPosition } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

class RoutePlannerMenu extends React.Component {
  static propTypes = {
    onStartSet: PropTypes.func.isRequired,
    onFinishSet: PropTypes.func.isRequired,
    transportType: PropTypes.string,
    pickPointMode: PropTypes.string,
    onTransportTypeChange: PropTypes.func.isRequired,
    onPickPointModeChange: PropTypes.func.isRequired,
    homeLocation: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number,
    }),
    onItineraryVisibilityToggle: PropTypes.func.isRequired,
    itineraryIsVisible: PropTypes.bool.isRequired,
    onElevationChartVisibilityToggle: PropTypes.func.isRequired,
    elevationProfileIsVisible: PropTypes.bool.isRequired,
    onProgressStart: PropTypes.func.isRequired,
    onProgressStop: PropTypes.func.isRequired,
    routeFound: PropTypes.bool.isRequired,
    shapePoints: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    onGetCurrentPositionError: PropTypes.func.isRequired,
    onMissingHomeLocation: PropTypes.func.isRequired,
    pickMode: PropTypes.string,
    expertMode: PropTypes.bool,
  };

  componentWillMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdd);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdd);
  }

  // TODO move to logic
  setFromCurrentPosition(pointType) {
    this.props.onProgressStart();
    getCurrentPosition().then(({ lat, lon }) => {
      this.props.onProgressStop();
      if (pointType === 'start') {
        this.props.onStartSet({ lat, lon });
      } else if (pointType === 'finish') {
        this.props.onFinishSet({ lat, lon });
      } // else fail
    }, (e) => {
      this.props.onProgressStop();
      this.props.onGetCurrentPositionError(e);
    });
  }

  setFromHomeLocation(pointType) {
    const { homeLocation } = this.props;
    if (!homeLocation) {
      this.props.onMissingHomeLocation();
    } else if (pointType === 'start') {
      this.props.onStartSet(homeLocation);
    } else if (pointType === 'finish') {
      this.props.onFinishSet(homeLocation);
    }
  }

  handleStartCurrent = () => {
    this.setFromCurrentPosition('start');
  }

  handleStartHome = () => {
    this.setFromHomeLocation('start');
  }

  handleFinishCurrent = () => {
    this.setFromCurrentPosition('finish');
  }

  handleFinishHome = () => {
    this.setFromHomeLocation('finish');
  }

  handlePoiAdd = (lat, lon) => {
    if (this.props.pickMode === 'start') {
      this.props.onStartSet({ lat, lon });
    } else if (this.props.pickMode === 'finish') {
      this.props.onFinishSet({ lat, lon });
    }
  }

  render() {
    const {
      pickPointMode, transportType, onTransportTypeChange, onPickPointModeChange,
      onItineraryVisibilityToggle, itineraryIsVisible, onElevationChartVisibilityToggle, elevationProfileIsVisible,
      routeFound, shapePoints, expertMode,
    } = this.props;

    return (
      <span>
        <span className="fm-label"><FontAwesomeIcon icon="map-signs" /><span className="hidden-xs"> Plánovač</span></span>
        {' '}
        <ButtonGroup>
          <DropdownButton
            title={<span><FontAwesomeIcon icon="play" style={{ color: '#409a40' }} /><span className="hidden-xs"> Štart</span></span>}
            id="add-start-dropdown"
            onClick={() => onPickPointModeChange('start')}
            active={pickPointMode === 'start'}
          >
            <MenuItem><FontAwesomeIcon icon="map-marker" /> Vybrať na mape</MenuItem>
            <MenuItem onClick={this.handleStartCurrent}><FontAwesomeIcon icon="bullseye" /> Aktuálna poloha</MenuItem>
            <MenuItem onClick={this.handleStartHome}><FontAwesomeIcon icon="home" /> Domov</MenuItem>
          </DropdownButton>
          <DropdownButton
            title={<span><FontAwesomeIcon icon="stop" style={{ color: '#d9534f' }} /><span className="hidden-xs"> Cieľ</span></span>}
            id="add-finish-dropdown"
            onClick={() => onPickPointModeChange('finish')}
            active={pickPointMode === 'finish'}
          >
            <MenuItem><FontAwesomeIcon icon="map-marker" /> Vybrať na mape</MenuItem>
            <MenuItem onClick={this.handleFinishCurrent}><FontAwesomeIcon icon="bullseye" /> Aktuálna poloha</MenuItem>
            <MenuItem onClick={this.handleFinishHome}><FontAwesomeIcon icon="home" /> Domov</MenuItem>
          </DropdownButton>
        </ButtonGroup>
        {' '}
        <ButtonGroup>
          {
            [
              ['car', 'car', 'auto, vrátane spoplatnených ciest'],
              ['car-free', 'car', 'auto, mimo spoplatnených ciest'],
              ['foot', 'male', 'pešo'],
              expertMode && ['foot-stroller', 'female', 's kočíkom'],
              ['bike', 'bicycle', 'bicykel'],
              expertMode && ['ski', 'snowflake-o', 'zjazdové lyžovanie'],
              ['nordic', 'snowflake-o', 'bežky'],
            ].filter(x => x).map(([type, icon, title]) => (
              <Button
                key={type}
                title={title}
                active={transportType === type}
                onClick={() => onTransportTypeChange(type)}
              >
                {type === 'car' ? '€' : ''}<FontAwesomeIcon icon={icon} />
              </Button>
            ))
          }
        </ButtonGroup>
        {' '}
        <Button
          onClick={() => onItineraryVisibilityToggle()}
          active={itineraryIsVisible}
          title="Itinerár"
        >
          <FontAwesomeIcon icon="list-ol" /><span className="hidden-xs"> Itinerár</span>
        </Button>
        {' '}
        {routeFound &&
          <Button
            onClick={() => onElevationChartVisibilityToggle(shapePoints, elevationProfileIsVisible)}
            active={elevationProfileIsVisible}
            title="Výškovy profil"
          >
            <FontAwesomeIcon icon="bar-chart" /><span className="hidden-xs"> Výškovy profil</span>
          </Button>
        }
      </span>
    );
  }
}

export default connect(
  state => ({
    pickMode: state.routePlanner.pickMode,
    homeLocation: state.main.homeLocation,
    transportType: state.routePlanner.transportType,
    pickPointMode: state.routePlanner.pickMode,
    itineraryIsVisible: state.routePlanner.itineraryIsVisible,
    routeFound: !!state.routePlanner.shapePoints,
    shapePoints: state.routePlanner.shapePoints,
    elevationProfileIsVisible: !!state.elevationChart.trackGeojson,
    expertMode: state.main.expertMode,
  }),
  dispatch => ({
    onStartSet(start) {
      dispatch(routePlannerSetStart(start));
    },
    onFinishSet(finish) {
      dispatch(routePlannerSetFinish(finish));
    },
    onItineraryVisibilityToggle() {
      dispatch(routePlannerToggleItineraryVisibility());
    },
    onElevationChartVisibilityToggle(shapePoints, elevationProfileIsVisible) {
      if (elevationProfileIsVisible) {
        dispatch(elevationChartClose());
      } else {
        const geojson = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: shapePoints.map(latlon => [latlon[1], latlon[0]]),
          },
        };
        dispatch(elevationChartSetTrackGeojson(geojson));
      }
    },
    onTransportTypeChange(transportType) {
      dispatch(routePlannerSetTransportType(transportType));
    },
    onPickPointModeChange(pickMode) {
      dispatch(routePlannerSetPickMode(pickMode));
    },
    onProgressStart() {
      dispatch(startProgress());
    },
    onProgressStop() {
      dispatch(stopProgress());
    },
    onGetCurrentPositionError() {
      dispatch(toastsAdd({
        collapseKey: 'routePlanner.gpsError',
        message: 'Nepodarilo sa získať aktuálnu polohu.',
        style: 'danger',
        timeout: 5000,
      }));
    },
    onMissingHomeLocation() {
      dispatch(toastsAdd({
        collapseKey: 'routePlanner.noHome',
        message: 'Najprv si musíte nastaviť domovskú polohu.',
        style: 'warning',
        cancelType: 'SET_TOOL',
        actions: [
          { name: 'Nastav', action: setActiveModal('settings') },
          { name: 'Zavri' },
        ],
      }));
    },
  }),
)(RoutePlannerMenu);
