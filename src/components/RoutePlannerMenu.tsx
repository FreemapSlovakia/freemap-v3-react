import {
  convertToDrawing,
  setSelectingHomeLocation,
} from 'fm3/actions/mainActions';
import {
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
  routePlannerSetIsochroneParams,
  routePlannerSetMode,
  routePlannerSetPickMode,
  routePlannerSetRoundtripParams,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSetWeighting,
  routePlannerSwapEnds,
  // routePlannerToggleItineraryVisibility,
  routePlannerToggleElevationChart,
  routePlannerToggleMilestones,
  RoutingMode,
  Weighting,
} from 'fm3/actions/routePlannerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useMessages } from 'fm3/l10nInjector';
import { TransportType, transportTypeDefs } from 'fm3/transportTypeDefs';
import {
  ChangeEvent,
  Children,
  FormEvent,
  forwardRef,
  Fragment,
  ReactElement,
  SyntheticEvent,
  useCallback,
  useState,
} from 'react';
import { FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import FormCheck from 'react-bootstrap/FormCheck';
import {
  FaBullseye,
  FaChartArea,
  FaCrosshairs,
  FaFlask,
  FaHome,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaPencilAlt,
  FaPlay,
  FaStop,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';
import { useDebouncedCallback } from 'use-debounce';
import { DeleteButton } from './DeleteButton';
import { ToolMenu } from './ToolMenu';

export default RoutePlannerMenu;

function useParam(
  initValue: number,
  fallbackValue: number,
  flushOnIncrement = false,
  commitCallback: (value: number) => void,
) {
  const [value, setValue] = useState(String(initValue));

  const debounceCallback = useDebouncedCallback(
    useCallback(
      (value: string) => {
        commitCallback(Number(value) || fallbackValue);
      },
      [commitCallback, fallbackValue],
    ),
    1000,
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;

      if (flushOnIncrement) {
        setValue((old) => {
          if (Math.abs(Number(old) - Number(value)) === 1) {
            debounceCallback.flush();
          }

          return value;
        });
      } else {
        setValue(value);
      }

      debounceCallback(value);
    },
    [debounceCallback, flushOnIncrement],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      debounceCallback.flush();
    },
    [debounceCallback],
  );

  return [value, handleChange, handleSubmit] as const;
}

function TripSettings() {
  const dispatch = useDispatch();

  const [seed, handleSeedChange, handleSeedSubmit] = useParam(
    useSelector((state) => state.routePlanner.roundtripParams.seed),
    0,
    true,
    useCallback(
      (seed: number) => {
        dispatch(routePlannerSetRoundtripParams({ seed }));
      },
      [dispatch],
    ),
  );

  const [distance, handleDistanceChange, handleDistanceSubmit] = useParam(
    useSelector(
      (state) =>
        Math.round(state.routePlanner.roundtripParams.distance / 100) / 10,
    ),
    5,
    false,
    useCallback(
      (value: number) => {
        dispatch(routePlannerSetRoundtripParams({ distance: value * 1000 }));
      },
      [dispatch],
    ),
  );

  const m = useMessages();

  const ghParams = m?.routePlanner.ghParams;

  return (
    <>
      <hr />

      <fieldset className="mx-4 mb-4 w-auto">
        <legend>{ghParams?.tripParameters}</legend>

        <FormGroup as="form" onSubmit={handleDistanceSubmit}>
          <FormLabel>{ghParams?.distance}</FormLabel>

          <InputGroup>
            <FormControl
              type="number"
              value={distance}
              onChange={handleDistanceChange}
              min={0.1}
              step="any"
              max={1000}
            />

            <InputGroup.Append>
              <InputGroup.Text>㎞</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </FormGroup>

        <FormGroup as="form" onSubmit={handleSeedSubmit}>
          <FormLabel className="mt-2">{ghParams?.seed}</FormLabel>

          <FormControl type="number" value={seed} onChange={handleSeedChange} />
        </FormGroup>
      </fieldset>
    </>
  );
}

