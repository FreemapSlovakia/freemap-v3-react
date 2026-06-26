import { convertToDrawing, setActiveModal } from '@app/store/actions.js';
import { trackGeojsonIsSuitableForElevationChart } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  colorizerNeedsElevation,
  colorizers,
  colorizingModes,
} from '@shared/colorizers/index.js';
import { useColorizerMessages } from '@shared/colorizers/translations/useColorizerMessages.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { flatten } from '@turf/flatten';
import type { Feature, LineString } from 'geojson';
import { type ReactElement, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaChartArea,
  FaCloudUploadAlt,
  FaGem,
  FaInfoCircle,
  FaMountain,
  FaPaintBrush,
  FaPencilAlt,
  FaRoute,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  ColorizingModeSchema,
  trackViewerColorizeTrackBy,
  trackViewerResolveElevationPrompt,
  trackViewerSetElevationPrompt,
  trackViewerSetSelectedTrack,
  trackViewerToggleElevationChart,
  trackViewerUploadTrack,
} from '../model/actions.js';
import { trackInfoToast } from '../model/trackInfoToast.js';
import { resolveActiveTrack, trackLineFeatures } from '../trackSelection.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';
import TrackViewerElevationPromptModal from './TrackViewerElevationPromptModal.js';

export default TrackViewerMenu;

