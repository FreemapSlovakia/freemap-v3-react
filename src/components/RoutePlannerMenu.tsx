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
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
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
import {
  FaBullseye,
  FaChartArea,
  FaCrosshairs,
  FaDiceThree,
  FaEllipsisV,
  FaHome,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaPencilAlt,
  FaPlay,
  FaRegCheckSquare,
  FaRegSquare,
  FaStop,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import { useDebouncedCallback } from 'use-debounce';
import { DeleteButton } from './DeleteButton';
import { ToolMenu } from './ToolMenu';
import InputGroupText from 'react-bootstrap/esm/InputGroupText';
import { fixedPopperConfig } from 'fm3/fixedPopperConfig';

export default RoutePlannerMenu;

function useParam(
  initValue: number,
  fallbackValue: number,
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

      setValue(value);

      debounceCallback(value);
    },
    [debounceCallback],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      debounceCallback.flush();
    },
    [debounceCallback],
  );

  return [value, handleChange, handleSubmit, setValue] as const;
}

function TripSettings() {
  const dispatch = useDispatch();

  const [seed, handleSeedChange, handleSeedSubmit, setSeed] = useParam(
    useAppSelector((state) => state.routePlanner.roundtripParams.seed),
    0,
    useCallback(
      (seed: number) => {
        dispatch(routePlannerSetRoundtripParams({ seed }));
      },
      [dispatch],
    ),
  );

  const [distance, handleDistanceChange, handleDistanceSubmit] = useParam(
    useAppSelector(
      (state) =>
        Math.round(state.routePlanner.roundtripParams.distance / 100) / 10,
    ),
    5,
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

            <InputGroupText>㎞</InputGroupText>
          </InputGroup>
        </FormGroup>

        <FormGroup as="form" onSubmit={handleSeedSubmit}>
          <FormLabel className="mt-2">{ghParams?.seed}</FormLabel>

          <InputGroup>
            <FormControl
              type="number"
              value={seed}
              onChange={handleSeedChange}
            />

            <Button
              onClick={() => {
                const seed = Math.floor(Math.random() * 100000);

                setSeed(String(seed));

                return dispatch(
                  routePlannerSetRoundtripParams({
                    seed,
                  }),
                );
              }}
            >
              <FaDiceThree />
            </Button>
          </InputGroup>
        </FormGroup>
      </fieldset>
    </>
  );
}