function IsochroneSettings() {
  const dispatch = useDispatch();

  const [buckets, handleBucketsChange, handleBucketsSubmit] = useParam(
    useSelector((state) => state.routePlanner.isochroneParams.buckets),
    0,
    true,
    useCallback(
      (buckets: number) => {
        dispatch(routePlannerSetIsochroneParams({ buckets }));
      },
      [dispatch],
    ),
  );

  const [distanceLimit, handleDistanceLimitChange, handleDistanceLimitSubmit] =
    useParam(
      useSelector(
        (state) =>
          Math.round(state.routePlanner.isochroneParams.distanceLimit / 100) /
          10,
      ),
      0,
      false,
      useCallback(
        (value: number) => {
          dispatch(
            routePlannerSetIsochroneParams({ distanceLimit: value * 1000 }),
          );
        },
        [dispatch],
      ),
    );

  const [timeLimit, handleTimeLimitChange, handleTimeLimitSubmit] = useParam(
    useSelector((state) =>
      Math.round(state.routePlanner.isochroneParams.timeLimit / 60),
    ),
    10,
    false,
    useCallback(
      (value: number) => {
        dispatch(routePlannerSetIsochroneParams({ timeLimit: value * 60 }));
      },
      [dispatch],
    ),
  );

  const m = useMessages();

  const ghParams = m?.routePlanner.ghParams;

  return (
    <>
      <hr />

      <fieldset className="mx-4 mb-4 w-auto">
        <legend>{ghParams?.isochroneParameters}</legend>

        <FormGroup as="form" onSubmit={handleTimeLimitSubmit}>
          <FormLabel>{ghParams?.timeLimit}</FormLabel>

          <InputGroup>
            <FormControl
              type="number"
              value={timeLimit}
              onChange={handleTimeLimitChange}
              min={0.1}
              step="any"
              max={12 * 60}
              disabled={distanceLimit !== '0'}
            />

            <InputGroup.Append>
              <InputGroup.Text>{m?.general.minutes}</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </FormGroup>

        <FormGroup as="form" onSubmit={handleDistanceLimitSubmit}>
          <FormLabel className="mt-2">{ghParams?.distanceLimit}</FormLabel>

          <InputGroup>
            <FormControl
              type="number"
              value={distanceLimit === '0' ? '' : distanceLimit}
              onChange={handleDistanceLimitChange}
              min={0}
              step="any"
              max={1000}
            />

            <InputGroup.Append>
              <InputGroup.Text>㎞</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
        </FormGroup>

        <FormGroup as="form" onSubmit={handleBucketsSubmit}>
          <FormLabel className="mt-2">{ghParams?.buckets}</FormLabel>

          <FormControl
            type="number"
            value={buckets}
            onChange={handleBucketsChange}
            min={1}
            step={1}
            max={5}
          />
        </FormGroup>
      </fieldset>
    </>
  );
}

const GraphopperModeMenu = forwardRef<HTMLDivElement, any>(
  ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        {children}

        {Children.toArray(children)
          .filter((item) => (item as any).props.active)
          .map((item) => {
            return (
              <Fragment key={'m-' + (item as any).props.eventKey}>
                {(item as any).props.eventKey === 'roundtrip' ? (
                  <TripSettings />
                ) : (item as any).props.eventKey === 'isochrone' ? (
                  <IsochroneSettings />
                ) : null}
              </Fragment>
            );
          })}
      </div>
    );
  },
);

GraphopperModeMenu.displayName = 'GraphopperModeMenu';

