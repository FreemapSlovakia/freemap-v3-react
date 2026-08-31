import {
  convertToDrawing,
  setActiveModal,
  setSelectingHomeLocation,
} from '@app/store/actions.js';
import { useConvertToDataViewer } from '@features/dataViewer/hooks/useConvertToDataViewer.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { colorizeGeometrySource } from '@shared/colorizers/colorize.js';
import { colorizeModeOptions } from '@shared/colorizers/colorizeModeOptions.js';
import { ColorizeLegend } from '@shared/colorizers/components/ColorizeLegend.js';
import {
  LEGEND_ITEM,
  legendToggleOption,
} from '@shared/colorizers/components/legendToggleOption.js';
import { usePremiumColorizeLock } from '@shared/colorizers/components/usePremiumColorizeLock.js';
import {
  ColorizingModeSchema,
  colorizers,
  colorizingModes,
} from '@shared/colorizers/index.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useColorizerMessages } from '@shared/colorizers/translations/useColorizerMessages.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { HintMark } from '@shared/components/HintMark.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  Action,
  ActionItems,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useSimplifyPrompt } from '@shared/simplifyDialog.js';
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
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { BiShapePolygon } from 'react-icons/bi';
import {
  FaBullseye,
  FaChartArea,
  FaCrosshairs,
  FaDiceThree,
  FaHome,
  FaMapMarkerAlt,
  FaPaintBrush,
  FaPalette,
  FaPencilAlt,
  FaPlay,
  FaRandom,
  FaRoute,
  FaStop,
  FaSync,
} from 'react-icons/fa';
import { MdShapeLine, MdTimeline } from 'react-icons/md';
import { PiGraph } from 'react-icons/pi';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import {
  type RoutingMode,
  routePlannerColorizeBy,
  routePlannerDelete,
  routePlannerOptimizeOrder,
  routePlannerRecompute,
  routePlannerSetColorizeLegend,
  routePlannerSetFinish,
  routePlannerSetFromCurrentPosition,
  routePlannerSetIsochroneParams,
  routePlannerSetMaxAlternatives,
  routePlannerSetMilestones,
  routePlannerSetMode,
  routePlannerSetPickMode,
  routePlannerSetRoundtripParams,
  routePlannerSetStart,
  routePlannerSetTransportType,
  routePlannerSwapEnds,
} from '../model/actions.js';
import { pathDetailKeys, routeColorizeFeatures } from '../model/pathDetails.js';
import {
  getFinish,
  getStart,
  routePlannerAlternativesApplicable,
  routePlannerHasTransportOverride,
  routePlannerOptimizeApplicable,
  storedRouteIsShowingSelector,
} from '../model/reducer.js';
import { plannedRouteLines } from '../model/routeGeometry.js';
import { MAX_ALTERNATIVES } from '../model/settingsReducer.js';
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

/**
 * A setting of the ⋮ menu whose values are few and short enough to sit side by
 * side. Full width, against the usual rule for short options: these read as a
 * scale, and an even row of them shows it.
 */