function IsochroneSettings() {
  const dispatch = useDispatch();

  const [buckets, handleBucketsChange, handleBucketsSubmit] = useParam(
    useAppSelector((state) => state.routePlanner.isochroneParams.buckets),
    0,
    useCallback(
      (buckets: number) => {
        dispatch(routePlannerSetIsochroneParams({ buckets }));
      },
      [dispatch],
    ),
  );

  const [distanceLimit, handleDistanceLimitChange, handleDistanceLimitSubmit] =
    useParam(
      useAppSelector(
        (state) =>
          Math.round(state.routePlanner.isochroneParams.distanceLimit / 100) /
          10,
      ),
      0,
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
    useAppSelector((state) =>
      Math.round(state.routePlanner.isochroneParams.timeLimit / 60),
    ),
    10,
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

            <InputGroupText>{m?.general.minutes}</InputGroupText>
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

            <InputGroupText>㎞</InputGroupText>
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

  const milestones = useAppSelector((state) => state.routePlanner.milestones);

  const homeLocation = useAppSelector((state) => state.main.homeLocation);

  const activeTransportType = useAppSelector(
    (state) => state.routePlanner.transportType,
  );

  const activeMode = useAppSelector((state) => state.routePlanner.mode);

  const activeWeighting = useAppSelector(
    (state) => state.routePlanner.weighting,
  );

  const pickPointMode = useAppSelector((state) => state.routePlanner.pickMode);

  const routeFound = useAppSelector(
    (state) => state.routePlanner.alternatives.length > 0,
  );

  const isochronesFound = useAppSelector(
    (state) => !!state.routePlanner.isochrones,
  );

  const elevationProfileIsVisible = useAppSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const canSwap = useAppSelector(
    (state) => !!(state.routePlanner.start && state.routePlanner.finish),
  );

  const canDelete = useAppSelector(
    (state) =>
      !!(
        state.routePlanner.start ||
        state.routePlanner.finish ||
        state.routePlanner.midpoints.length > 0
      ),
  );

  const handleMoreSelect = (eventKey: string | null) => {
    switch (eventKey) {
      case 'toggle-elevation-chart':
        dispatch(routePlannerToggleElevationChart());

        break;

      case 'convert-to-drawing':
        const tolerance = window.prompt(m?.general.simplifyPrompt, '50');

        if (tolerance !== null) {
          dispatch(
            convertToDrawing({
              type: 'planned-route',
              tolerance: Number(tolerance || '0') / 100000,
            }),
          );
        }

        break;

      case 'toggle-milestones-km':
        dispatch(routePlannerToggleMilestones({ type: 'abs', toggle: true }));

        break;

      case 'toggle-milestones-%':
        dispatch(routePlannerToggleMilestones({ type: 'rel', toggle: true }));

        break;
    }
  };

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

  const sc = useScrollClasses('vertical');

  const [routePlannerDropdownOpen, setRoutePlannerDropdownOpen] =
    useState(false);

  return (
    <ToolMenu>
      <Dropdown
        className="ms-1"
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

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          <div className="dropdown-long" ref={sc}>
            <div />

            {(['gh', 'osrm'] as const).map((api) => (
              <Fragment key={api}>
                <Dropdown.Header>
                  {api === 'osrm' ? 'OSRM' : 'GraphHopper '}
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
                    </Dropdown.Item>
                  ))}
              </Fragment>
            ))}
          </div>
        </Dropdown.Menu>
      </Dropdown>

      {activeTTDef?.api === 'gh' && (
        <Dropdown
          className="ms-1"
          onSelect={(weighting) => {
            dispatch(routePlannerSetWeighting(weighting as Weighting));
          }}
        >
          <Dropdown.Toggle id="mode" variant="secondary">
            {m?.routePlanner.weighting[activeWeighting] ?? '…'}
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            {(
              ['fastest', 'short_fastest', 'shortest'] satisfies Weighting[]
            ).map((weighting) => (
              <Dropdown.Item
                eventKey={weighting}
                key={weighting}
                title={m?.routePlanner.weighting[weighting] ?? '…'}
                active={activeWeighting === weighting}
              >
                {m?.routePlanner.weighting[weighting] ?? '…'}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      )}

      {activeTTDef?.api === 'gh' && (
        <Dropdown
          className="ms-1"
          onSelect={(mode) => {
            dispatch(routePlannerSetMode(mode as RoutingMode));
          }}
          show={routePlannerDropdownOpen}
          onToggle={(nextShow, { source }) => {
            if (source !== 'select') {
              setRoutePlannerDropdownOpen(nextShow);
            }
          }}
        >
          <Dropdown.Toggle id="mode" variant="secondary">
            {m?.routePlanner.mode[
              activeMode === 'roundtrip' ? 'routndtrip-gh' : activeMode
            ] ?? '…'}
          </Dropdown.Toggle>

          <Dropdown.Menu
            popperConfig={fixedPopperConfig}
            as={GraphopperModeMenu}
          >
            {(['route', 'roundtrip', 'isochrone'] satisfies RoutingMode[]).map(
              (mode) => (
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
              ),
            )}
          </Dropdown.Menu>
        </Dropdown>
      )}

      {activeTTDef?.api === 'osrm' && (
        <Dropdown
          className="ms-1"
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

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            {(['route', 'trip', 'roundtrip'] satisfies RoutingMode[]).map(
              (mode) => (
                <Dropdown.Item
                  eventKey={mode}
                  key={mode}
                  title={m?.routePlanner.mode[mode] ?? '…'}
                  active={activeMode === mode}
                >
                  {m?.routePlanner.mode[mode] ?? '…'}
                </Dropdown.Item>
              ),
            )}
          </Dropdown.Menu>
        </Dropdown>
      )}

      <ButtonGroup className="ms-1">
        <Dropdown
          className="btn-group"
          id="set-start-dropdown"
          onSelect={(eventKey, e) => {
            if (eventKey === 'pick') {
              dispatch(routePlannerSetPickMode('start'));
            } else if (eventKey === 'current') {
              dispatch(routePlannerSetFromCurrentPosition('start'));
            } else if (eventKey === 'home') {
              setFromHomeLocation('start', e);
            }
          }}
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

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            <Dropdown.Item eventKey="pick">
              <FaMapMarkerAlt />
              &nbsp;{m?.routePlanner.point.pick ?? '…'}
            </Dropdown.Item>

            <Dropdown.Item eventKey="current">
              <FaBullseye />
              &nbsp;{m?.routePlanner.point.current ?? '…'}
            </Dropdown.Item>

            <Dropdown.Item
              className="d-flex align-items-center justify-content-between"
              eventKey="home"
            >
              <FaHome />
              &nbsp;{m?.routePlanner.point.home ?? '…'}
              <Button
                size="sm"
                variant="secondary"
                className="my-n1 ms-2"
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
              variant="secondary"
              onClick={() => dispatch(routePlannerSwapEnds())}
              disabled={!canSwap}
              title={m?.routePlanner.swap ?? '…'}
            >
              ⇆
            </Button>

            <Dropdown
              id="set-finish-dropdown"
              className="btn-group"
              onSelect={(eventKey, e) => {
                if (eventKey === 'pick') {
                  dispatch(routePlannerSetPickMode('finish'));
                } else if (eventKey === 'current') {
                  dispatch(routePlannerSetFromCurrentPosition('finish'));
                } else if (eventKey === 'home') {
                  setFromHomeLocation('finish', e);
                }
              }}
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

              <Dropdown.Menu popperConfig={fixedPopperConfig}>
                <Dropdown.Item eventKey="pick">
                  <FaMapMarkerAlt />
                  &nbsp;
                  {m?.routePlanner.point.pick ?? '…'}
                </Dropdown.Item>

                <Dropdown.Item eventKey="current">
                  <FaBullseye />
                  &nbsp;
                  {m?.routePlanner.point.current ?? '…'}
                </Dropdown.Item>

                <Dropdown.Item
                  className="d-flex align-items-center justify-content-between"
                  eventKey="home"
                >
                  <FaHome />
                  &nbsp;{m?.routePlanner.point.home ?? '…'}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="my-n1 ms-2"
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
        <Dropdown className="ms-1" id="more" onSelect={handleMoreSelect}>
          <Dropdown.Toggle variant="secondary">
            <FaEllipsisV />
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            <Dropdown.Item
              active={elevationProfileIsVisible}
              eventKey="toggle-elevation-chart"
            >
              <FaChartArea />
              &nbsp;{m?.general.elevationProfile ?? '…'}
            </Dropdown.Item>

            <Dropdown.Item eventKey="convert-to-drawing">
              <FaPencilAlt />
              &nbsp;{m?.general.convertToDrawing ?? '…'}
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item eventKey="toggle-milestones-km">
              {milestones === 'abs' ? <FaRegCheckSquare /> : <FaRegSquare />}
              &nbsp;{m?.routePlanner.milestones ?? '…'} (km)
            </Dropdown.Item>

            <Dropdown.Item eventKey="toggle-milestones-%">
              {milestones === 'rel' ? <FaRegCheckSquare /> : <FaRegSquare />}
              &nbsp;{m?.routePlanner.milestones ?? '…'} (%)
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}

      {(routeFound || isochronesFound || canDelete) && <DeleteButton />}
    </ToolMenu>
  );
}
