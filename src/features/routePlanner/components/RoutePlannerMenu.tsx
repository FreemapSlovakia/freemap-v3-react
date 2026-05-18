import {
  convertToDrawing,
  setSelectingHomeLocation,
} from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ActionIcon, Menu } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { transportTypeDefs } from '@shared/transportTypeDefs.js';
import {
  ChangeEvent,
  Fragment,
  ReactElement,
  SubmitEvent,
  SyntheticEvent,
  useCallback,
  useState,
} from 'react';
import { Button, ButtonGroup, Form, InputGroup } from 'react-bootstrap';
import {
  FaBullseye,
  FaCaretDown,
  FaChartArea,
  FaCrosshairs,
  FaDiceThree,
  FaEllipsisV,
  FaHome,
  FaMapMarkerAlt,
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
import { RoutePlannerTransportType } from './RoutePlannerTransportType.js';

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

  const m = useMessages();

  const ghParams = m?.routePlanner.ghParams;

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

  const ghParams = m?.routePlanner.ghParams;

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

export function RoutePlannerMenu(): ReactElement {
  const m = useMessages();

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
    pointType: 'start' | 'finish',
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
          color: 'yellow',
          actions: [
            {
              nameKey: 'routePlanner.noHomeAlert.setHome',
              action: setSelectingHomeLocation(true),
            },
            { nameKey: 'general.close', color: 'dark' },
          ],
        }),
      );
    } else if (pointType === 'start') {
      dispatch(routePlannerSetStart(homeLocation));
    } else {
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
        <Menu
          opened={routePlannerDropdownOpen}
          onChange={setRoutePlannerDropdownOpen}
          closeOnItemClick={false}
        >
          <Menu.Target>
            <MantineLongPressTooltip
              label={
                m?.routePlanner.mode[
                  activeMode === 'roundtrip' ? 'routndtrip-gh' : activeMode
                ]
              }
              breakpoint="sm"
            >
              {({ props, label, labelClassName }) => (
                <Button
                  variant="secondary"
                  className="ms-1"
                  id="mode"
                  {...props}
                >
                  <MdTimeline /> <span className={labelClassName}>{label}</span>{' '}
                  <FaCaretDown />
                </Button>
              )}
            </MantineLongPressTooltip>
          </Menu.Target>

          <Menu.Dropdown>
            {(['route', 'roundtrip', 'isochrone'] satisfies RoutingMode[]).map(
              (mode) => (
                <Fragment key={mode}>
                  <Menu.Item
                    title={m?.routePlanner.mode[mode]}
                    color={activeMode === mode ? 'blue' : undefined}
                    onClick={() => dispatch(routePlannerSetMode(mode))}
                  >
                    {m?.routePlanner.mode[
                      mode === 'roundtrip' ? 'routndtrip-gh' : mode
                    ] ?? '…'}
                  </Menu.Item>

                  {activeMode === mode && mode === 'roundtrip' && (
                    <TripSettings />
                  )}

                  {activeMode === mode && mode === 'isochrone' && (
                    <IsochroneSettings />
                  )}
                </Fragment>
              ),
            )}
          </Menu.Dropdown>
        </Menu>
      )}

      {activeTTDef?.api === 'osrm' && (
        <Menu>
          <Menu.Target>
            <Button variant="secondary" className="ms-1" id="mode">
              {m?.routePlanner.mode[activeMode] ?? '…'} <FaCaretDown />
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {(['route', 'trip', 'roundtrip'] satisfies RoutingMode[]).map(
              (mode) => (
                <Menu.Item
                  key={mode}
                  title={m?.routePlanner.mode[mode]}
                  color={activeMode === mode ? 'blue' : undefined}
                  onClick={() => dispatch(routePlannerSetMode(mode))}
                >
                  {m?.routePlanner.mode[mode] ?? '…'}
                </Menu.Item>
              ),
            )}
          </Menu.Dropdown>
        </Menu>
      )}

      <ButtonGroup className="ms-1">
        <Menu>
          <Menu.Target>
            <MantineLongPressTooltip
              breakpoint="md"
              label={m?.routePlanner.start}
            >
              {({ label, labelClassName, props }) => (
                <Button
                  variant="secondary"
                  active={pickPointMode === 'start'}
                  {...props}
                >
                  <FaPlay color="#409a40" />
                  <span className={labelClassName}> {label}</span>{' '}
                  <FaCaretDown />
                </Button>
              )}
            </MantineLongPressTooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<FaMapMarkerAlt />}
              onClick={() => dispatch(routePlannerSetPickMode('start'))}
            >
              {m?.routePlanner.point.pick ?? '…'}
            </Menu.Item>

            <Menu.Item
              leftSection={<FaBullseye />}
              onClick={() =>
                dispatch(routePlannerSetFromCurrentPosition('start'))
              }
            >
              {m?.routePlanner.point.current ?? '…'}
            </Menu.Item>

            <Menu.Item
              leftSection={<FaHome />}
              rightSection={
                <ActionIcon
                  size="sm"
                  variant="filled"
                  color="gray"
                  title={m?.settings.map.homeLocation.select}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setSelectingHomeLocation(true));
                  }}
                >
                  <FaCrosshairs className="pe-none" />
                </ActionIcon>
              }
              onClick={(e) => setFromHomeLocation('start', e)}
            >
              {m?.routePlanner.point.home ?? '…'}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        {activeMode !== 'roundtrip' && activeMode !== 'isochrone' && (
          <>
            <MantineLongPressTooltip label={m?.routePlanner.swap}>
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
            </MantineLongPressTooltip>

            <Menu>
              <Menu.Target>
                <MantineLongPressTooltip
                  breakpoint="md"
                  label={m?.routePlanner.finish}
                >
                  {({ label, labelClassName, props }) => (
                    <Button
                      variant="secondary"
                      active={pickPointMode === 'finish'}
                      {...props}
                    >
                      <FaStop color="#d9534f" />
                      <span className={labelClassName}> {label}</span>{' '}
                      <FaCaretDown />
                    </Button>
                  )}
                </MantineLongPressTooltip>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<FaMapMarkerAlt />}
                  onClick={() => dispatch(routePlannerSetPickMode('finish'))}
                >
                  {m?.routePlanner.point.pick ?? '…'}
                </Menu.Item>

                <Menu.Item
                  leftSection={<FaBullseye />}
                  onClick={() =>
                    dispatch(routePlannerSetFromCurrentPosition('finish'))
                  }
                >
                  {m?.routePlanner.point.current ?? '…'}
                </Menu.Item>

                <Menu.Item
                  leftSection={<FaHome />}
                  rightSection={
                    <ActionIcon
                      size="sm"
                      variant="filled"
                      color="gray"
                      title={m?.settings.map.homeLocation.select}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setSelectingHomeLocation(true));
                      }}
                    >
                      <FaCrosshairs className="pe-none" />
                    </ActionIcon>
                  }
                  onClick={(e) => setFromHomeLocation('finish', e)}
                >
                  {m?.routePlanner.point.home ?? '…'}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </>
        )}
      </ButtonGroup>

      {routeFound && (
        <Menu>
          <Menu.Target>
            <Button variant="secondary" className="ms-1" id="more">
              <FaEllipsisV />
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<FaChartArea />}
              color={elevationProfileIsVisible ? 'blue' : undefined}
              onClick={() => handleMoreSelect('toggle-elevation-chart')}
            >
              {m?.general.elevationProfile ?? '…'}
            </Menu.Item>

            <Menu.Item
              leftSection={<FaPencilAlt />}
              onClick={() => handleMoreSelect('convert-to-drawing')}
            >
              {m?.general.convertToDrawing ?? '…'}
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              leftSection={
                milestones === 'abs' ? <FaRegCheckSquare /> : <FaRegSquare />
              }
              onClick={() => handleMoreSelect('toggle-milestones-km')}
            >
              {m?.routePlanner.milestones ?? '…'} (km)
            </Menu.Item>

            <Menu.Item
              leftSection={
                milestones === 'rel' ? <FaRegCheckSquare /> : <FaRegSquare />
              }
              onClick={() => handleMoreSelect('toggle-milestones-%')}
            >
              {m?.routePlanner.milestones ?? '…'} (%)
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </ToolMenu>
  );
}
