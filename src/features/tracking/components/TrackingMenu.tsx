import { setActiveModal } from '@app/store/actions.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
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
import type { Feature, LineString } from 'geojson';
import { type ReactElement, useMemo } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaChartArea,
  FaMobileAlt,
  FaPaintBrush,
  FaRegEye,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import type { TrackPoint } from '../model/types.js';
import { trackPointsToFeature } from '../trackGeojson.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';

export default TrackingMenu;

export function TrackingMenu(): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

  const cm = useColorizerMessages();

  const dispatch = useDispatch();

  const showPoints = useAppSelector((state) => state.tracking.showPoints);

  const showLine = useAppSelector((state) => state.tracking.showLine);

  const colorizeBy = useAppSelector((state) => state.tracking.colorizeBy);

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const selectedToken = useAppSelector((state) =>
    state.main.selection?.type === 'tracking'
      ? state.main.selection.id
      : undefined,
  );

  const elevationChartActive = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const display = (showPoints ? '1' : '0') + (showLine ? '1' : '0');

  const lineFeatures = useMemo<Feature<LineString>[]>(
    () => tracks.map((t) => trackPointsToFeature(t.trackPoints)),
    [tracks],
  );

  const isModeAvailable = (mode: (typeof colorizingModes)[number]) => {
    const { isAvailable } = colorizers[mode];

    return !isAvailable || isAvailable(lineFeatures);
  };

  // The chart needs a track that actually carries elevation; prefer the
  // selected one, else the first that has it.
  const chartTrack = useMemo(() => {
    const withElevation = tracks.filter((t) => hasElevation(t.trackPoints));

    return (
      withElevation.find((t) => t.token === selectedToken) ?? withElevation[0]
    );
  }, [tracks, selectedToken]);

  return (
    <ToolMenu>
      <LongPressTooltip breakpoint="sm" label={tm?.trackedDevices.button}>
        {({ label, labelClassName, props }) => (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => dispatch(setActiveModal('tracking-watched'))}
            {...props}
          >
            <FaRegEye />
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>

      <LongPressTooltip breakpoint="sm" label={tm?.devices.button}>
        {({ label, labelClassName, props }) => (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => dispatch(setActiveModal('tracking-my'))}
            {...props}
          >
            <FaMobileAlt />
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>

      <Dropdown
        className="ms-1"
        onSelect={(key) => {
          const [points, line] = (key ?? '11')
            .split('')
            .map((n) => n === '1') as [boolean, boolean];

          dispatch(trackingActions.setShowPoints(points));

          dispatch(trackingActions.setShowLine(line));
        }}
      >
        <Dropdown.Toggle id="tracking_visual" variant="secondary">
          <FaRegEye /> {m?.general.visual}
        </Dropdown.Toggle>

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          <Dropdown.Item eventKey="10" active={display === '10'}>
            {tm?.visual.points}
          </Dropdown.Item>

          <Dropdown.Item eventKey="01" active={display === '01'}>
            {tm?.visual.line}
          </Dropdown.Item>

          <Dropdown.Item eventKey="11" active={display === '11'}>
            {tm?.visual['line+points']}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown
        className="ms-1"
        onSelect={(mode) => {
          dispatch(
            trackingActions.setColorizeBy(
              ColorizingModeSchema.nullable().parse(mode),
            ),
          );
        }}
      >
        <Dropdown.Toggle id="tracking_colorize" variant="secondary">
          <FaPaintBrush /> {cm?.mode[colorizeBy ?? 'none']}
        </Dropdown.Toggle>

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          {[undefined, ...colorizingModes].map((mode) => (
            <Dropdown.Item
              eventKey={mode}
              key={mode || 'none'}
              active={mode === colorizeBy}
              disabled={mode !== undefined && !isModeAvailable(mode)}
            >
              {cm?.mode[mode ?? 'none']}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {chartTrack && (
        <LongPressTooltip breakpoint="sm" label={m?.general.elevationProfile}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              active={elevationChartActive}
              onClick={() => {
                if (elevationChartActive) {
                  dispatch(elevationChartClose());
                } else {
                  // Recorded altitude is used as-is (keepRecorded); live points
                  // stream in, so nothing is fetched or cached.
                  dispatch(
                    elevationChartSetTrackGeojson(
                      trackPointsToFeature(chartTrack.trackPoints),
                      true,
                    ),
                  );
                }
              }}
              {...props}
            >
              <FaChartArea />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}
    </ToolMenu>
  );
}

function hasElevation(points: TrackPoint[]): boolean {
  let n = 0;

  for (const p of points) {
    if (
      typeof p.altitude === 'number' &&
      Number.isFinite(p.altitude) &&
      ++n >= 2
    ) {
      return true;
    }
  }

  return false;
}
