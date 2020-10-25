import React, { useMemo, useEffect, useCallback } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

import { withTranslator, Translator } from 'fm3/l10nInjector';

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
  routePlannerSetFromCurrentPosition,
  routePlannerToggleMilestones,
  RouteAlternativeExtra,
  PickMode,
  RoutingMode,
} from 'fm3/actions/routePlannerActions';
import { setActiveModal, convertToDrawing } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import { LatLon } from 'fm3/types/common';
import { transportTypeDefs, TransportType } from 'fm3/transportTypeDefs';
import { Checkbox } from 'react-bootstrap';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const RoutePlannerMenuInt: React.FC<Props> = ({
  pickPointMode,
  transportType,
  onTransportTypeChange,
  onPickPointModeChange,
  // onItineraryVisibilityToggle,
  // itineraryIsVisible,
  elevationProfileIsVisible,
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
  pickMode,
  onStartSet,
  onFinishSet,
  onMissingHomeLocation,
  onSetFromCurrentPosition,
  homeLocation,
  onConvertToDrawing,
  onMilestonesChange,
  milestones,
}) => {
  const handlePoiAdd = useCallback(
    (lat: number, lon: number) => {
      if (pickMode === 'start') {
        onStartSet({ lat, lon });
      } else if (pickMode === 'finish') {
        onFinishSet({ lat, lon });
      }
    },
    [pickMode, onStartSet, onFinishSet],
  );

  useEffect(() => {
    mapEventEmitter.on('mapClick', handlePoiAdd);
    return () => {
      mapEventEmitter.removeListener('mapClick', handlePoiAdd);
    };
  }, [handlePoiAdd]);

  const setFromHomeLocation = useCallback(
    (pointType: PickMode) => {
      if (!homeLocation) {
        onMissingHomeLocation();
      } else if (pointType === 'start') {
        onStartSet(homeLocation);
      } else if (pointType === 'finish') {
        onFinishSet(homeLocation);
      }
    },
    [homeLocation, onMissingHomeLocation, onStartSet, onFinishSet],
  );

  const handleStartCurrent = useCallback(() => {
    onSetFromCurrentPosition('start');
  }, [onSetFromCurrentPosition]);

  const handleStartHome = useCallback(() => {
    setFromHomeLocation('start');
  }, [setFromHomeLocation]);

  const handleFinishCurrent = useCallback(() => {
    onSetFromCurrentPosition('finish');
  }, [onSetFromCurrentPosition]);

  const handleFinishHome = useCallback(() => {
    setFromHomeLocation('finish');
  }, [setFromHomeLocation]);

  const activeTransportType = useMemo(
    () => transportTypeDefs.find(({ type }) => type === transportType),
    [transportType],
  );

  const activeAlternative = alternatives[activeAlternativeIndex];

  const nf = Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const DropdownButton2 = DropdownButton as any; // because active is missing

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleConvertToDrawing = useCallback(() => {
    const tolerance = window.prompt(t('general.simplifyPrompt'), '50');

    if (tolerance !== null) {
      onConvertToDrawing(Number(tolerance));
    }
  }, [onConvertToDrawing, t]);

  return (
    <>
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
            <FontAwesomeIcon icon="map-marker" /> {t('routePlanner.point.pick')}
          </MenuItem>
          <MenuItem onSelect={handleStartCurrent}>
            <FontAwesomeIcon icon="bullseye" />{' '}
            {t('routePlanner.point.current')}
          </MenuItem>
          <MenuItem onSelect={handleStartHome}>
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
                  <span className="hidden-xs"> {t('routePlanner.finish')}</span>
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
              <MenuItem onSelect={handleFinishCurrent}>
                <FontAwesomeIcon icon="bullseye" />{' '}
                {t('routePlanner.point.current')}
              </MenuItem>
              <MenuItem onSelect={handleFinishHome}>
                <FontAwesomeIcon icon="home" /> {t('routePlanner.point.home')}
              </MenuItem>
            </DropdownButton2>
          </>
        )}
      </ButtonGroup>{' '}
      <DropdownButton
        id="transport-type"
        onSelect={onTransportTypeChange}
        title={
          activeTransportType ? (
            <>
              <FontAwesomeIcon icon={activeTransportType.icon} />
              {['car', 'bikesharing'].includes(activeTransportType.type) && (
                <FontAwesomeIcon icon="money" />
              )}
              <span className="hidden-xs">
                {' '}
                {t(
                  `routePlanner.transportType.${activeTransportType.type}`,
                ).replace(/\s*,.*/, '')}
              </span>
            </>
          ) : (
            ''
          )
        }
      >
        {transportTypeDefs
          .filter(({ expert, hidden }) => !hidden && (expertMode || !expert))
          .map(({ type, icon, development }) => (
            <MenuItem
              eventKey={type}
              key={type}
              title={t(`routePlanner.transportType.${type}`)}
              active={transportType === type}
            >
              <FontAwesomeIcon icon={icon} />
              {['car', 'bikesharing'].includes(type) && (
                <FontAwesomeIcon icon="money" />
              )}{' '}
              {t(`routePlanner.transportType.${type}`)}
              {development && (
                <>
                  {' '}
                  <FontAwesomeIcon
                    icon="flask"
                    title={t('routePlanner.development')}
                    className="text-warning"
                  />
                </>
              )}
              {type === 'bikesharing' && (
                <>
                  {' '}
                  <a
                    href="http://routing.epsilon.sk/bikesharing.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={stopPropagation}
                  >
                    <FontAwesomeIcon icon="info-circle" />
                  </a>
                </>
              )}
            </MenuItem>
          ))}
      </DropdownButton>{' '}
      <DropdownButton
        id="mode"
        onSelect={onModeChange}
        title={t(`routePlanner.mode.${mode}`)}
        disabled={transportType === 'imhd' || transportType === 'bikesharing'}
      >
        {(['route', 'trip', 'roundtrip'] as const).map((mode1) => (
          <MenuItem
            eventKey={mode1}
            key={mode1}
            title={t(`routePlanner.mode.${mode1}`)}
            active={mode === mode1}
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
            onSelect={onAlternativeChange}
            title={
              transportType === 'imhd' &&
              activeAlternative.extra &&
              activeAlternative.extra.price
                ? imhdSummary(t, language, activeAlternative.extra)
                : t('routePlanner.summary', {
                    distance: nf.format(activeAlternative.distance / 1000),
                    h: Math.floor(
                      Math.round(activeAlternative.duration / 60) / 60,
                    ),
                    m: Math.round(activeAlternative.duration / 60) % 60,
                  })
            }
          >
            {alternatives.map(({ duration, distance, extra }, i) => (
              <MenuItem
                eventKey={i}
                key={i}
                active={i === activeAlternativeIndex}
              >
                {transportType === 'imhd' && extra?.price
                  ? imhdSummary(t, language, extra)
                  : t('routePlanner.summary', {
                      distance: nf.format(distance / 1000),
                      h: Math.floor(Math.round(duration / 60) / 60),
                      m: Math.round(duration / 60) % 60,
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
      </Button>{' '}
      <Button
        onClick={handleConvertToDrawing}
        disabled={!routeFound}
        title={t('general.convertToDrawing')}
      >
        <FontAwesomeIcon icon="pencil" />
        <span className="hidden-xs"> {t('general.convertToDrawing')}</span>
      </Button>{' '}
      <Checkbox inline onChange={onMilestonesChange} checked={milestones}>
        {t('routePlanner.milestones')}
      </Checkbox>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  milestones: state.routePlanner.milestones,
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
  onStartSet(start: LatLon) {
    dispatch(routePlannerSetStart({ start }));
  },
  onFinishSet(finish: LatLon) {
    dispatch(routePlannerSetFinish({ finish }));
  },
  onItineraryVisibilityToggle() {
    dispatch(routePlannerToggleItineraryVisibility());
  },
  onTransportTypeChange(transportType: unknown) {
    dispatch(routePlannerSetTransportType(transportType as TransportType));
  },
  onModeChange(mode: unknown) {
    dispatch(routePlannerSetMode(mode as RoutingMode));
  },
  onPickPointModeChange(pickMode: PickMode) {
    dispatch(routePlannerSetPickMode(pickMode));
  },
  onMissingHomeLocation() {
    dispatch(
      toastsAdd({
        id: 'routePlanner.noHomeAlert',
        messageKey: 'routePlanner.noHomeAlert.msg',
        style: 'warning',
        actions: [
          {
            nameKey: 'routePlanner.noHomeAlert.setHome',
            action: setActiveModal('settings'),
          },
          { nameKey: 'general.close' },
        ],
      }),
    );
  },
  onToggleElevationChart() {
    dispatch(routePlannerToggleElevationChart());
  },
  onAlternativeChange(index: unknown) {
    if (typeof index === 'number') {
      dispatch(routePlannerSetActiveAlternativeIndex(index as number));
    }
  },
  onEndsSwap() {
    dispatch(routePlannerSwapEnds());
  },
  onSetFromCurrentPosition(end: 'start' | 'finish') {
    dispatch(routePlannerSetFromCurrentPosition(end));
  },
  onConvertToDrawing(tolerance: number | undefined) {
    dispatch(convertToDrawing(tolerance));
  },
  onMilestonesChange() {
    dispatch(routePlannerToggleMilestones(undefined));
  },
});

export const RoutePlannerMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(RoutePlannerMenuInt));

function imhdSummary(
  t: Translator,
  language: string,
  extra: RouteAlternativeExtra,
) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const { price, arrival, numbers } = extra;

  return t('routePlanner.imhd.total.short', {
    price:
      price === undefined
        ? undefined
        : Intl.NumberFormat(language, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(price),
    arrival: dateFormat.format(arrival * 1000),
    numbers,
  });
}