export function RoutePlannerMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const milestones = useSelector((state) => state.routePlanner.milestones);

  const homeLocation = useSelector((state) => state.main.homeLocation);

  const activeTransportType = useSelector(
    (state) => state.routePlanner.transportType,
  );

  const activeMode = useSelector((state) => state.routePlanner.mode);

  const activeWeighting = useSelector((state) => state.routePlanner.weighting);

  const pickPointMode = useSelector((state) => state.routePlanner.pickMode);

  const routeFound = useSelector(
    (state) => state.routePlanner.alternatives.length > 0,
  );

  const isochronesFound = useSelector(
    (state) => !!state.routePlanner.isochrones,
  );

  const elevationProfileIsVisible = useSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const canSwap = useSelector(
    (state) => !!(state.routePlanner.start && state.routePlanner.finish),
  );

  const canDelete = useSelector(
    (state) =>
      !!(
        state.routePlanner.start ||
        state.routePlanner.finish ||
        state.routePlanner.midpoints.length > 0
      ),
  );

  function setFromHomeLocation(
    pointType: string | null,
    e: SyntheticEvent<unknown>,
  ) {
    if (e.target instanceof HTMLButtonElement) {
      dispatch(setSelectingHomeLocation(true));

      return;
    }

    if (!homeLocation) {
      dispatch(
        toastsAdd({
          id: 'routePlanner.noHomeAlert',
          messageKey: 'routePlanner.noHomeAlert.msg',
          style: 'warning',
          actions: [
            {
              nameKey: 'routePlanner.noHomeAlert.setHome',
              action: setSelectingHomeLocation(true),
            },
            { nameKey: 'general.close', style: 'dark' },
          ],
        }),
      );
    } else if (pointType === 'start') {
      dispatch(routePlannerSetStart({ start: homeLocation }));
    } else if (pointType === 'finish') {
      dispatch(routePlannerSetFinish({ finish: homeLocation }));
    }
  }

  const activeTTDef = transportTypeDefs[activeTransportType];

  // const stopPropagation = useCallback((e: MouseEvent) => {
  //   e.stopPropagation();
  // }, []);

  const handleConvertToDrawing = useCallback(() => {
    const tolerance = window.prompt(m?.general.simplifyPrompt, '50');

    if (tolerance !== null) {
      dispatch(
        convertToDrawing({
          type: 'planned-route',
          tolerance: Number(tolerance || '0') / 100000,
        }),
      );
    }
  }, [dispatch, m]);

  const sc = useScrollClasses('vertical');

  return (
    <ToolMenu>
      <Dropdown
        className="ml-1"
        id="transport-type"
        onSelect={(transportType) => {
          if (is<TransportType>(transportType)) {
            dispatch(routePlannerSetTransportType(transportType));
          }
        }}
      >
        <Dropdown.Toggle variant="secondary">
          {activeTTDef ? (
            <>
              {activeTTDef.icon}{' '}
              {['car', 'car-toll', 'bikesharing'].includes(
                activeTransportType,
              ) && <FaMoneyBill />}
              <span className="d-none d-md-inline">
                {' '}
                {m?.routePlanner.transportType[activeTTDef.key].replace(
                  /\s*,.*/,
                  '',
                ) ?? '…'}{' '}
                <small className="text-dark">
                  {activeTTDef.api === 'osrm' ? 'OSRM' : 'GraphHopper'}
                </small>
              </span>
            </>
          ) : (
            ''
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
          <div className="dropdown-long" ref={sc}>
            <div />

            {(['osrm', 'gh'] as const).map((api) => (
              <Fragment key={api}>
                <Dropdown.Header>
                  {api === 'osrm' ? (
                    'OSRM'
                  ) : (
                    <>
                      {'GraphHopper '}
                      <FaFlask
                        title={m?.general.experimentalFunction}
                        className="text-warning"
                      />
                    </>
                  )}
                </Dropdown.Header>

                {Object.entries(transportTypeDefs)
                  .filter(([, def]) => !def.hidden && def.api === api)
                  .map(([type, { icon, key }]) => (
                    <Dropdown.Item
                      as="button"
                      eventKey={type}
                      key={type}
                      title={m?.routePlanner.transportType[key] ?? '…'}
                      active={activeTransportType === type}
                    >
                      {icon}{' '}
                      {['car', 'car-toll', 'bikesharing'].includes(type) && (
                        <FaMoneyBill />
                      )}{' '}
                      {m?.routePlanner.transportType[key] ?? '…'}
                      {/* {type === 'bikesharing' && (
                    <>
                      {' '}
                      <a
                        href="http://routing.epsilon.sk/bikesharing.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={stopPropagation}
                      >
                        <FaInfoCircle />
                      </a>
                    </>
                  )} */}
                    </Dropdown.Item>
                  ))}
              </Fragment>
            ))}
          </div>
        </Dropdown.Menu>
      </Dropdown>

      {activeTTDef?.api === 'gh' && (
        <Dropdown
          className="ml-1"
          onSelect={(weighting) => {
            dispatch(routePlannerSetWeighting(weighting as Weighting));
          }}
        >
          <Dropdown.Toggle id="mode" variant="secondary">
            {m?.routePlanner.weighting[activeWeighting] ?? '…'}
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
            {(['fastest', 'short_fastest', 'shortest'] as const).map(
              (weighting) => (
                <Dropdown.Item
                  eventKey={weighting}
                  key={weighting}
                  title={m?.routePlanner.weighting[weighting] ?? '…'}
                  active={activeWeighting === weighting}
                >
                  {m?.routePlanner.weighting[weighting] ?? '…'}
                </Dropdown.Item>
              ),
            )}
          </Dropdown.Menu>
        </Dropdown>
      )}

      {activeTTDef?.api === 'gh' && (
        <Dropdown
          className="ml-1"
          onSelect={(mode) => {
            dispatch(routePlannerSetMode(mode as RoutingMode));
          }}
        >
          <Dropdown.Toggle id="mode" variant="secondary">
            {m?.routePlanner.mode[
              activeMode === 'roundtrip' ? 'routndtrip-gh' : activeMode
            ] ?? '…'}
          </Dropdown.Toggle>

          <Dropdown.Menu
            popperConfig={{ strategy: 'fixed' }}
            as={GraphopperModeMenu}
          >
            {(['route', 'roundtrip', 'isochrone'] as const).map((mode) => (
              <Dropdown.Item
                eventKey={mode}
                key={mode}
                title={m?.routePlanner.mode[mode] ?? '…'}
                active={activeMode === mode}
              >
                {m?.routePlanner.mode[
                  mode === 'roundtrip' ? 'routndtrip-gh' : mode
                ] ?? '…'}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}

      {activeTTDef?.api === 'osrm' && (
        <Dropdown
          className="ml-1"
          onSelect={(mode) => {
            dispatch(routePlannerSetMode(mode as RoutingMode));
          }}
        >
          <Dropdown.Toggle
            id="mode"
            variant="secondary"
            // disabled={
            //   transportType === 'imhd' || transportType === 'bikesharing'
            // }
          >
            {m?.routePlanner.mode[activeMode] ?? '…'}
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
            {(['route', 'trip', 'roundtrip'] as const).map((mode) => (
              <Dropdown.Item
                eventKey={mode}
                key={mode}
                title={m?.routePlanner.mode[mode] ?? '…'}
                active={activeMode === mode}
              >
                {m?.routePlanner.mode[mode] ?? '…'}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}

      <ButtonGroup className="ml-1">
        <Dropdown
          as={ButtonGroup}
          id="set-start-dropdown"
          onSelect={() => dispatch(routePlannerSetPickMode('start'))}
        >
          <Dropdown.Toggle
            variant="secondary"
            active={pickPointMode === 'start'}
          >
            <FaPlay color="#409a40" />

            <span className="d-none d-md-inline">
              {' '}
              {m?.routePlanner.start ?? '…'}
            </span>
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
            <Dropdown.Item>
              <FaMapMarkerAlt /> {m?.routePlanner.point.pick ?? '…'}
            </Dropdown.Item>

            <Dropdown.Item
              onSelect={() => {
                dispatch(routePlannerSetFromCurrentPosition('start'));
              }}
            >
              <FaBullseye /> {m?.routePlanner.point.current ?? '…'}
            </Dropdown.Item>

            <Dropdown.Item
              className="d-flex align-items-center justify-content-between"
              eventKey="start"
              onSelect={setFromHomeLocation}
            >
              <div>
                <FaHome /> {m?.routePlanner.point.home ?? '…'}
              </div>

              <Button
                size="sm"
                variant="secondary"
                className="m-n1"
                title={m?.settings.map.homeLocation.select}
              >
                <FaCrosshairs className="pe-none" />
              </Button>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        {activeMode !== 'roundtrip' && activeMode !== 'isochrone' && (
          <>
            <Button
              as={ButtonGroup}
              variant="secondary"
              onClick={() => dispatch(routePlannerSwapEnds())}
              disabled={!canSwap}
              title={m?.routePlanner.swap ?? '…'}
            >
              ⇆
            </Button>

            <Dropdown
              as={ButtonGroup}
              variant="secondary"
              id="set-finish-dropdown"
              onSelect={() => dispatch(routePlannerSetPickMode('finish'))}
            >
              <Dropdown.Toggle
                variant="secondary"
                active={pickPointMode === 'finish'}
              >
                <FaStop color="#d9534f" />

                <span className="d-none d-md-inline">
                  {' '}
                  {m?.routePlanner.finish ?? '…'}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu popperConfig={{ strategy: 'fixed' }}>
                <Dropdown.Item>
                  <FaMapMarkerAlt />
                  {m?.routePlanner.point.pick ?? '…'}
                </Dropdown.Item>

                <Dropdown.Item
                  onSelect={() =>
                    dispatch(routePlannerSetFromCurrentPosition('finish'))
                  }
                >
                  <FaBullseye />
                  {m?.routePlanner.point.current ?? '…'}
                </Dropdown.Item>

                <Dropdown.Item
                  className="d-flex align-items-center justify-content-between"
                  eventKey="finish"
                  onSelect={setFromHomeLocation}
                >
                  <div>
                    <FaHome /> {m?.routePlanner.point.home ?? '…'}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="m-n1"
                    title={m?.settings.map.homeLocation.select}
                  >
                    <FaCrosshairs className="pe-none" />
                  </Button>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        )}
      </ButtonGroup>

      {routeFound && (
        <>
          <Button
            className="ml-1"
            variant="secondary"
            onClick={() => dispatch(routePlannerToggleElevationChart())}
            active={elevationProfileIsVisible}
            title={m?.general.elevationProfile ?? '…'}
          >
            <FaChartArea />

            <span className="d-none d-md-inline">
              {' '}
              {m?.general.elevationProfile ?? '…'}
            </span>
          </Button>

          <Button
            className="ml-1"
            variant="secondary"
            onClick={handleConvertToDrawing}
            title={m?.general.convertToDrawing ?? '…'}
          >
            <FaPencilAlt />

            <span className="d-none d-md-inline">
              {' '}
              {m?.general.convertToDrawing ?? '…'}
            </span>
          </Button>

          <FormCheck
            id="chk-milestones"
            className="ml-1"
            type="checkbox"
            inline
            onChange={() => dispatch(routePlannerToggleMilestones(undefined))}
            checked={milestones}
            label={m?.routePlanner.milestones ?? '…'}
          />
        </>
      )}

      {(routeFound || isochronesFound || canDelete) && <DeleteButton />}
    </ToolMenu>
  );
}
