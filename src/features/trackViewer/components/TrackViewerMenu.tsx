import { convertToDrawing, setActiveModal } from '@app/store/actions.js';
import { trackGeojsonIsSuitableForElevationChart } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { flatten } from '@turf/flatten';
import type { Feature, LineString } from 'geojson';
import { type ReactElement, useCallback } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaChartArea,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaMountain,
  FaPaintBrush,
  FaPencilAlt,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  colorizerNeedsElevation,
  colorizers,
  colorizingModes,
} from '../colorizers/index.js';
import {
  ColorizingModeSchema,
  trackViewerColorizeTrackBy,
  trackViewerResolveElevationPrompt,
  trackViewerSetElevationPrompt,
  trackViewerToggleElevationChart,
  trackViewerUploadTrack,
} from '../model/actions.js';
import { trackInfoToast } from '../model/trackInfoToast.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';
import TrackViewerElevationPromptModal from './TrackViewerElevationPromptModal.js';

export default TrackViewerMenu;

export function TrackViewerMenu(): ReactElement {
  const m = useMessages();

  const tvm = useTrackViewerMessages();

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

  const elevationResolved = useAppSelector(
    (state) => state.trackViewer.elevationResolved,
  );

  const elevationOverridden = useAppSelector(
    (state) => state.trackViewer.elevationOverridden,
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

  const isModeAvailable = (mode: (typeof colorizingModes)[number]) => {
    const { isAvailable } = colorizers[mode];

    return !isAvailable || isAvailable(lineFeatures);
  };

  const coverage = elevationCoverage(lineFeatures);

  // Overriding from the server makes sense only while the track still has some
  // recorded elevation to replace and hasn't already been fully overridden.
  const canUpdateElevation = coverage !== 'none' && !elevationOverridden;

  // Only ask how to fill elevation when some is actually missing and the user
  // hasn't decided yet. Tracks that already have full elevation proceed
  // straight away — the explicit "update" button covers overriding them.
  const needsElevationDecision = coverage !== 'full' && !elevationResolved;

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

      <ToolMenu>
        {canUpload && (
          <LongPressTooltip breakpoint="sm" label={tvm?.upload}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => {
                  dispatch(setActiveModal('file-import'));
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
                  // The button means "overwrite from the server", so a plain
                  // confirm is enough — no need for the adaptive fill/keep
                  // modal. Show the info toast afterwards.
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
                        consumer: { type: 'info' },
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
          <Dropdown
            className="ms-1"
            onSelect={(approach) => {
              const mode = ColorizingModeSchema.nullable().parse(approach);

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
          >
            <Dropdown.Toggle id="colorizing_mode" variant="secondary">
              <FaPaintBrush /> {tvm?.colorizingMode[colorizeTrackBy ?? 'none']}
            </Dropdown.Toggle>

            <Dropdown.Menu popperConfig={fixedPopperConfig}>
              {[undefined, ...colorizingModes].map((mode) => (
                <Dropdown.Item
                  eventKey={mode}
                  key={mode || 'none'}
                  active={mode === colorizeTrackBy}
                  disabled={mode !== undefined && !isModeAvailable(mode)}
                >
                  {tvm?.colorizingMode[mode ?? 'none']}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
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
