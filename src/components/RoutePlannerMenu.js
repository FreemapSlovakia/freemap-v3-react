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
  routePlannerToggleElevationChart, routePlannerSetActiveAlternativeIndex, routePlannerSwapEnds } from 'fm3/actions/routePlannerActions';
import { setActiveModal, startProgress, stopProgress } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import * as FmPropTypes from 'fm3/propTypes';
import { getCurrentPosition } from 'fm3/geoutils';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

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
    alternatives: PropTypes.arrayOf(FmPropTypes.routeAlternative.isRequired).isRequired,
    onAlternativeChange: PropTypes.func.isRequired,
    language: PropTypes.string,
    onEndsSwap: PropTypes.func.isRequired,
    canSwap: PropTypes.bool,
  };

  componentDidMount() {
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
      routeFound, expertMode, onToggleElevationChart, t, activeAlternativeIndex, alternatives,
      onAlternativeChange, language, onEndsSwap, canSwap,
    } = this.props;

    const transportTypes = [
      ['car', 'car'],
      ['car-free', 'car'],
      ['imhd', 'bus'],
      ['bike', 'bicycle'],
      ['bikesharing', 'bicycle'],
      (expertMode || transportType === 'foot-stroller') && ['foot-stroller', 'wheelchair-alt'],
      ['nordic', '!icon-skier-skiing'],
      (expertMode || transportType === 'ski') && ['ski', '!icon-skiing'],
      ['foot', '!icon-hiking'],
    ];

    const activeTransportType = transportTypes.filter(x => x).find(([type]) => type === transportType);

    const activeAlternative = alternatives[activeAlternativeIndex];

    const nf = Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    return (
      <>
        <span className="fm-label">
          <FontAwesomeIcon icon="map-signs" />
          <span className="hidden-xs"> {t('tools.routePlanner')}</span>
        </span>
        {' '}
        <ButtonGroup>
          <DropdownButton
            title={(
              <span>
                <FontAwesomeIcon icon="play" style={{ color: '#409a40' }} />
                <span className="hidden-xs"> {t('routePlanner.start')}</span>
              </span>
            )}
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
          <Button onClick={onEndsSwap} disabled={!canSwap} title={t('routePlanner.swap')}>⇆</Button>
          <DropdownButton
            title={(
              <span>
                <FontAwesomeIcon icon="stop" style={{ color: '#d9534f' }} />
                <span className="hidden-xs"> {t('routePlanner.finish')}</span>
              </span>
            )}
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
          title={!activeTransportType ? '' : (
            <>
              <FontAwesomeIcon icon={activeTransportType[1]} />
              {['car', 'bikesharing'].includes(activeTransportType[0]) && <FontAwesomeIcon icon="money" />}
              <span className="hidden-xs"> {t(`routePlanner.transportType.${activeTransportType[0]}`).replace(/\s*,.*/, '')}</span>
            </>
          )}
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
                <FontAwesomeIcon icon={icon} />{['car', 'bikesharing'].includes(type) && <FontAwesomeIcon icon="money" />} {t(`routePlanner.transportType.${type}`)}
              </MenuItem>
            ))
          }
        </DropdownButton>
        {alternatives.length > 1 && (
          <>
            {' '}
            <DropdownButton
              id="transport-type"
              title={
                transportType === 'imhd' && activeAlternative.extra && activeAlternative.extra.price
                  ? imhdSummary(t, language, activeAlternative.extra)
                  : t('routePlanner.summary', {
                    distance: nf.format(activeAlternative.distance),
                    h: Math.floor(activeAlternative.duration / 60),
                    m: Math.round(activeAlternative.duration % 60),
                  })
              }
            >
              {
                alternatives.map(({ duration, distance, extra }, i) => (
                  <MenuItem
                    eventKey={i}
                    key={i}
                    active={i === activeAlternativeIndex}
                    onClick={() => onAlternativeChange(i)}
                  >
                    {transportType === 'imhd' && extra && extra.price
                      ? imhdSummary(t, language, extra)
                      : t('routePlanner.summary', {
                        distance: nf.format(distance),
                        h: Math.floor(duration / 60),
                        m: Math.round(duration % 60),
                      })
                    }
                  </MenuItem>
                ))
              }
            </DropdownButton>
          </>
        )}
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
      </>
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
      language: state.l10n.language,
      canSwap: !!(state.routePlanner.start && state.routePlanner.finish),
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
          messageKey: 'routePlanner.gpsError',
          style: 'danger',
          timeout: 5000,
        }));
      },
      onMissingHomeLocation() {
        dispatch(toastsAdd({
          collapseKey: 'routePlanner.noHomeAlert',
          messageKey: 'routePlanner.noHomeAlert',
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
      onEndsSwap() {
        dispatch(routePlannerSwapEnds());
      },
    }),
  ),
)(RoutePlannerMenu);

function imhdSummary(t, language, extra) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit', minute: '2-digit',
  });

  const { price, arrival, numbers } = extra;
  return t('routePlanner.imhd.total.short', {
    price: Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price),
    arrival: dateFormat.format(arrival * 1000),
    numbers,
  });
}
