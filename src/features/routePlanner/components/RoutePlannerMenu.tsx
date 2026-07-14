import {
  convertToDrawing,
  setActiveModal,
  setSelectingHomeLocation,
  setTool,
} from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ColorizeLegend } from '@shared/colorizers/components/ColorizeLegend.js';
import {
  LEGEND_ITEM,
  legendToggleOption,
} from '@shared/colorizers/components/legendToggleOption.js';
import {
  ColorizingModeSchema,
  colorizers,
  colorizingModes,
} from '@shared/colorizers/index.js';
import { useColorizerMessages } from '@shared/colorizers/translations/useColorizerMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import type { Feature, LineString } from 'geojson';
import {
  type ChangeEvent,
  Children,
  type CSSProperties,
  Fragment,
  forwardRef,
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { BiShapePolygon } from 'react-icons/bi';
import {
  FaBullseye,
  FaChartArea,
  FaCrosshairs,
  FaDiceThree,
  FaEllipsisV,
  FaGem,
  FaHome,
  FaMapMarkerAlt,
  FaPaintBrush,
  FaPalette,
  FaPencilAlt,
  FaPlay,
  FaRandom,
  FaRegCheckSquare,
  FaRegSquare,
  FaRoute,
  FaStop,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { PiGraph } from 'react-icons/pi';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import {
  type RoutingMode,
  routePlannerColorizeBy,
  routePlannerOptimizeOrder,
  routePlannerSetColorizeLegend,
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
  routePlannerSetIsochroneParams,
  routePlannerSetMode,
  routePlannerSetPickMode,
  routePlannerSetRoundtripParams,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSwapEnds,
  routePlannerToggleElevationChart,
  routePlannerToggleMilestones,
} from '../model/actions.js';
import {
  getFinish,
  getStart,
  routePlannerHasTransportOverride,
  routePlannerOptimizeApplicable,
} from '../model/reducer.js';
import { loadRoutePlannerMessages } from '../translations/loadRoutePlannerMessages.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { RoutePlannerTransportType } from './RoutePlannerTransportType.js';

const modeIcons: Record<RoutingMode, ReactElement> = {
  route: <MdTimeline />,
  trip: <PiGraph />,
  roundtrip: <BiShapePolygon />,
  isochrone: <FaBullseye />,
};

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
    (e: SubmitEvent<HTMLFormElement>) => {
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

  const rpm = useRoutePlannerMessages();

  const ghParams = rpm?.ghParams;

  return (
    <>
      <hr />

      <fieldset className="mx-4 mb-4 w-auto">
        <legend>{ghParams?.tripParameters}</legend>

        <Form.Group
          controlId="distance"
          as="form"
          onSubmit={handleDistanceSubmit}
        >
          <Form.Label>{ghParams?.distance}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              value={distance}
              onChange={handleDistanceChange}
              min={0.1}
              step="any"
              max={1000}
            />

            <InputGroup.Text>㎞</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="seed" as="form" onSubmit={handleSeedSubmit}>
          <Form.Label className="mt-2">{ghParams?.seed}</Form.Label>

          <InputGroup>
            <Form.Control
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
        </Form.Group>
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

  const rpm = useRoutePlannerMessages();

  const ghParams = rpm?.ghParams;

  return (
    <>
      <hr />

      <fieldset className="mx-4 mb-4 w-auto">
        <legend>{ghParams?.isochroneParameters}</legend>

        <Form.Group
          controlId="timeLimit"
          as="form"
          onSubmit={handleTimeLimitSubmit}
        >
          <Form.Label>{ghParams?.timeLimit}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              value={timeLimit}
              onChange={handleTimeLimitChange}
              min={0.1}
              step="any"
              max={12 * 60}
              disabled={distanceLimit !== '0'}
            />

            <InputGroup.Text>{m?.general.minutes}</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group
          controlId="distanceLimit"
          as="form"
          onSubmit={handleDistanceLimitSubmit}
        >
          <Form.Label className="mt-2">{ghParams?.distanceLimit}</Form.Label>

          <InputGroup>
            <Form.Control
              type="number"
              value={distanceLimit === '0' ? '' : distanceLimit}
              onChange={handleDistanceLimitChange}
              min={0}
              step="any"
              max={1000}
            />

            <InputGroup.Text>㎞</InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group
          controlId="buckets"
          as="form"
          onSubmit={handleBucketsSubmit}
        >
          <Form.Label className="mt-2">{ghParams?.buckets}</Form.Label>

          <Form.Control
            type="number"
            value={buckets}
            onChange={handleBucketsChange}
            min={1}
            step={1}
            max={5}
          />
        </Form.Group>
      </fieldset>
    </>
  );
}

type Props = { children: ReactNode; style: CSSProperties; className: string };

const GraphopperModeMenu = forwardRef<HTMLDivElement, Props>(
  ({ children, style, className }, ref) => {
    return (
      <div ref={ref} style={style} className={className}>
        {children}

        {Children.toArray(children)
          .filter(
            (
              item,
            ): item is ReactElement & { props: { eventKey: string | null } } =>
              typeof item === 'object' &&
              item !== null &&
              'props' in item &&
              typeof item.props === 'object' &&
              item.props !== null &&
              'active' in item.props &&
              typeof item.props.active === 'boolean' &&
              item.props.active,
          )
          .map((item) => {
            return (
              <Fragment key={`m-${item.props.eventKey}`}>
                {item.props.eventKey === 'roundtrip' ? (
                  <TripSettings />
                ) : item.props.eventKey === 'isochrone' ? (
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

export default function RoutePlannerMenu(): ReactElement {
  const m = useMessages();

  const rpm = useRoutePlannerMessages();

  const dispatch = useDispatch();

  const milestones = useAppSelector((state) => state.routePlanner.milestones);

  const homeLocation = useAppSelector(
    (state) => state.homeLocation.homeLocation,
  );

  const activeTransportType = useAppSelector(
    (state) => state.routePlanner.transportType,
  );

  const activeMode = useAppSelector((state) => state.routePlanner.mode);

  // Only reflect the armed pick mode while route-planner is the active tool;
  // when it's open but passive nothing is "toggled".
  const pickPointMode = useAppSelector((state) =>
    state.main.activeTool === 'route-planner'
      ? state.routePlanner.pickMode
      : null,
  );

  const routeFound = useAppSelector(
    (state) => state.routePlanner.alternatives.length > 0,
  );

  const colorizeBy = useAppSelector(
    (state) => state.routePlannerSettings.colorizeBy,
  );

  const colorizeLegend = useAppSelector(
    (state) => state.routePlannerSettings.colorizeLegend,
  );

  // Carries DEM elevation; used to label the elevation legend with real values.
  const renderGeojson = useAppSelector(
    (state) => state.routePlanner.renderGeojson,
  );

  const alternatives = useAppSelector(
    (state) => state.routePlanner.alternatives,
  );

  const activeAlternativeIndex = useAppSelector(
    (state) => state.routePlanner.activeAlternativeIndex,
  );

  const cm = useColorizerMessages();

  // The active alternative as a single line, used only to gate which colorize
  // modes apply (e.g. speed needs timestamps a planned route lacks).
  const lineFeatures = useMemo<Feature<LineString>[]>(() => {
    const coordinates =
      alternatives[activeAlternativeIndex]?.legs
        .flatMap((leg) => leg.steps)
        .flatMap((step) => step.geometry.coordinates) ?? [];

    return coordinates.length < 2
      ? []
      : [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates },
          },
        ];
  }, [alternatives, activeAlternativeIndex]);

  // The elevation-bearing line for the legend's real labels; kept referentially
  // stable so the legend's per-coordinate scan stays memoized.
  const colorizeFeatures = useMemo<Feature<LineString>[]>(
    () => (renderGeojson ? [renderGeojson] : lineFeatures),
    [renderGeojson, lineFeatures],
  );

  const isModeAvailable = (mode: (typeof colorizingModes)[number]) => {
    const { isAvailable } = colorizers[mode];

    return !isAvailable || isAvailable(lineFeatures);
  };

  const elevationProfileIsVisible = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const canSwap = useAppSelector(
    (state) => state.routePlanner.points.length > 1,
  );

  // Truthy (a purchase callback) only for non-premium users; optimization is a
  // premium feature, so its menu items stay disabled for them while the gem
  // remains clickable to start the purchase flow.
  const becomePremium = useBecomePremium();

  // Optimization eligibility, shared with the processor (see reducer.ts).
  const optimizeApplicable = useAppSelector((state) =>
    routePlannerOptimizeApplicable(state.routePlanner),
  );

  // Multimodal routes can't be reordered under a single profile.
  const optimizeBlocked = useAppSelector((state) =>
    routePlannerHasTransportOverride(state.routePlanner),
  );

  const startPoint = useAppSelector(
    (state) => getStart(state.routePlanner) ?? null,
  );

  const finishPoint = useAppSelector(
    (state) => getFinish(state.routePlanner) ?? null,
  );

  const handleMoreSelect = (eventKey: string | null) => {
    switch (eventKey) {
      case 'toggle-elevation-chart':
        dispatch(routePlannerToggleElevationChart());

        break;

      case 'convert-to-drawing': {
        dispatch(convertToDrawing({ type: 'planned-route' }));

        break;
      }

      case 'route-style':
        dispatch(setActiveModal({ type: 'route-planner-style' }));

        break;

      case 'toggle-milestones-km':
        dispatch(routePlannerToggleMilestones({ type: 'abs', toggle: true }));

        break;

      case 'toggle-milestones-%':
        dispatch(routePlannerToggleMilestones({ type: 'rel', toggle: true }));

        break;

      case 'optimize-fixed-start':
        dispatch(routePlannerOptimizeOrder('fixed-start'));

        break;

      case 'optimize-fixed-start-end':
        dispatch(routePlannerOptimizeOrder('fixed-start-end'));

        break;

      case 'optimize-roundtrip':
        dispatch(routePlannerOptimizeOrder('roundtrip'));

        break;

      case 'optimize-free':
        dispatch(routePlannerOptimizeOrder('free'));

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
          messageKey: 'noHomeAlert.msg',
          messageLoader: loadRoutePlannerMessages,
          style: 'warning',
          actions: [
            {
              name: rpm?.noHomeAlert.setHome ?? '',
              action: setSelectingHomeLocation(true),
            },
            { nameKey: 'general.close', variant: 'dark' },
          ],
        }),
      );
    } else if (pointType === 'start') {
      dispatch(routePlannerSetStart(homeLocation));
    } else if (pointType === 'finish') {
      dispatch(routePlannerSetFinish(homeLocation));
    }
  }

  const activeTTDef = transportTypeDefs[activeTransportType];

  const [routePlannerDropdownOpen, setRoutePlannerDropdownOpen] =
    useState(false);

  return (
    <>
      <ToolMenu tool="route-planner">
        <RoutePlannerTransportType
          onChange={(transportType) =>
            dispatch(routePlannerSetTransportType(transportType!))
          }
          value={activeTransportType}
        />

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
            <LongPressTooltip
              label={
                rpm?.mode[
                  activeMode === 'roundtrip' ? 'routndtrip-gh' : activeMode
                ]
              }
              name={rpm?.modeLabel}
              breakpoint="sm"
            >
              {({ props, label, labelClassName }) => (
                <Dropdown.Toggle id="mode" variant="secondary" {...props}>
                  {modeIcons[activeMode]}{' '}
                  <span className={labelClassName}>{label}</span>
                </Dropdown.Toggle>
              )}
            </LongPressTooltip>

            <Dropdown.Menu
              popperConfig={fixedPopperConfig}
              as={GraphopperModeMenu}
            >
              {(
                ['route', 'roundtrip', 'isochrone'] satisfies RoutingMode[]
              ).map((mode) => (
                <Dropdown.Item
                  eventKey={mode}
                  key={mode}
                  title={rpm?.mode[mode]}
                  active={activeMode === mode}
                >
                  {modeIcons[mode]}{' '}
                  {rpm?.mode[mode === 'roundtrip' ? 'routndtrip-gh' : mode] ??
                    '…'}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}

        {activeTTDef?.api === 'osrm' && (
          <SelectDropdown
            className="ms-1"
            id="mode"
            breakpoint="sm"
            name={rpm?.modeLabel}
            value={activeMode}
            onSelect={(mode) => {
              dispatch(routePlannerSetMode(mode as RoutingMode));
            }}
            options={(
              ['route', 'trip', 'roundtrip'] satisfies RoutingMode[]
            ).map((mode) => ({
              value: mode,
              label: rpm?.mode[mode] ?? '…',
              icon: modeIcons[mode],
              title: rpm?.mode[mode],
            }))}
          />
        )}

        <ButtonGroup className="ms-1">
          <Dropdown
            className="btn-group"
            id="set-start-dropdown"
            onSelect={(eventKey, e) => {
              if (eventKey === 'pick') {
                // Picking on the map needs route-planner to own clicks.
                dispatch(setTool({ tool: 'route-planner', mode: 'activate' }));
                dispatch(routePlannerSetPickMode('start'));
              } else if (eventKey === 'current') {
                dispatch(routePlannerSetFromCurrentPosition('start'));
              } else if (eventKey === 'home') {
                setFromHomeLocation('start', e);
              } else if (eventKey === 'from-finish' && finishPoint) {
                dispatch(
                  routePlannerSetStart({
                    lat: finishPoint.lat,
                    lon: finishPoint.lon,
                  }),
                );
              }
            }}
          >
            <LongPressTooltip breakpoint="md" label={rpm?.start}>
              {({ label, labelClassName, props }) => (
                <Dropdown.Toggle
                  variant="secondary"
                  active={pickPointMode === 'start'}
                  {...props}
                >
                  <FaPlay color="#409a40" />

                  <span className={labelClassName}> {label}</span>
                </Dropdown.Toggle>
              )}
            </LongPressTooltip>

            <Dropdown.Menu popperConfig={fixedPopperConfig}>
              <Dropdown.Item eventKey="pick">
                <FaMapMarkerAlt />
                &nbsp;{rpm?.point.pick ?? '…'}
              </Dropdown.Item>

              <Dropdown.Item eventKey="current">
                <FaBullseye />
                &nbsp;{rpm?.point.current ?? '…'}
              </Dropdown.Item>

              <Dropdown.Item
                className="d-flex align-items-center justify-content-between"
                eventKey="home"
              >
                <span>
                  <FaHome />
                  &nbsp;{rpm?.point.home ?? '…'}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  className="my-n1 ms-2"
                  title={rpm?.selectHomeLocation}
                >
                  <FaCrosshairs className="pe-none" />
                </Button>
              </Dropdown.Item>

              {finishPoint &&
                activeMode !== 'roundtrip' &&
                activeMode !== 'isochrone' && (
                  <Dropdown.Item eventKey="from-finish">
                    <FaStop color="#d9534f" />
                    &nbsp;{rpm?.point.fromFinish ?? '…'}
                  </Dropdown.Item>
                )}
            </Dropdown.Menu>
          </Dropdown>

          {activeMode !== 'roundtrip' && activeMode !== 'isochrone' && (
            <>
              <LongPressTooltip label={rpm?.swap}>
                {({ label, labelClassName, props }) => (
                  <Button
                    variant="secondary"
                    onClick={() => dispatch(routePlannerSwapEnds())}
                    disabled={!canSwap}
                    {...props}
                  >
                    ⇆<span className={labelClassName}> {label}</span>
                  </Button>
                )}
              </LongPressTooltip>

              <Dropdown
                id="set-finish-dropdown"
                className="btn-group"
                onSelect={(eventKey, e) => {
                  if (eventKey === 'pick') {
                    // Picking on the map needs route-planner to own clicks.
                    dispatch(
                      setTool({ tool: 'route-planner', mode: 'activate' }),
                    );
                    dispatch(routePlannerSetPickMode('finish'));
                  } else if (eventKey === 'current') {
                    dispatch(routePlannerSetFromCurrentPosition('finish'));
                  } else if (eventKey === 'home') {
                    setFromHomeLocation('finish', e);
                  } else if (eventKey === 'from-start' && startPoint) {
                    dispatch(
                      routePlannerSetFinish({
                        lat: startPoint.lat,
                        lon: startPoint.lon,
                      }),
                    );
                  }
                }}
              >
                <LongPressTooltip breakpoint="md" label={rpm?.finish}>
                  {({ label, labelClassName, props }) => (
                    <Dropdown.Toggle
                      variant="secondary"
                      active={pickPointMode === 'finish'}
                      {...props}
                    >
                      <FaStop color="#d9534f" />

                      <span className={labelClassName}> {label}</span>
                    </Dropdown.Toggle>
                  )}
                </LongPressTooltip>

                <Dropdown.Menu popperConfig={fixedPopperConfig}>
                  <Dropdown.Item eventKey="pick">
                    <FaMapMarkerAlt />
                    &nbsp;
                    {rpm?.point.pick ?? '…'}
                  </Dropdown.Item>

                  <Dropdown.Item eventKey="current">
                    <FaBullseye />
                    &nbsp;
                    {rpm?.point.current ?? '…'}
                  </Dropdown.Item>

                  <Dropdown.Item
                    className="d-flex align-items-center justify-content-between"
                    eventKey="home"
                  >
                    <span>
                      <FaHome />
                      &nbsp;{rpm?.point.home ?? '…'}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="my-n1 ms-2"
                      title={rpm?.selectHomeLocation}
                    >
                      <FaCrosshairs className="pe-none" />
                    </Button>
                  </Dropdown.Item>

                  {startPoint && (
                    <Dropdown.Item eventKey="from-start">
                      <FaPlay color="#409a40" />
                      &nbsp;{rpm?.point.fromStart ?? '…'}
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </>
          )}
        </ButtonGroup>

        {routeFound && (
          <SelectDropdown
            className="ms-1"
            id="route-colorizing-mode"
            breakpoint="sm"
            toggleIcon={<FaPalette />}
            name={cm?.colorizeBy}
            value={colorizeBy ?? 'none'}
            onSelect={(mode) => {
              if (mode === LEGEND_ITEM) {
                dispatch(routePlannerSetColorizeLegend());

                return;
              }

              dispatch(
                routePlannerColorizeBy(
                  ColorizingModeSchema.nullable().parse(
                    mode === 'none' ? null : mode,
                  ),
                ),
              );
            }}
            // Unlike imported tracks, a planned route can never carry recorded
            // sensor data (heart rate, cadence, …), so those modes are hidden
            // rather than shown disabled.
            options={[
              ...legendToggleOption(colorizeBy, colorizeLegend, cm?.legend),
              ...[undefined, ...colorizingModes.filter(isModeAvailable)].map(
                (mode) => ({
                  value: mode ?? 'none',
                  label: cm?.mode[mode ?? 'none'],
                  // Launch badge: every mode except the free trio is premium,
                  // shown free for now. Tracked by hand — drop when launch ends.
                  extra:
                    mode &&
                    mode !== 'elevation' &&
                    mode !== 'speed' &&
                    mode !== 'time' ? (
                      <FaGem
                        className="ms-1 text-info"
                        title={cm?.premiumDuringLaunch}
                      />
                    ) : undefined,
                }),
              ),
            ]}
          />
        )}

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

              <Dropdown.Item eventKey="route-style">
                <FaPaintBrush />
                &nbsp;{rpm?.style.menuItem ?? '…'}
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item eventKey="toggle-milestones-km">
                {milestones === 'abs' ? <FaRegCheckSquare /> : <FaRegSquare />}
                &nbsp;{rpm?.milestones ?? '…'} (km)
              </Dropdown.Item>

              <Dropdown.Item eventKey="toggle-milestones-%">
                {milestones === 'rel' ? <FaRegCheckSquare /> : <FaRegSquare />}
                &nbsp;{rpm?.milestones ?? '…'} (%)
              </Dropdown.Item>

              {optimizeApplicable && (
                <>
                  <Dropdown.Divider />

                  <Dropdown.Header>
                    <FaRandom />
                    &nbsp;{rpm?.optimize.label ?? '…'}
                    &nbsp;
                    <PremiumGem nested />
                  </Dropdown.Header>

                  {(
                    [
                      ['optimize-fixed-start', rpm?.optimize.fixedStart],
                      ['optimize-fixed-start-end', rpm?.optimize.fixedStartEnd],
                      ['optimize-roundtrip', rpm?.optimize.roundtrip],
                      ['optimize-free', rpm?.optimize.free],
                    ] as const
                  ).map(([eventKey, label]) => (
                    <Dropdown.Item
                      key={eventKey}
                      eventKey={eventKey}
                      disabled={optimizeBlocked || Boolean(becomePremium)}
                    >
                      {label ?? '…'}
                    </Dropdown.Item>
                  ))}
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </ToolMenu>

      {routeFound && colorizeLegend && colorizeBy && (
        <ColorizeLegend
          mode={colorizeBy}
          icon={<FaRoute />}
          features={colorizeFeatures}
        />
      )}
    </>
  );
}
