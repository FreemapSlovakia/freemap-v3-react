import { setActiveModal } from '@app/store/actions.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
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
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { type ReactElement, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaBullseye,
  FaChartArea,
  FaGem,
  FaMobileAlt,
  FaPalette,
  FaRegEye,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { resolveChartTrack } from '../chartTrack.js';
import { trackingActions } from '../model/actions.js';
import { trackPointsToFeature } from '../trackGeojson.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';

export default TrackingMenu;

export function TrackingMenu(): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

  const cm = useColorizerMessages();

  const dispatch = useDispatch();

  const showPoints = useAppSelector(
    (state) => state.trackingSettings.showPoints,
  );

  const showLine = useAppSelector((state) => state.trackingSettings.showLine);

  const colorizeBy = useAppSelector(
    (state) => state.trackingSettings.colorizeBy,
  );

  const colorizeLegend = useAppSelector(
    (state) => state.trackingSettings.colorizeLegend,
  );

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const selectedToken = useAppSelector((state) =>
    state.main.selection?.type === 'tracking'
      ? state.main.selection.id
      : undefined,
  );

  const elevationChartActive = useAppSelector(
    (state) => state.elevationChart.target?.type === 'tracking',
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

  // The button only shows when there's a track the chart can actually plot.
  const chartTrack = useMemo(
    () => resolveChartTrack(tracks, selectedToken),
    [tracks, selectedToken],
  );

  return (
    <>
      <ToolMenu tool="tracking">
        <LongPressTooltip
          breakpoint="sm"
          label={tm?.trackedDevices.button}
          kbd="g w"
        >
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() =>
                dispatch(setActiveModal({ type: 'tracking-watched' }))
              }
              {...props}
            >
              <FaRegEye />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip breakpoint="sm" label={tm?.devices.button} kbd="g d">
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() => dispatch(setActiveModal({ type: 'tracking-my' }))}
              {...props}
            >
              <FaMobileAlt />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <SelectDropdown
          className="ms-1"
          id="tracking_visual"
          breakpoint="sm"
          toggleIcon={<FaRegEye />}
          name={m?.general.visual}
          value={display}
          onSelect={(key) => {
            const [points, line] = (key ?? '11')
              .split('')
              .map((n) => n === '1') as [boolean, boolean];

            dispatch(trackingActions.setShowPoints(points));

            dispatch(trackingActions.setShowLine(line));
          }}
          options={[
            { value: '10', label: tm?.visual.points },
            { value: '01', label: tm?.visual.line },
            { value: '11', label: tm?.visual['line+points'] },
          ]}
        />

        <SelectDropdown
          className="ms-1"
          id="tracking_colorize"
          breakpoint="sm"
          toggleIcon={<FaPalette />}
          name={cm?.colorizeBy}
          value={colorizeBy ?? 'none'}
          onSelect={(mode) => {
            if (mode === LEGEND_ITEM) {
              dispatch(trackingActions.setColorizeLegend());

              return;
            }

            dispatch(
              trackingActions.setColorizeBy(
                ColorizingModeSchema.nullable().parse(
                  mode === 'none' ? null : mode,
                ),
              ),
            );
          }}
          options={[
            ...legendToggleOption(colorizeBy, colorizeLegend, cm?.legend),
            ...[undefined, ...colorizingModes].map((mode) => ({
              value: mode ?? 'none',
              label: cm?.mode[mode ?? 'none'],
              disabled: mode !== undefined && !isModeAvailable(mode),
              // Launch badge: every mode except the free trio is premium, shown
              // free for now. Tracked by hand — drop when the launch ends.
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
            })),
          ]}
        />

        {chartTrack && (
          <LongPressTooltip breakpoint="sm" label={m?.general.elevationProfile}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                active={elevationChartActive}
                onClick={() =>
                  dispatch(
                    elevationChartActive
                      ? elevationChartClose()
                      : elevationChartOpen({
                          type: 'tracking',
                          token: chartTrack.token,
                        }),
                  )
                }
                {...props}
              >
                <FaChartArea />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}
      </ToolMenu>

      {colorizeLegend && colorizeBy && (
        <ColorizeLegend
          mode={colorizeBy}
          icon={<FaBullseye />}
          features={lineFeatures}
        />
      )}
    </>
  );
}