function MenuToggleGroup({
  icon,
  title,
  name,
  value,
  options,
  onChange,
}: {
  icon: ReactElement;
  title: ReactNode;
  name: string;
  value: string;
  options: readonly (readonly [value: string, label: ReactNode])[];
  onChange: (value: string) => void;
}) {
  return (
    <>
      <Dropdown.Divider />

      <Dropdown.Header>
        {icon}
        &nbsp;{title ?? '…'}
      </Dropdown.Header>

      <div className="px-3 pb-2">
        <ToggleButtonGroup
          className="d-flex"
          type="radio"
          name={name}
          value={value}
          onChange={onChange}
        >
          {options.map(([optionValue, label]) => (
            <ToggleButton
              key={optionValue}
              id={`${name}-${optionValue}`}
              value={optionValue}
              variant="outline-primary"
              size="sm"
            >
              {label ?? '…'}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>
    </>
  );
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

            <InputGroup.Text>km</InputGroup.Text>
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

  const reverseFlow = useAppSelector(
    (state) => state.routePlanner.isochroneParams.reverseFlow,
  );

  const handleReverseFlowChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        routePlannerSetIsochroneParams({
          reverseFlow: e.currentTarget.checked,
        }),
      );
    },
    [dispatch],
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

            <InputGroup.Text>km</InputGroup.Text>
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

        <Form.Group className="mt-2 d-flex">
          <Form.Check
            id="isoReverseFlow"
            type="checkbox"
            checked={reverseFlow}
            label={ghParams?.reverseFlow}
            onChange={handleReverseFlowChange}
          />

          <HintMark hint={ghParams?.reverseFlowHint} />
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

  const pickPointMode = useAppSelector((state) => state.routePlanner.pickMode);

  const routeFound = useAppSelector(
    (state) => state.routePlanner.alternatives.length > 0,
  );

  // The route on screen is the one the open map has stored, rather than one the
  // router was just asked for.
  const storedRouteShowing = useAppSelector(storedRouteIsShowingSelector);

  const maxAlternatives = useAppSelector(
    (state) => state.routePlannerSettings.maxAlternatives,
  );

  const alternativesApplicable = useAppSelector((state) =>
    routePlannerAlternativesApplicable(state.routePlanner),
  );

  // Isochrones replace the route alternatives, so the result-dependent controls
  // key off either. Most of them (colorize, elevation profile, milestones,
  // optimization) only make sense for a route and stay route-only.
  const isochronesFound = useAppSelector(
    (state) => (state.routePlanner.isochrones?.length ?? 0) > 0,
  );

  const isochrones = useAppSelector((state) => state.routePlanner.isochrones);

  const askSimplification = useSimplifyPrompt();

  const convertToDataViewer = useConvertToDataViewer();

  const resultFound = routeFound || isochronesFound;

  // A single placed point is already worth a delete — it is what the next click
  // would extend, and no route needs to have been computed yet.
  const hasRoute = useAppSelector(
    (state) => state.routePlanner.points.length > 0,
  );

  const colorizeBy = useUnlockedColorizingMode(
    useAppSelector((state) => state.routePlannerSettings.colorizeBy),
  );

  const premiumColorize = usePremiumColorizeLock();

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
  const lineFeatures = useMemo<Feature<LineString>[]>(
    () => routeColorizeFeatures(alternatives[activeAlternativeIndex]),
    [alternatives, activeAlternativeIndex],
  );

  // What the legend measures, which has to be the line the map draws: the
  // elevation-bearing one where the mode reads it, the plain route otherwise.
  const colorizeFeatures = useMemo<Feature<LineString>[]>(
    () =>
      routeColorizeFeatures(
        alternatives[activeAlternativeIndex],
        colorizeGeometrySource(
          colorizeBy && colorizers[colorizeBy],
          renderGeojson,
        ),
      ),
    [renderGeojson, colorizeBy, alternatives, activeAlternativeIndex],
  );

  const isModeAvailable = (mode: (typeof colorizingModes)[number]) => {
    // The active mode keeps its slot whatever the route holds: it still paints
    // the line, and dropping it from the list would leave the toggle unable to
    // name what is on — with no way to switch it off but picking something else.
    if (mode === colorizeBy) {
      return true;
    }

    const { isAvailable } = colorizers[mode];

    return !isAvailable || isAvailable(lineFeatures);
  };

  const elevationProfileIsVisible = useAppSelector(
    (state) => state.elevationChart.target?.type === 'route-planner',
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

  async function convertRouteToDrawing() {
    const tolerance = await askSimplification({
      lines: plannedRouteLines(
        isochrones,
        alternatives[activeAlternativeIndex],
      ),
    });

    if (tolerance !== null) {
      dispatch(convertToDrawing({ type: 'planned-route', tolerance }));
    }
  }

  // Only the optimize items still come in as event keys; every other action
  // dispatches from where it is declared.
  const handleMoreSelect = (eventKey: string | null) => {
    switch (eventKey) {
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

  // Only GraphHopper reports path details, and only the ones this profile asks
  // for; a mode reading anything else can never be filled in here.
  const offeredDetails = new Set(
    activeTTDef.api === 'gh' ? pathDetailKeys(activeTransportType) : [],
  );

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
              breakpoint="md"
            >
              {({ props, label, labelClassName }) => (
                <Dropdown.Toggle id="mode" variant="secondary" {...props}>
                  {modeIcons[activeMode]}{' '}
                  <span className={labelClassName}>{label}</span>
                </Dropdown.Toggle>
              )}
            </LongPressTooltip>

            <Dropdown.Menu
              className="fm-dropdown-fixed"
              popperConfig={fixedPopperConfig}
              as={GraphopperModeMenu}
            >
              {(
                ['route', 'roundtrip', 'isochrone'] satisfies RoutingMode[]
              ).map((mode) => (
                <Dropdown.Item
                  as="button"
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
            id="mode"
            breakpoint="md"
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

        <ButtonGroup>
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
            <LongPressTooltip breakpoint="lg" label={rpm?.start}>
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

            <FmDropdownMenu>
              <Dropdown.Item as="button" eventKey="pick">
                <FaMapMarkerAlt />
                &nbsp;{rpm?.point.pick ?? '…'}
              </Dropdown.Item>

              <Dropdown.Item as="button" eventKey="current">
                <FaBullseye />
                &nbsp;{rpm?.point.current ?? '…'}
              </Dropdown.Item>

              <Dropdown.Item
                as="button"
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
                  <Dropdown.Item as="button" eventKey="from-finish">
                    <FaStop color="#d9534f" />
                    &nbsp;{rpm?.point.fromFinish ?? '…'}
                  </Dropdown.Item>
                )}
            </FmDropdownMenu>
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
                <LongPressTooltip breakpoint="lg" label={rpm?.finish}>
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

                <FmDropdownMenu>
                  <Dropdown.Item as="button" eventKey="pick">
                    <FaMapMarkerAlt />
                    &nbsp;
                    {rpm?.point.pick ?? '…'}
                  </Dropdown.Item>

                  <Dropdown.Item as="button" eventKey="current">
                    <FaBullseye />
                    &nbsp;
                    {rpm?.point.current ?? '…'}
                  </Dropdown.Item>

                  <Dropdown.Item
                    as="button"
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
                    <Dropdown.Item as="button" eventKey="from-start">
                      <FaPlay color="#409a40" />
                      &nbsp;{rpm?.point.fromStart ?? '…'}
                    </Dropdown.Item>
                  )}
                </FmDropdownMenu>
              </Dropdown>
            </>
          )}
        </ButtonGroup>

        {routeFound && (
          <SelectDropdown
            id="route-colorizing-mode"
            breakpoint="md"
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
            // Hide what this profile can never carry — the recorded sensor and
            // device channels, and any path detail it does not ask the router
            // for (a difficulty scale off its own profile, everything off
            // GraphHopper). Disable what it merely lacks: a detail it does ask
            // for comes and goes with the roads routed over, so filtering that
            // would reshape the menu on every drag of a waypoint and hide that
            // nothing here is mapped with it.
            options={[
              ...legendToggleOption(colorizeBy, colorizeLegend, cm?.legend),
              ...colorizeModeOptions({
                modes: colorizingModes.filter(
                  (mode) =>
                    offeredDetails.has(colorizers[mode].detail ?? '') ||
                    isModeAvailable(mode),
                ),
                labels: cm?.mode,
                activeMode: colorizeBy,
                premiumColorize,
                isAvailable: isModeAvailable,
              }),
            ]}
          />
        )}

        {resultFound && (
          <ResponsiveActions
            // The gap the buttons beside it are set in.
            gap={1}
            onSelect={handleMoreSelect}
          >
            {routeFound && (
              <Action
                label={m?.general.elevationProfile}
                icon={<FaChartArea />}
                // Breakpoints, not `fit`: this toolbar wraps onto a line of its
                // own, where measuring what fits has no stable answer.
                showFrom="lg"
                showLabelFrom="xl"
                active={elevationProfileIsVisible}
                onClick={() => {
                  dispatch(
                    elevationProfileIsVisible
                      ? elevationChartClose()
                      : elevationChartOpen({ type: 'route-planner' }),
                  );
                }}
              />
            )}

            <Action
              label={m?.general.convertToDrawing}
              icon={<FaPencilAlt />}
              showFrom="never"
              onClick={() => {
                void convertRouteToDrawing();
              }}
            />

            <Action
              label={m?.general.convertTo({ tool: m?.tools.dataViewer })}
              icon={<MdShapeLine />}
              showFrom="never"
              onClick={() => {
                convertToDataViewer({ type: 'planned-route' });
              }}
            />

            <Action
              label={rpm?.style.menuItem}
              icon={<FaPaintBrush />}
              showFrom="never"
              onClick={() => {
                dispatch(setActiveModal({ type: 'route-planner-style' }));
              }}
            />

            {/* Only a route that came with the map is not already fresh. */}
            {storedRouteShowing && (
              <Action
                label={rpm?.recompute}
                icon={<FaSync />}
                showFrom="never"
                onClick={() => {
                  dispatch(routePlannerRecompute());
                }}
              />
            )}

            <ActionItems>
              {routeFound && (
                <MenuToggleGroup
                  icon={<FaMapMarkerAlt />}
                  title={rpm?.milestones}
                  name="milestones"
                  // A group's value is a string, so the off state is spelled
                  // rather than being the `false` the setting holds.
                  value={milestones || 'off'}
                  options={[
                    ['off', rpm?.milestonesOff],
                    ['abs', 'km'],
                    ['rel', '%'],
                  ]}
                  onChange={(value) => {
                    dispatch(
                      routePlannerSetMilestones(
                        value === 'off' ? false : (value as 'abs' | 'rel'),
                      ),
                    );
                  }}
                />
              )}

              {/* Not for the map's own stored route: the count is not part of
                  `routeKey`, so nothing would re-route. */}
              {alternativesApplicable && !storedRouteShowing && (
                <MenuToggleGroup
                  icon={<FaRoute />}
                  title={rpm?.maxAlternatives}
                  name="maxAlternatives"
                  value={String(maxAlternatives)}
                  options={Array.from(
                    { length: MAX_ALTERNATIVES },
                    (_, i) => [String(i + 1), String(i + 1)] as const,
                  )}
                  onChange={(value) => {
                    dispatch(routePlannerSetMaxAlternatives(Number(value)));
                  }}
                />
              )}

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
                      as="button"
                      key={eventKey}
                      eventKey={eventKey}
                      disabled={optimizeBlocked || Boolean(becomePremium)}
                    >
                      {label ?? '…'}
                    </Dropdown.Item>
                  ))}
                </>
              )}
            </ActionItems>
          </ResponsiveActions>
        )}

        {hasRoute && <DeleteButton action={routePlannerDelete()} />}
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