export function TrackViewerMenu(): ReactElement {
  const m = useMessages();

  const tvm = useTrackViewerMessages();

  const cm = useColorizerMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const hasTrack = useAppSelector((state) =>
    Boolean(state.trackViewer.trackGeojson),
  );

  const canUpload = useAppSelector((state) => !state.trackViewer.trackUID);

  const elevationChartActive = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const colorizeTrackBy = useAppSelector(
    (state) => state.trackViewer.colorizeTrackBy,
  );

  const elevationDecision = useAppSelector(
    (state) => state.trackViewer.elevationDecision,
  );

  const enableElevationChart = useAppSelector(
    trackGeojsonIsSuitableForElevationChart,
  );

  const lineFeatures = useAppSelector((state) => {
    const gj = state.trackViewer.trackGeojson;

    return gj
      ? (flatten(gj).features.filter(
          (f) => f.geometry?.type === 'LineString',
        ) as Feature<LineString>[])
      : [];
  });

  // The line-like features (each track/route as one entry, multi-segment
  // included) the user picks among when several are loaded.
  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const selectedTrackIndex = useAppSelector(
    (state) => state.trackViewer.selectedTrackIndex,
  );

  const trackLines = trackLineFeatures(trackGeojson);

  const activeTrackIndex = resolveActiveTrack(
    trackGeojson,
    selectedTrackIndex,
  )?.index;

  const isModeAvailable = (mode: (typeof colorizingModes)[number]) => {
    const { isAvailable } = colorizers[mode];

    return !isAvailable || isAvailable(lineFeatures);
  };

  const coverage = elevationCoverage(lineFeatures);

  // Overriding from the server makes sense only while the track still has some
  // recorded elevation to replace and hasn't already been fully overridden.
  const canUpdateElevation = coverage !== 'none' && elevationDecision !== 'all';

  // Only ask how to fill elevation when some is actually missing and the user
  // hasn't decided yet. Tracks that already have full elevation proceed
  // straight away — the explicit "update" button covers overriding them.
  const needsElevationDecision =
    coverage !== 'full' && elevationDecision === 'undecided';

  const handleConvertToDrawing = useCallback(() => {
    const tolerance = window.prompt(m?.general.simplifyPrompt, '50');

    if (tolerance !== null) {
      dispatch(
        convertToDrawing({
          type: 'track',
          tolerance: Number(tolerance || '0') / 100000,
        }),
      );
    }
  }, [dispatch, m]);

  return (
    <>
      <TrackViewerElevationPromptModal />

      <ToolMenu tool="import-file">
        {canUpload && (
          <LongPressTooltip breakpoint="sm" label={tvm?.upload}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => {
                  dispatch(setActiveModal({ type: 'file-import' }));
                }}
                {...props}
              >
                <FaUpload />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {/* Separate the import action from the loaded-track actions. */}
        {canUpload && hasTrack && (
          <div className=" ms-1 vr align-self-stretch" />
        )}

        {/* Pick which track the chart / "more info" act on, shown only when
            several lines are loaded. */}
        {trackLines.length > 1 && (
          <SelectDropdown
            className="ms-1"
            id="track_selector"
            breakpoint="sm"
            toggleIcon={<FaRoute />}
            name={tvm?.trackLabel}
            value={String(activeTrackIndex ?? '')}
            onSelect={(value) => {
              dispatch(trackViewerSetSelectedTrack(Number(value)));
            }}
            options={trackLines.map(({ feature, index }, i) => ({
              value: String(index),
              label:
                (feature.properties?.['name'] as string | undefined) ||
                tvm?.unnamedTrack({ n: i + 1 }),
            }))}
          />
        )}

        {enableElevationChart && (
          <LongPressTooltip breakpoint="sm" label={m?.general.elevationProfile}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                active={elevationChartActive}
                onClick={() => {
                  dispatch(trackViewerToggleElevationChart());
                }}
                {...props}
              >
                <FaChartArea />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {enableElevationChart && canUpdateElevation && (
          <LongPressTooltip breakpoint="sm" label={tvm?.elevationFill.update}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={async () => {
                  // With only some points missing, defer to the adaptive modal
                  // so the user can fill just the gaps instead of overwriting
                  // the recorded values.
                  if (coverage === 'partial') {
                    dispatch(trackViewerSetElevationPrompt({ type: 'update' }));

                    return;
                  }

                  // A fully-elevated track has no gaps to fill, so overwriting
                  // from the server is the only update — a plain confirm is
                  // enough. A success toast reports the outcome afterwards.
                  if (
                    await confirm({
                      title: tvm?.elevationFill.title,
                      message: tvm?.elevationFill.updateConfirm,
                      confirmLabel: tvm?.elevationFill.update,
                    })
                  ) {
                    dispatch(
                      trackViewerResolveElevationPrompt({
                        mode: 'all',
                        consumer: { type: 'update' },
                      }),
                    );
                  }
                }}
                {...props}
              >
                <FaMountain />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {enableElevationChart && (
          <SelectDropdown
            className="ms-1"
            id="colorizing_mode"
            breakpoint="sm"
            toggleIcon={<FaPaintBrush />}
            name={cm?.colorizeBy}
            value={colorizeTrackBy ?? 'none'}
            onSelect={(approach) => {
              const mode = ColorizingModeSchema.nullable().parse(
                approach === 'none' ? null : approach,
              );

              // Elevation-derived modes route through the same fill prompt as
              // the chart, but only while elevation is missing and undecided;
              // otherwise apply directly.
              if (
                mode &&
                colorizerNeedsElevation(mode) &&
                needsElevationDecision
              ) {
                dispatch(
                  trackViewerSetElevationPrompt({ type: 'colorize', mode }),
                );
              } else {
                dispatch(trackViewerColorizeTrackBy(mode));
              }
            }}
            options={[undefined, ...colorizingModes].map((mode) => ({
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
            }))}
          />
        )}

        {enableElevationChart && (
          <LongPressTooltip breakpoint="sm" label={tvm?.moreInfo}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => {
                  // The info stats depend on elevation, so settle it first when
                  // some is missing and the user hasn't decided yet.
                  if (needsElevationDecision) {
                    dispatch(trackViewerSetElevationPrompt({ type: 'info' }));
                  } else {
                    dispatch(trackInfoToast);
                  }
                }}
                {...props}
              >
                <FaInfoCircle />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {canUpload && hasTrack && (
          <LongPressTooltip breakpoint="sm" label={tvm?.share}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => dispatch(trackViewerUploadTrack())}
                {...props}
              >
                <FaCloudUploadAlt />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {hasTrack && (
          <LongPressTooltip breakpoint="sm" label={m?.general.convertToDrawing}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={handleConvertToDrawing}
                {...props}
              >
                <FaPencilAlt />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {hasTrack && <DeleteButton />}
      </ToolMenu>
    </>
  );
}
