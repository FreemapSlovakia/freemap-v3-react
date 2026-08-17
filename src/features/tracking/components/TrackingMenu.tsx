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
import { usePremiumColorizeLock } from '@shared/colorizers/components/usePremiumColorizeLock.js';
import {
  ColorizingModeSchema,
  colorizers,
  colorizingModes,
} from '@shared/colorizers/index.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useColorizerMessages } from '@shared/colorizers/translations/useColorizerMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { Feature, LineString } from 'geojson';
import { type ReactElement, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaBullseye,
  FaChartArea,
  FaMobileAlt,
  FaPalette,
  FaRegEye,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { resolveChartTrack } from '../chartTrack.js';
import { trackingActions } from '../model/actions.js';
import { trackPointsToFeature } from '../trackGeojson.js';
import { hasDrawableSegment } from '../tracks.js';
import { useTrackingMessages } from '../translations/useTrackingMessages.js';
import { TrackingConvertMenu } from './TrackingConvertMenu.js';

export default TrackingMenu;

export function TrackingMenu(): ReactElement {
  const m = useMessages();

  const tm = useTrackingMessages();

  const cm = useColorizerMessages();

  const dispatch = useDispatch();

  const online = useOnline();

  const showPoints = useAppSelector(
    (state) => state.trackingSettings.showPoints,
  );

  const showLine = useAppSelector((state) => state.trackingSettings.showLine);

  const colorizeBy = useUnlockedColorizingMode(
    useAppSelector((state) => state.trackingSettings.colorizeBy),
  );

  const premiumColorize = usePremiumColorizeLock();

  const colorizeLegend = useAppSelector(
    (state) => state.trackingSettings.colorizeLegend,
  );

  const tracks = useAppSelector((state) => state.tracking.tracks);

  const trackedDevices = useAppSelector(
    (state) => state.tracking.trackedDevices,
  );

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

  const convertible = useMemo(
    () => hasDrawableSegment(tracks, trackedDevices),
    [tracks, trackedDevices],
  );

  return (
    <>
      <ToolMenu tool="tracking">
        <LongPressTooltip
          breakpoint="md"
          label={tm?.trackedDevices.button}
          kbd="g w"
        >
          {({ label, labelClassName, props }) => (
            <Button
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

        {/* Watched devices are kept in the browser, so that list is edited
            offline too; a device of one's own lives on the server. */}
        <LongPressTooltip breakpoint="md" label={tm?.devices.button} kbd="g d">
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              disabled={!online}
              onClick={() => dispatch(setActiveModal({ type: 'tracking-my' }))}
              {...props}
            >
              <FaMobileAlt />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <SelectDropdown
          id="tracking_visual"
          breakpoint="lg"
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
          id="tracking_colorize"
          breakpoint="lg"
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
            ...[undefined, ...colorizingModes].map((mode) => {
              const { locked, gem } = premiumColorize(mode);

              return {
                value: mode ?? 'none',
                label: cm?.mode[mode ?? 'none'],
                disabled:
                  locked || (mode !== undefined && !isModeAvailable(mode)),
                extra: gem,
              };
            }),
          ]}
        />

        {chartTrack && (
          <LongPressTooltip breakpoint="sm" label={m?.general.elevationProfile}>
            {({ label, labelClassName, props }) => (
              <Button
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

        {convertible && <TrackingConvertMenu />}
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
