import { convertToDrawing, setActiveModal } from '@app/store/actions.js';
import { trackGeojsonIsSuitableForElevationChart } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ColorizeLegend } from '@shared/colorizers/components/ColorizeLegend.js';
import {
  LEGEND_ITEM,
  legendToggleOption,
} from '@shared/colorizers/components/legendToggleOption.js';
import {
  colorizerNeedsElevation,
  colorizers,
  colorizingModes,
} from '@shared/colorizers/index.js';
import { useColorizerMessages } from '@shared/colorizers/translations/useColorizerMessages.js';
import {
  useConfirm,
  useConfirmCancel,
} from '@shared/components/ConfirmProvider.js';
import { DeleteButton } from '@shared/components/DeleteButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { flatten } from '@turf/flatten';
import type { Feature, LineString } from 'geojson';
import { type ReactElement, useCallback, useMemo } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaChartArea,
  FaEllipsisV,
  FaFileImport,
  FaGem,
  FaInfoCircle,
  FaMountain,
  FaPaintBrush,
  FaPalette,
  FaPencilAlt,
  FaRoute,
  FaSave,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  ColorizingModeSchema,
  trackViewerColorizeTrackBy,
  trackViewerResolveElevationPrompt,
  trackViewerSetColorizeLegend,
  trackViewerSetElevationPrompt,
  trackViewerSetSelectedTrack,
  trackViewerToggleElevationChart,
} from '../model/actions.js';
import { trackInfoToast } from '../model/trackInfoToast.js';
import { featureKind } from '../provenance.js';
import { resolveActiveTrack, trackLineFeatures } from '../trackSelection.js';
import { loadTrackViewerMessages } from '../translations/loadTrackViewerMessages.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';
import TrackViewerElevationPromptModal from './TrackViewerElevationPromptModal.js';

export default TrackViewerMenu;

