import React from 'react';
import { compose, Dispatch } from 'redux';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

import injectL10n, { Translator } from 'fm3/l10nInjector';

import {
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerSetTransportType,
  routePlannerSetMode,
  routePlannerSetPickMode,
  routePlannerToggleItineraryVisibility,
  routePlannerToggleElevationChart,
  routePlannerSetActiveAlternativeIndex,
  routePlannerSwapEnds,
} from 'fm3/actions/routePlannerActions';
import {
  setActiveModal,
  startProgress,
  stopProgress,
} from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { getCurrentPosition } from 'fm3/geoutils';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { TransportType } from 'fm3/reducers/routePlannerReducer';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

class RoutePlannerMenu extends React.Component<Props> {
  componentDidMount() {
    mapEventEmitter.on('mapClick', this.handlePoiAdd);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.handlePoiAdd);
  }

  // TODO move to logic
  setFromCurrentPosition(pointType: 'start' | 'finish') {
    const pid = Math.random();
    this.props.onProgressStart(pid);
    getCurrentPosition().then(
      ({ lat, lon }) => {
        this.props.onProgressStop(pid);
        if (pointType === 'start') {
          this.props.onStartSet({ lat, lon });
        } else if (pointType === 'finish') {
          this.props.onFinishSet({ lat, lon });
        } // else fail
      },
      (/*err*/) => {
        this.props.onProgressStop(pid);
        this.props.onGetCurrentPositionError();
      },
    );
  }

  setFromHomeLocation(pointType: 'start' | 'finish') {
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
  };

  handleStartHome = () => {
    this.setFromHomeLocation('start');
  };

  handleFinishCurrent = () => {
    this.setFromCurrentPosition('finish');
  };

  handleFinishHome = () => {
    this.setFromHomeLocation('finish');
  };

  handlePoiAdd = (lat: number, lon: number) => {
    if (this.props.pickMode === 'start') {
      this.props.onStartSet({ lat, lon });
    } else if (this.props.pickMode === 'finish') {
      this.props.onFinishSet({ lat, lon });
    }
  };

  render() {
    const {
      pickPointMode,
      transportType,
      onTransportTypeChange,
      onPickPointModeChange,
      /* onItineraryVisibilityToggle, itineraryIsVisible, */ elevationProfileIsVisible,
      routeFound,
      expertMode,
      onToggleElevationChart,
      t,
      activeAlternativeIndex,
      alternatives,
      onAlternativeChange,
      language,
      onEndsSwap,
      canSwap,
      mode,
      onModeChange,
    } = this.props;

    const transportTypes: Array<[TransportType, string]> = [
      ['car', 'car'],
      ['car-free', 'car'],
      ['imhd', 'bus'],
      ['bike', 'bicycle'],
      ['bikesharing', 'bicycle'],
      ['nordic', '!icon-skier-skiing'],
      ['foot', '!icon-hiking'],
    ];

    if (expertMode) {
      transportTypes.push(['foot-stroller', 'wheelchair-alt']);
      transportTypes.push(['ski', '!icon-skiing']);
    }

    const activeTransportType = transportTypes
      .filter(x => x)
      .find(([type]) => type === transportType);

    const activeAlternative = alternatives[activeAlternativeIndex];

    const nf = Intl.NumberFormat(language, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    const DropdownButton2 = DropdownButton as any; // because active is missing

    return (
      <>
        <span className="fm-label">
          <FontAwesomeIcon icon="map-signs" />
          <span className="hidden-xs"> {t('tools.routePlanner')}</span>
        </span>{' '}
        <ButtonGroup>
          <DropdownButton2
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
              <FontAwesomeIcon icon="map-marker" />{' '}
              {t('routePlanner.point.pick')}
            </MenuItem>
            <MenuItem onClick={this.handleStartCurrent}>
              <FontAwesomeIcon icon="bullseye" />{' '}
              {t('routePlanner.point.current')}
            </MenuItem>
            <MenuItem onClick={this.handleStartHome}>
              <FontAwesomeIcon icon="home" /> {t('routePlanner.point.home')}
            </MenuItem>
          </DropdownButton2>
          {mode !== 'roundtrip' && (
            <>
              <Button
                onClick={onEndsSwap}
                disabled={!canSwap}
                title={t('routePlanner.swap')}
              >
                ⇆
              </Button>
              <DropdownButton2
                title={
                  <span>
                    <FontAwesomeIcon icon="stop" style={{ color: '#d9534f' }} />
                    <span className="hidden-xs">
                      {' '}
                      {t('routePlanner.finish')}
                    </span>
                  </span>
                }
                id="set-finish-dropdown"
                onClick={() => onPickPointModeChange('finish')}
                active={pickPointMode === 'finish'}
              >
                <MenuItem>
                  <FontAwesomeIcon icon="map-marker" />{' '}
                  {t('routePlanner.point.pick')}
                </MenuItem>
                <MenuItem onClick={this.handleFinishCurrent}>
                  <FontAwesomeIcon icon="bullseye" />{' '}
                  {t('routePlanner.point.current')}
                </MenuItem>
                <MenuItem onClick={this.handleFinishHome}>
                  <FontAwesomeIcon icon="home" /> {t('routePlanner.point.home')}
                </MenuItem>
              </DropdownButton2>
            </>
          )}
        </ButtonGroup>{' '}
        <DropdownButton
          id="transport-type"
          title={
            !activeTransportType ? (
              ''
            ) : (
              <>
                <FontAwesomeIcon icon={activeTransportType[1]} />
                {['car', 'bikesharing'].includes(activeTransportType[0]) && (
                  <FontAwesomeIcon icon="money" />
                )}
                <span className="hidden-xs">
                  {' '}
                  {t(
                    `routePlanner.transportType.${activeTransportType[0]}`,
                  ).replace(/\s*,.*/, '')}
                </span>
              </>
            )
          }
        >
          {transportTypes
            .filter(x => x)
            .map(([type, icon]) => (
              <MenuItem
                eventKey={type}
                key={type}
                title={t(`routePlanner.transportType.${type}`)}
                active={transportType === type}
                onClick={() => onTransportTypeChange(type)}
              >
                <FontAwesomeIcon icon={icon} />
                {['car', 'bikesharing'].includes(type) && (
                  <FontAwesomeIcon icon="money" />
                )}{' '}
                {t(`routePlanner.transportType.${type}`)}
              </MenuItem>
            ))}
        </DropdownButton>{' '}
        <DropdownButton
          id="mode"
          title={t(`routePlanner.mode.${mode}`)}
          disabled={transportType === 'imhd' || transportType === 'bikesharing'}
        >
          {(['route', 'trip', 'roundtrip'] as const).map(mode1 => (
            <MenuItem
              eventKey={mode1}
              key={mode1}
              title={t(`routePlanner.mode.${mode1}`)}
              active={mode === mode1}
              onClick={() => onModeChange(mode1)}
            >
              {t(`routePlanner.mode.${mode1}`)}
            </MenuItem>
          ))}
        </DropdownButton>
        {alternatives.length > 1 && (
          <>
            {' '}
            <DropdownButton
              id="transport-type"
              title={
                transportType === 'imhd' &&
                activeAlternative.extra &&
                activeAlternative.extra.price
                  ? imhdSummary(t, language, activeAlternative.extra)
                  : t('routePlanner.summary', {
                      distance: nf.format(activeAlternative.distance),
                      h: Math.floor(activeAlternative.duration / 60),
                      m: Math.round(activeAlternative.duration % 60),
                    })
              }
            >
              {alternatives.map(({ duration, distance, extra }, i) => (
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
                      })}
                </MenuItem>
              ))}
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
        */}{' '}
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

const mapStateToProps = (state: RootState) => ({
  pickMode: state.routePlanner.pickMode,
  homeLocation: state.main.homeLocation,
  transportType: state.routePlanner.transportType,
  mode: state.routePlanner.mode,
  pickPointMode: state.routePlanner.pickMode,
  itineraryIsVisible: state.routePlanner.itineraryIsVisible,
  routeFound: !!state.routePlanner.alternatives.length,
  activeAlternativeIndex: state.routePlanner.activeAlternativeIndex,
  alternatives: state.routePlanner.alternatives,
  elevationProfileIsVisible: !!state.elevationChart.trackGeojson,
  expertMode: state.main.expertMode,
  language: state.l10n.language,
  canSwap: !!(state.routePlanner.start && state.routePlanner.finish),
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onStartSet(start) {
    dispatch(routePlannerSetStart({ start }));
  },
  onFinishSet(finish) {
    dispatch(routePlannerSetFinish({ finish }));
  },
  onItineraryVisibilityToggle() {
    dispatch(routePlannerToggleItineraryVisibility());
  },
  onTransportTypeChange(transportType: TransportType) {
    dispatch(routePlannerSetTransportType(transportType));
  },
  onModeChange(mode: 'trip' | 'roundtrip' | 'route') {
    dispatch(routePlannerSetMode(mode));
  },
  onPickPointModeChange(pickMode: 'start' | 'finish') {
    dispatch(routePlannerSetPickMode(pickMode));
  },
  onProgressStart(pid) {
    dispatch(startProgress(pid));
  },
  onProgressStop(pid) {
    dispatch(stopProgress(pid));
  },
  onGetCurrentPositionError() {
    dispatch(
      toastsAdd({
        collapseKey: 'routePlanner.gpsError',
        messageKey: 'routePlanner.gpsError',
        style: 'danger',
        timeout: 5000,
      }),
    );
  },
  onMissingHomeLocation() {
    dispatch(
      toastsAdd({
        collapseKey: 'routePlanner.noHomeAlert',
        messageKey: 'routePlanner.noHomeAlert',
        style: 'warning',
        actions: [
          { name: 'Nastav', action: setActiveModal('settings') },
          { name: 'Zavri' },
        ],
      }),
    );
  },
  onToggleElevationChart() {
    dispatch(routePlannerToggleElevationChart());
  },
  onAlternativeChange(index: number) {
    dispatch(routePlannerSetActiveAlternativeIndex(index));
  },
  onEndsSwap() {
    dispatch(routePlannerSwapEnds());
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(RoutePlannerMenu);

function imhdSummary(t: Translator, language: string, extra) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const { price, arrival, numbers } = extra;
  return t('routePlanner.imhd.total.short', {
    price: Intl.NumberFormat(language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price),
    arrival: dateFormat.format(arrival * 1000),
    numbers,
  });
}
