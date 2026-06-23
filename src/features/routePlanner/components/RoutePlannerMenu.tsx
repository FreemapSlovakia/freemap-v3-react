import {
  convertToDrawing,
  setSelectingHomeLocation,
} from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  ColorizingModeSchema,
  colorizers,
  colorizingModes,
} from '@shared/colorizers/index.js';
import { useColorizerMessages } from '@shared/colorizers/translations/useColorizerMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import type { Feature, LineString } from 'geojson';
import {
  ChangeEvent,
  Children,
  CSSProperties,
  Fragment,
  forwardRef,
  ReactElement,
  ReactNode,
  SubmitEvent,
  SyntheticEvent,
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
import {
  FaBullseye,
  FaChartArea,
  FaCrosshairs,
  FaDiceThree,
  FaEllipsisV,
  FaHome,
  FaMapMarkerAlt,
  FaPaintBrush,
  FaPencilAlt,
  FaPlay,
  FaRegCheckSquare,
  FaRegSquare,
  FaStop,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import {
  RoutingMode,
  routePlannerColorizeBy,
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
import { loadRoutePlannerMessages } from '../translations/loadRoutePlannerMessages.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { RoutePlannerTransportType } from './RoutePlannerTransportType.js';

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
              <Fragment key={'m-' + item.props.eventKey}>
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

  const colorizeBy = useAppSelector((state) => state.routePlanner.colorizeBy);

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

  const handleMoreSelect = (eventKey: string | null) => {
    switch (eventKey) {
      case 'toggle-elevation-chart':
        dispatch(routePlannerToggleElevationChart());

        break;

      case 'convert-to-drawing': {
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
      }

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
    <ToolMenu>
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
            breakpoint="sm"
          >
            {({ props, label, labelClassName }) => (
              <Dropdown.Toggle id="mode" variant="secondary" {...props}>
                <MdTimeline /> <span className={labelClassName}>{label}</span>
              </Dropdown.Toggle>
            )}
          </LongPressTooltip>

          <Dropdown.Menu
            popperConfig={fixedPopperConfig}
            as={GraphopperModeMenu}
          >
            {(['route', 'roundtrip', 'isochrone'] satisfies RoutingMode[]).map(
              (mode) => (
                <Dropdown.Item
                  eventKey={mode}
                  key={mode}
                  title={rpm?.mode[mode]}
                  active={activeMode === mode}
                >
                  {rpm?.mode[mode === 'roundtrip' ? 'routndtrip-gh' : mode] ??
                    '…'}
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
          <Dropdown.Toggle id="mode" variant="secondary">
            {rpm?.mode[activeMode] ?? '…'}
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            {(['route', 'trip', 'roundtrip'] satisfies RoutingMode[]).map(
              (mode) => (
                <Dropdown.Item
                  eventKey={mode}
                  key={mode}
                  title={rpm?.mode[mode]}
                  active={activeMode === mode}
                >
                  {rpm?.mode[mode] ?? '…'}
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
              <FaHome />
              &nbsp;{rpm?.point.home ?? '…'}
              <Button
                size="sm"
                variant="secondary"
                className="my-n1 ms-2"
                title={rpm?.selectHomeLocation}
              >
                <FaCrosshairs className="pe-none" />
              </Button>
            </Dropdown.Item>
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
                  dispatch(routePlannerSetPickMode('finish'));
                } else if (eventKey === 'current') {
                  dispatch(routePlannerSetFromCurrentPosition('finish'));
                } else if (eventKey === 'home') {
                  setFromHomeLocation('finish', e);
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
                  <FaHome />
                  &nbsp;{rpm?.point.home ?? '…'}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="my-n1 ms-2"
                    title={rpm?.selectHomeLocation}
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
        <Dropdown
          className="ms-1"
          id="route-colorizing-mode"
          onSelect={(mode) => {
            dispatch(
              routePlannerColorizeBy(
                ColorizingModeSchema.nullable().parse(mode),
              ),
            );
          }}
        >
          <Dropdown.Toggle variant="secondary">
            <FaPaintBrush /> {cm?.mode[colorizeBy ?? 'none']}
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            {/* Unlike imported tracks, a planned route can never carry recorded
                sensor data (heart rate, cadence, …), so those modes are hidden
                rather than shown disabled. */}
            {[undefined, ...colorizingModes.filter(isModeAvailable)].map(
              (mode) => (
                <Dropdown.Item
                  eventKey={mode}
                  key={mode || 'none'}
                  active={mode === colorizeBy}
                >
                  {cm?.mode[mode ?? 'none']}
                </Dropdown.Item>
              ),
            )}
          </Dropdown.Menu>
        </Dropdown>
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

            <Dropdown.Divider />

            <Dropdown.Item eventKey="toggle-milestones-km">
              {milestones === 'abs' ? <FaRegCheckSquare /> : <FaRegSquare />}
              &nbsp;{rpm?.milestones ?? '…'} (km)
            </Dropdown.Item>

            <Dropdown.Item eventKey="toggle-milestones-%">
              {milestones === 'rel' ? <FaRegCheckSquare /> : <FaRegSquare />}
              &nbsp;{rpm?.milestones ?? '…'} (%)
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </ToolMenu>
  );
}