export function TrackViewerMenu(): ReactElement {
  const m = useMessages();

  const tvm = useTrackViewerMessages();

  const cm = useColorizerMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const cancelConfirm = useConfirmCancel();

  const hasTrack = useAppSelector((state) =>
    Boolean(state.trackViewer.trackGeojson),
  );

  const canUpload = useAppSelector((state) => !state.trackViewer.trackUID);

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  // With a map active, the active-map toolbar already offers "Save" (which
  // persists the track as part of the map), so don't also offer a new map here.
  const hasActiveMap = useAppSelector((state) =>
    Boolean(state.myMaps.activeMap),
  );

  const handleSaveAsMap = useCallback(() => {
    if (loggedIn) {
      dispatch(setActiveModal({ type: 'my-maps', add: true }));
    } else {
      dispatch(
        toastsAdd({
          id: 'trackViewer.loginToSaveMap',
          messageKey: 'loginToSaveMap',
          messageLoader: loadTrackViewerMessages,
          style: 'warning',
          actions: [
            {
              action: setActiveModal({ type: 'login' }),
              nameKey: 'mainMenu.logIn',
              variant: 'primary',
            },
          ],
        }),
      );
    }
  }, [dispatch, loggedIn]);

  const elevationChartActive = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const colorizeTrackBy = useAppSelector(
    (state) => state.trackViewer.colorizeTrackBy,
  );

  const colorizeLegend = useAppSelector(
    (state) => state.trackViewer.colorizeLegend,
  );

  const elevationDecision = useAppSelector(
    (state) => state.trackViewer.elevationDecision,
  );

  const enableElevationChart = useAppSelector(
    trackGeojsonIsSuitableForElevationChart,
  );

  // The line-like features (each track/route as one entry, multi-segment
  // included) the user picks among when several are loaded.
  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  // Derived from the stable trackGeojson reference rather than a fresh array per
  // render, so consumers — mode availability, elevation coverage, the colorize
  // legend's memo — don't recompute on every unrelated store dispatch.
  const lineFeatures = useMemo<Feature<LineString>[]>(
    () =>
      trackGeojson
        ? (flatten(trackGeojson).features.filter(
            (f) => f.geometry?.type === 'LineString',
          ) as Feature<LineString>[])
        : [],
    [trackGeojson],
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

  // Only a dense GPS recording (`fm:kind === 'track'`) is worth simplifying —
  // otherwise the drawing carries thousands of editable vertices. Routes and
  // generic imported geometry convert at full fidelity with no prompt.
  const hasDenseTrack = (trackGeojson?.features ?? []).some(
    (f) => featureKind(f) === 'track',
  );

  const handleConvertToDrawing = useCallback(() => {
    let tolerance = 0;

    // A single prompt for a dense recording: it both warns that the recorded
    // data is dropped (the track is replaced) and asks for a simplification
    // factor; Cancel aborts. Routes and generic geometry have nothing rich to
    // lose and aren't worth simplifying, so they convert straight away.
    if (hasDenseTrack) {
      const answer = window.prompt(
        `${tvm?.convertLossWarning}\n\n${m?.general.simplifyPrompt}`,
        '50',
      );

      if (answer === null) {
        return;
      }

      tolerance = Number(answer || '0') / 100000;
    }

    dispatch(convertToDrawing({ type: 'track', tolerance }));
  }, [dispatch, m, tvm, hasDenseTrack]);

  const handleUpdateElevation = useCallback(async () => {
    // With only some points missing, defer to the adaptive modal so the user
    // can fill just the gaps instead of overwriting the recorded values.
    if (coverage === 'partial') {
      dispatch(trackViewerSetElevationPrompt({ type: 'update' }));

      return;
    }

    // A fully-elevated track has no gaps to fill, so overwriting from the
    // server is the only update — a plain confirm is enough. A success toast
    // reports the outcome afterwards.
    if (
      await confirm({
        title: tvm?.elevationFill.title,
        message: (
          <>
            <p className="mb-0">{tvm?.elevationFill.updateConfirm}</p>

            <p className="text-body-secondary small mb-0 mt-2">
              {tvm?.elevationFill.premiumHiRes((label) => (
                <PremiumGem label={label} onBeforeNavigate={cancelConfirm} />
              ))}
            </p>
          </>
        ),
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
  }, [coverage, dispatch, confirm, cancelConfirm, tvm]);

  const handleMoreSelect = (eventKey: string | null) => {
    switch (eventKey) {
      case 'update-elevation':
        void handleUpdateElevation();

        break;

      case 'save-as-map':
        handleSaveAsMap();

        break;

      case 'convert-to-drawing':
        handleConvertToDrawing();

        break;

      case 'edit-style':
        dispatch(setActiveModal({ type: 'track-viewer-style' }));

        break;
    }
  };

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
            asSelect
            className="ms-1"
            id="track_selector"
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

        {enableElevationChart && (
          <SelectDropdown
            className="ms-1"
            id="colorizing_mode"
            breakpoint="sm"
            toggleIcon={<FaPalette />}
            name={cm?.colorizeBy}
            value={colorizeTrackBy ?? 'none'}
            onSelect={(approach) => {
              if (approach === LEGEND_ITEM) {
                dispatch(trackViewerSetColorizeLegend());

                return;
              }

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
            options={[
              ...legendToggleOption(
                colorizeTrackBy,
                colorizeLegend,
                cm?.legend,
              ),
              ...[undefined, ...colorizingModes].map((mode) => ({
                value: mode ?? 'none',
                label: cm?.mode[mode ?? 'none'],
                disabled: mode !== undefined && !isModeAvailable(mode),
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
              })),
            ]}
          />
        )}

        {enableElevationChart && (
          <LongPressTooltip breakpoint="md" label={tvm?.moreInfo}>
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

        {hasTrack && (
          <Dropdown className="ms-1" id="more" onSelect={handleMoreSelect}>
            <Dropdown.Toggle variant="secondary">
              <FaEllipsisV />
            </Dropdown.Toggle>

            <Dropdown.Menu popperConfig={fixedPopperConfig}>
              <Dropdown.Item eventKey="edit-style">
                <FaPaintBrush /> &nbsp;{tvm?.style.title ?? '…'}
              </Dropdown.Item>

              {enableElevationChart && canUpdateElevation && (
                <Dropdown.Item eventKey="update-elevation">
                  <FaMountain /> &nbsp;{tvm?.elevationFill.update ?? '…'}
                </Dropdown.Item>
              )}

              {!hasActiveMap && (
                <Dropdown.Item eventKey="save-as-map">
                  <FaSave /> &nbsp;{tvm?.saveAsMap ?? '…'}
                </Dropdown.Item>
              )}

              <Dropdown.Item eventKey="convert-to-drawing">
                <FaPencilAlt /> &nbsp;{m?.general.convertToDrawing ?? '…'}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}

        {hasTrack && <DeleteButton />}
      </ToolMenu>

      {enableElevationChart && colorizeLegend && colorizeTrackBy && (
        <ColorizeLegend
          mode={colorizeTrackBy}
          icon={<FaFileImport />}
          features={lineFeatures}
        />
      )}
    </>
  );
}
