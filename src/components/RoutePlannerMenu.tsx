import { useMemo, useCallback, ReactElement, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useMessages } from 'fm3/l10nInjector';

import {
  routePlannerSetStart,
  routePlannerSetFinish,
  routePlannerSetTransportType,
  routePlannerSetMode,
  routePlannerSetPickMode,
  // routePlannerToggleItineraryVisibility,
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
import { RootState } from 'fm3/storeCreator';
import { transportTypeDefs, TransportType } from 'fm3/transportTypeDefs';
import {
  Button,
  ButtonGroup,
  DropdownButton,
  FormCheck,
} from 'react-bootstrap';
import { Messages } from 'fm3/translations/messagesInterface';
import Dropdown from 'react-bootstrap/Dropdown';

export function RoutePlannerMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const milestones = useSelector(
    (state: RootState) => state.routePlanner.milestones,
  );

  const homeLocation = useSelector(
    (state: RootState) => state.main.homeLocation,
  );

  const transportType = useSelector(
    (state: RootState) => state.routePlanner.transportType,
  );

  const mode = useSelector((state: RootState) => state.routePlanner.mode);

  const pickPointMode = useSelector(
    (state: RootState) => state.routePlanner.pickMode,
  );

  // const itineraryIsVisible = useSelector(
  //   (state: RootState) => state.routePlanner.itineraryIsVisible,
  // );

  const routeFound = useSelector(
    (state: RootState) => !!state.routePlanner.alternatives.length,
  );

  const activeAlternativeIndex = useSelector(
    (state: RootState) => state.routePlanner.activeAlternativeIndex,
  );

  const alternatives = useSelector(
    (state: RootState) => state.routePlanner.alternatives,
  );

  const elevationProfileIsVisible = useSelector(
    (state: RootState) => !!state.elevationChart.trackGeojson,
  );

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const language = useSelector((state: RootState) => state.l10n.language);

  const canSwap = useSelector(
    (state: RootState) =>
      !!(state.routePlanner.start && state.routePlanner.finish),
  );

  function setFromHomeLocation(pointType: PickMode) {
    if (!homeLocation) {
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
    } else if (pointType === 'start') {
      dispatch(routePlannerSetStart({ start: homeLocation }));
    } else if (pointType === 'finish') {
      dispatch(routePlannerSetFinish({ finish: homeLocation }));
    }
  }

  const activeTransportType = useMemo(
    () => transportTypeDefs.find(({ type }) => type === transportType),
    [transportType],
  );

  const activeAlternative = alternatives[activeAlternativeIndex];

  const nf = Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const stopPropagation = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleConvertToDrawing = useCallback(() => {
    const tolerance = window.prompt(m?.general.simplifyPrompt, '50');

    if (tolerance !== null) {
      dispatch(convertToDrawing(Number(tolerance)));
    }
  }, [dispatch, m]);

  return (
    <>
      <ButtonGroup>
        <DropdownButton
          as={ButtonGroup}
          variant="secondary"
          title={
            <span>
              <FontAwesomeIcon icon="play" style={{ color: '#409a40' }} />
              <span className="d-none d-md-inline">
                {' '}
                {m?.routePlanner.start}
              </span>
            </span>
          }
          id="set-start-dropdown"
          onClick={() => {
            dispatch(routePlannerSetPickMode('start'));
          }}
          // TODO active={pickPointMode === 'start'}
        >
          <Dropdown.Item>
            <FontAwesomeIcon icon="map-marker" /> {m?.routePlanner.point.pick}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={() => {
              dispatch(routePlannerSetFromCurrentPosition('start'));
            }}
          >
            <FontAwesomeIcon icon="bullseye" /> {m?.routePlanner.point.current}
          </Dropdown.Item>
          <Dropdown.Item
            onSelect={() => {
              setFromHomeLocation('start');
            }}
          >
            <FontAwesomeIcon icon="home" /> {m?.routePlanner.point.home}
          </Dropdown.Item>
        </DropdownButton>
        {mode !== 'roundtrip' && (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(routePlannerSwapEnds());
              }}
              disabled={!canSwap}
              title={m?.routePlanner.swap}
            >
              ⇆
            </Button>
            <DropdownButton
              variant="secondary"
              as={ButtonGroup}
              title={
                <span>
                  <FontAwesomeIcon icon="stop" style={{ color: '#d9534f' }} />
                  <span className="d-none d-md-inline">
                    {' '}
                    {m?.routePlanner.finish}
                  </span>
                </span>
              }
              id="set-finish-dropdown"
              onClick={() => {
                dispatch(routePlannerSetPickMode('finish'));
              }}
              // TODO active={pickPointMode === 'finish'}
            >
              <Dropdown.Item>
                <FontAwesomeIcon icon="map-marker" />{' '}
                {m?.routePlanner.point.pick}
              </Dropdown.Item>
              <Dropdown.Item
                onSelect={() => {
                  dispatch(routePlannerSetFromCurrentPosition('finish'));
                }}
              >
                <FontAwesomeIcon icon="bullseye" />{' '}
                {m?.routePlanner.point.current}
              </Dropdown.Item>
              <Dropdown.Item
                onSelect={() => {
                  setFromHomeLocation('finish');
                }}
              >
                <FontAwesomeIcon icon="home" /> {m?.routePlanner.point.home}
              </Dropdown.Item>
            </DropdownButton>
          </>
        )}
      </ButtonGroup>{' '}
      <DropdownButton
        variant="secondary"
        as={ButtonGroup}
        id="transport-type"
        onSelect={(transportType: unknown) => {
          dispatch(
            routePlannerSetTransportType(transportType as TransportType),
          );
        }}
        title={
          activeTransportType ? (
            <>
              <FontAwesomeIcon icon={activeTransportType.icon} />
              {['car', 'bikesharing'].includes(activeTransportType.type) && (
                <FontAwesomeIcon icon="money" />
              )}
              <span className="d-none d-md-inline">
                {' '}
                {m?.routePlanner.transportType[
                  activeTransportType.type
                ].replace(/\s*,.*/, '')}
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
            <Dropdown.Item
              eventKey={type}
              key={type}
              title={m?.routePlanner.transportType[type]}
              active={transportType === type}
            >
              <FontAwesomeIcon icon={icon} />
              {['car', 'bikesharing'].includes(type) && (
                <FontAwesomeIcon icon="money" />
              )}{' '}
              {m?.routePlanner.transportType[type]}
              {development && (
                <>
                  {' '}
                  <FontAwesomeIcon
                    icon="flask"
                    title={m?.routePlanner.development}
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
            </Dropdown.Item>
          ))}
      </DropdownButton>{' '}
      <DropdownButton
        variant="secondary"
        as={ButtonGroup}
        id="mode"
        onSelect={(mode: unknown) => {
          dispatch(routePlannerSetMode(mode as RoutingMode));
        }}
        title={m?.routePlanner.mode[mode]}
        disabled={transportType === 'imhd' || transportType === 'bikesharing'}
      >
        {(['route', 'trip', 'roundtrip'] as const).map((mode1) => (
          <Dropdown.Item
            eventKey={mode1}
            key={mode1}
            title={m?.routePlanner.mode[mode1]}
            active={mode === mode1}
          >
            {m?.routePlanner.mode[mode1]}
          </Dropdown.Item>
        ))}
      </DropdownButton>
      {alternatives.length > 1 && (
        <>
          {' '}
          <DropdownButton
            variant="secondary"
            id="transport-type"
            onSelect={(index: unknown) => {
              if (typeof index === 'number') {
                dispatch(
                  routePlannerSetActiveAlternativeIndex(index as number),
                );
              }
            }}
            title={
              transportType === 'imhd' &&
              activeAlternative.extra &&
              activeAlternative.extra.price
                ? imhdSummary(m, language, activeAlternative.extra)
                : m?.routePlanner.summary({
                    distance: nf.format(activeAlternative.distance / 1000),
                    h: Math.floor(
                      Math.round(activeAlternative.duration / 60) / 60,
                    ),
                    m: Math.round(activeAlternative.duration / 60) % 60,
                  })
            }
          >
            {alternatives.map(({ duration, distance, extra }, i) => (
              <Dropdown.Item
                eventKey={String(i)}
                key={i}
                active={i === activeAlternativeIndex}
              >
                {transportType === 'imhd' && extra?.price
                  ? imhdSummary(m, language, extra)
                  : m?.routePlanner.summary({
                      distance: nf.format(distance / 1000),
                      h: Math.floor(Math.round(duration / 60) / 60),
                      m: Math.round(duration / 60) % 60,
                    })}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </>
      )}
      {/* ' '}
      <Button
        onClick={() => {
          dispatch(routePlannerToggleItineraryVisibility());
        }}
        active={itineraryIsVisible}
        title="Itinerár"
      >
        <FontAwesomeIcon icon="list-ol" /><span className="d-none d-md-inline"> Itinerár</span>
      </Button>
      */}{' '}
      <Button
        variant="secondary"
        onClick={() => {
          dispatch(routePlannerToggleElevationChart());
        }}
        active={elevationProfileIsVisible}
        disabled={!routeFound}
        title={m?.general.elevationProfile}
      >
        <FontAwesomeIcon icon="bar-chart" />
        <span className="d-none d-md-inline">
          {' '}
          {m?.general.elevationProfile}
        </span>
      </Button>{' '}
      <Button
        variant="secondary"
        onClick={handleConvertToDrawing}
        disabled={!routeFound}
        title={m?.general.convertToDrawing}
      >
        <FontAwesomeIcon icon="pencil" />
        <span className="d-none d-md-inline">
          {' '}
          {m?.general.convertToDrawing}
        </span>
      </Button>{' '}
      <FormCheck
        type="checkbox"
        inline
        onChange={() => {
          dispatch(routePlannerToggleMilestones(undefined));
        }}
        checked={milestones}
        label={m?.routePlanner.milestones}
      />
    </>
  );
}

function imhdSummary(
  m: Messages | undefined,
  language: string,
  extra: RouteAlternativeExtra,
) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const { price, arrival, numbers } = extra;

  return m?.routePlanner.imhd.total.short({
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
