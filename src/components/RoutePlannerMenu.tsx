import {
  convertToDrawing,
  setSelectingHomeLocation,
} from 'fm3/actions/mainActions';
import {
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
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

const GraphopperModeMenu = forwardRef<HTMLDivElement, any>(
  ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
    const dispatch = useDispatch();

    const [seed, setSeed] = useState(
      String(useSelector((state) => state.routePlanner.roundtripParams.seed)),
    );

    const seedCallback = useDebouncedCallback((seed: string) => {
      dispatch(routePlannerSetRoundtripParams({ seed: Number(seed) || 0 }));
    }, 1000);

    const handleSeedChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;

      setSeed(value);

      seedCallback(value);

      if (Math.abs(Number(seed) - Number(value)) === 1) {
        seedCallback.flush();
      }
    };

    const handleSeedSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      seedCallback.flush();
    };

    const [distance, setDistance] = useState(
      useSelector(
        (state) => state.routePlanner.roundtripParams.distance / 1000,
      ).toFixed(1),
    );

    const distanceCallback = useDebouncedCallback((distance: string) => {
      dispatch(
        routePlannerSetRoundtripParams({
          distance: Number(distance) * 1000 || 5000,
        }),
      );
    }, 1000);

    const handleDistanceChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;

        setDistance(value);

        distanceCallback(value);
      },
      [distanceCallback],
    );

    const handleDistanceSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      distanceCallback.flush();
    };

    const m = useMessages();

    const ghParams = m?.routePlanner.ghParams;

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

                        <FormControl
                          type="number"
                          value={seed}
                          onChange={handleSeedChange}
                        />
                      </FormGroup>
                    </fieldset>
                  </>
                ) : (item as any).props.eventKey === 'isochrone' ? (
                  <>
                    <hr />

                    <fieldset className="mx-4 mb-4 w-auto">
                      <legend>{ghParams?.isochroneParameters}</legend>

                      <FormGroup>
                        <FormLabel>{ghParams?.buckets}</FormLabel>

                        <FormControl type="number" />
                      </FormGroup>

                      <FormGroup>
                        <FormLabel className="mt-2">
                          {ghParams?.timeLimit}
                        </FormLabel>

                        <FormControl type="number" />
                      </FormGroup>

                      <FormGroup>
                        <FormLabel className="mt-2">
                          {ghParams?.distanceLimit}
                        </FormLabel>

                        <FormControl type="number" />
                      </FormGroup>
                    </fieldset>
                  </>
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
    (state) => !!state.routePlanner.alternatives.length,
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
            {(['route', 'roundtrip' /*, 'isochrone'*/] as const).map((mode) => (
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

          {canDelete && <DeleteButton />}
        </>
      )}
    </ToolMenu>
  );
}
