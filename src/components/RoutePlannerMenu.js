import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

import injectL10n from 'fm3/l10nInjector';

import { routePlannerSetStart, routePlannerSetFinish, routePlannerSetTransportType,
  routePlannerSetPickMode, routePlannerToggleItineraryVisibility,
  routePlannerToggleElevationChart, routePlannerSetActiveAlternativeIndex } from 'fm3/actions/routePlannerActions';
import { setActiveModal, startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import * as FmPropTypes from 'fm3/propTypes';
import { getCurrentPosition } from 'fm3/geoutils';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

const nf = Intl.NumberFormat('sk', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

class RoutePlannerMenu extends React.Component {
  static propTypes = {
    onStartSet: PropTypes.func.isRequired,
    onFinishSet: PropTypes.func.isRequired,
    transportType: PropTypes.string,
    pickPointMode: PropTypes.string,
    onTransportTypeChange: PropTypes.func.isRequired,
    onPickPointModeChange: PropTypes.func.isRequired,
    homeLocation: FmPropTypes.point,
    // onItineraryVisibilityToggle: PropTypes.func.isRequired,
    // itineraryIsVisible: PropTypes.bool.isRequired,
    onToggleElevationChart: PropTypes.func.isRequired,
    elevationProfileIsVisible: PropTypes.bool.isRequired,
    onProgressStart: PropTypes.func.isRequired,
    onProgressStop: PropTypes.func.isRequired,
    routeFound: PropTypes.bool.isRequired,
    onGetCurrentPositionError: PropTypes.func.isRequired,
    onMissingHomeLocation: PropTypes.func.isRequired,
    pickMode: PropTypes.string,
    expertMode: PropTypes.bool,
    t: PropTypes.func.isRequired,
    activeAlternativeIndex: PropTypes.number.isRequired,
    alternatives: PropTypes.arrayOf(FmPropTypes.routeAlternative).isRequired,
    onAlternativeChange: PropTypes.func.isRequired,
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
      /* onItineraryVisibilityToggle, itineraryIsVisible, */ elevationProfileIsVisible,
      routeFound, expertMode, onToggleElevationChart, t, activeAlternativeIndex, alternatives, onAlternativeChange,
    } = this.props;

    const transportTypes = [
      ['car', 'car'],
      ['car-free', 'car'],
      ['imhd', 'bus'],
      ['bike', 'bicycle'],
      (expertMode || transportType === 'foot-stroller') && ['foot-stroller', 'wheelchair-alt'],
      ['nordic', '!icon-skier-skiing'],
      (expertMode || transportType === 'ski') && ['ski', '!icon-skiing'],
      ['foot', '!icon-hiking'],
    ];

    const activeTransportType = transportTypes.filter(x => x).find(([type]) => type === transportType) || [];

    const activeAlternative = alternatives[activeAlternativeIndex];

    return (
      <span>
        <span className="fm-label">
          <FontAwesomeIcon icon="map-signs" />
          <span className="hidden-xs"> {t('tools.routePlanner')}</span>
        </span>
        {' '}
        <ButtonGroup>
          <DropdownButton
            title={
              <span>
                <FontAwesomeIcon icon="play" style={{ color: '#409a40' }} />
                <span className="hidden-xs"> {t('routePlanner.start')}</span>
              </span>
            }
            id="set-start-dropdown"
            onClick={() => onPickPointModeChange('start')}
            active={pickPointMode === 'start'}
          >
            <MenuItem>
              <FontAwesomeIcon icon="map-marker" /> {t('routePlanner.point.pick')}
            </MenuItem>
            <MenuItem onClick={this.handleStartCurrent}>
              <FontAwesomeIcon icon="bullseye" /> {t('routePlanner.point.current')}
            </MenuItem>
            <MenuItem onClick={this.handleStartHome}>
              <FontAwesomeIcon icon="home" /> {t('routePlanner.point.home')}
            </MenuItem>
          </DropdownButton>
          <DropdownButton
            title={
              <span>
                <FontAwesomeIcon icon="stop" style={{ color: '#d9534f' }} />
                <span className="hidden-xs"> {t('routePlanner.finish')}</span>
              </span>
            }
            id="set-finish-dropdown"
            onClick={() => onPickPointModeChange('finish')}
            active={pickPointMode === 'finish'}
          >
            <MenuItem>
              <FontAwesomeIcon icon="map-marker" /> {t('routePlanner.point.pick')}
            </MenuItem>
            <MenuItem onClick={this.handleFinishCurrent}>
              <FontAwesomeIcon icon="bullseye" /> {t('routePlanner.point.current')}
            </MenuItem>
            <MenuItem onClick={this.handleFinishHome}>
              <FontAwesomeIcon icon="home" /> {t('routePlanner.point.home')}
            </MenuItem>
          </DropdownButton>
        </ButtonGroup>
        {' '}
        <DropdownButton
          id="transport-type"
          title={
            <React.Fragment>
              <FontAwesomeIcon icon={activeTransportType[1]} />
              {activeTransportType[0] === 'car' && <FontAwesomeIcon icon="money" />}
              <span className="hidden-xs"> {t(`routePlanner.transportType.${activeTransportType[0]}`).replace(/\s*,.*/, '')}</span>
            </React.Fragment>
          }
        >
          {
            transportTypes.filter(x => x).map(([type, icon]) => (
              <MenuItem
                eventKey={type}
                key={type}
                title={t(`routePlanner.transportType.${type}`)}
                active={transportType === type}
                onClick={() => onTransportTypeChange(type)}
              >
                <FontAwesomeIcon icon={icon} />{type === 'car' && <FontAwesomeIcon icon="money" />} {t(`routePlanner.transportType.${type}`)}
              </MenuItem>
            ))
          }
        </DropdownButton>
        {alternatives.length > 0 &&
          <React.Fragment>
            {' '}
            <DropdownButton
              id="transport-type"
              title={
                transportType === 'imhd' && activeAlternative.summary0
                  ? activeAlternative.summary0.replace(/ \(.*/, '')
                  : `${nf.format(activeAlternative.distance)} km / ${Math.floor(activeAlternative.duration / 60)} h ${Math.round(activeAlternative.duration % 60)} m`
              }
            >
              {
                alternatives.map(({ duration, distance, summary0 }, i) => (
                  <MenuItem
                    eventKey={i}
                    key={i}
                    active={i === activeAlternativeIndex}
                    onClick={() => onAlternativeChange(i)}
                  >
                    {transportType === 'imhd' && summary0
                      ? summary0
                      : `${nf.format(distance)} km / ${Math.floor(duration / 60)} h ${Math.round(duration % 60)} m`
                    }
                  </MenuItem>
                ))
              }
            </DropdownButton>
          </React.Fragment>
        }
        {/* ' '}
        <Button
          onClick={() => onItineraryVisibilityToggle()}
          active={itineraryIsVisible}
          title="Itinerár"
        >
          <FontAwesomeIcon icon="list-ol" /><span className="hidden-xs"> Itinerár</span>
        </Button>
        */}
        {' '}
        <Button
          onClick={onToggleElevationChart}
          active={elevationProfileIsVisible}
          disabled={!routeFound}
          title={t('general.elevationProfile')}
        >
          <FontAwesomeIcon icon="bar-chart" />
          <span className="hidden-xs"> {t('general.elevationProfile')}</span>
        </Button>
      </span>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      pickMode: state.routePlanner.pickMode,
      homeLocation: state.main.homeLocation,
      transportType: state.routePlanner.transportType,
      pickPointMode: state.routePlanner.pickMode,
      itineraryIsVisible: state.routePlanner.itineraryIsVisible,
      routeFound: !!state.routePlanner.alternatives.length,
      shapePoints: state.routePlanner.shapePoints,
      activeAlternativeIndex: state.routePlanner.activeAlternativeIndex,
      alternatives: state.routePlanner.alternatives,
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
          actions: [
            { name: 'Nastav', action: setActiveModal('settings') },
            { name: 'Zavri' },
          ],
        }));
      },
      onToggleElevationChart() {
        dispatch(routePlannerToggleElevationChart());
      },
      onAlternativeChange(index) {
        dispatch(routePlannerSetActiveAlternativeIndex(index));
      },
    }),
  ),
)(RoutePlannerMenu);
