import {
  closeTool,
  openTool,
  setActiveModal,
  ToolSchema,
} from '@app/store/actions.js';
import {
  openDrawToolSelector,
  trackGeojsonIsSuitableForElevationChart,
} from '@app/store/selectors.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { colorizeModeOptions } from '@shared/colorizers/colorizeModeOptions.js';
import {
  LEGEND_ITEM,
  legendToggleOption,
} from '@shared/colorizers/components/legendToggleOption.js';
import { usePremiumColorizeLock } from '@shared/colorizers/components/usePremiumColorizeLock.js';
import {
  colorizerNeedsElevation,
  colorizers,
  colorizingModes,
} from '@shared/colorizers/index.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useColorizerMessages } from '@shared/colorizers/translations/useColorizerMessages.js';
import { BatchPropertiesItems } from '@shared/components/BatchPropertiesItems.js';
import { Chord } from '@shared/components/Chord.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { UnsavedWarningIcon } from '@shared/components/UnsavedWarningIcon.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Feature, LineString } from 'geojson';
import { type ReactElement, useMemo } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaCompressAlt,
  FaEllipsisV,
  FaMountain,
  FaMousePointer,
  FaPaintBrush,
  FaPalette,
  FaSave,
  FaUpload,
} from 'react-icons/fa';
import { SiOpenstreetmap } from 'react-icons/si';
import { useDispatch } from 'react-redux';
import { dataViewerBatchCounts } from '../featureEditing.js';
import { useSimplifyData } from '../hooks/useSimplifyData.js';
import {
  ColorizingModeSchema,
  dataViewerColorizeTrackBy,
  dataViewerSetColorizeLegend,
  dataViewerSetElevationPrompt,
} from '../model/actions.js';
import { targetsCoverage } from '../model/elevationTargets.js';
import { inLinkSelector } from '../model/urlForm.js';
import { hasOsmTraceLine } from '../osmTrace.js';
import { isSimplifiable } from '../simplifyTrack.js';
import { isRecording } from '../trackChannels.js';
import { trackLineParts } from '../trackLineParts.js';
import { isTrackLine } from '../trackSelection.js';
import { loadDataViewerMessages } from '../translations/loadDataViewerMessages.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

export default DataViewerMenu;

export function DataViewerMenu(): ReactElement {
  const m = useMessages();

  const tvm = useDataViewerMessages();

  const dm = useDrawingMessages();

  const cm = useColorizerMessages();

  const dispatch = useDispatch();

  const simplify = useSimplifyData();

  const drawTool = useAppSelector(openDrawToolSelector);

  const inLink = useAppSelector(inLinkSelector);

  const features = useAppSelector(
    (state) => state.trackViewer.trackGeojson?.features,
  );

  const hasTrack = features !== undefined;

  const batchCounts = useMemo(
    () => dataViewerBatchCounts(features ?? []),
    [features],
  );

  const canUpload = useAppSelector((state) => !state.trackViewer.trackUID);

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  // With a map active, the active-map toolbar already offers "Save" (which
  // persists the track as part of the map), so don't also offer a new map here.
  const hasActiveMap = useAppSelector((state) =>
    Boolean(state.myMaps.activeMap),
  );

  // Data that is in no saved map and that the link doesn't carry exists nowhere
  // but this browser. A reload does put it back (`trackStore.ts`), but that copy
  // goes with the browser's storage, so it still deserves saying.
  const unsaved = hasTrack && !hasActiveMap && canUpload && !inLink;

  const handleSaveAsMap = () => {
    if (loggedIn) {
      dispatch(setActiveModal({ type: 'my-maps', add: true }));
    } else {
      dispatch(
        toastsAdd({
          id: 'dataViewer.loginToSaveMap',
          messageKey: 'loginToSaveMap',
          messageLoader: loadDataViewerMessages,
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
  };

  const colorizeTrackBy = useUnlockedColorizingMode(
    useAppSelector((state) => state.trackViewerSettings.colorizeTrackBy),
  );

  const premiumColorize = usePremiumColorizeLock();

  const colorizeLegend = useAppSelector(
    (state) => state.trackViewerSettings.colorizeLegend,
  );

  const elevationDecision = useAppSelector(
    (state) => state.trackViewer.elevationDecision,
  );

  // Colorizing and the elevation update are about lines; a file of waypoints or
  // polygons alone is offered neither.
  const hasLines = useAppSelector(trackGeojsonIsSuitableForElevationChart);

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  // Derived from the stable trackGeojson reference rather than a fresh array per
  // render, so consumers — mode availability, elevation coverage, the colorize
  // legend's memo — don't recompute on every unrelated store dispatch.
  const lineFeatures = useMemo<Feature<LineString>[]>(
    () => trackLineParts(trackGeojson),
    [trackGeojson],
  );

  const canUploadToOsm = useMemo(
    () => hasOsmTraceLine(trackGeojson),
    [trackGeojson],
  );

  // Points alone have nothing a tolerance could thin.
  const canSimplify = useMemo(
    () => (trackGeojson?.features ?? []).some(isSimplifiable),
    [trackGeojson],
  );

  const isModeAvailable = (mode: (typeof colorizingModes)[number]) => {
    const { isAvailable } = colorizers[mode];

    return !isAvailable || isAvailable(lineFeatures);
  };

  const canUpdateElevation = useMemo(
    () => targetsCoverage(trackGeojson) !== undefined,
    [trackGeojson],
  );

  // Only ask how to fill a recording's elevation when some is missing and the
  // user hasn't decided yet; any other line is drawn from the terrain model.
  const recordingsCoverage = useMemo(() => {
    const recordings = (trackGeojson?.features ?? [])
      .filter(isTrackLine)
      .filter(isRecording);

    return recordings.length ? elevationCoverage(recordings) : 'full';
  }, [trackGeojson]);

  const needsElevationDecision =
    recordingsCoverage !== 'full' && elevationDecision === 'undecided';

  const handleMoreSelect = (eventKey: string | null) => {
    switch (eventKey) {
      case 'default-style':
        dispatch(setActiveModal({ type: 'drawing-properties' }));

        break;

      case 'update-elevation':
        // The prompt asks only what the coverage leaves open.
        dispatch(dataViewerSetElevationPrompt({ type: 'update' }));

        break;

      case 'save-as-map':
        handleSaveAsMap();

        break;

      case 'simplify':
        void simplify();

        break;

      case 'upload-to-osm':
        dispatch(setActiveModal({ type: 'track-viewer-osm-upload' }));

        break;
    }
  };

  return (
    <ToolMenu tool="import-file">
      {unsaved && (
        <UnsavedWarningIcon
          label={tvm?.unsaved}
          tooltip={tvm?.unsavedTooltip}
        />
      )}

      {/* Drawing is a mode of this toolbar: picking one takes map clicks. */}
      <SelectDropdown
        breakpoint="lg"
        name={m?.general.drawingTool}
        value={drawTool ?? 'none'}
        onSelect={(tool) => {
          if (tool === 'none') {
            if (drawTool) {
              dispatch(closeTool(drawTool));
            }
          } else {
            dispatch(openTool(ToolSchema.parse(tool)));
          }
        }}
        options={[
          {
            value: 'none',
            label: <Text k="general.noDrawingTool" />,
            icon: <FaMousePointer />,
          },
          ...toolDefinitions
            .filter((td) => td.draw)
            .map(({ tool, icon, msgKey: key, kbd }) => ({
              value: tool,
              label: <Text k={`selections.${key as 'drawPoints'}`} />,
              icon,
              kbd: `g ${kbd?.slice(3).toLowerCase()}`,
            })),
        ]}
      />

      {canUpload && (
        <LongPressTooltip breakpoint="sm" label={tvm?.upload}>
          {({ label, labelClassName, props }) => (
            <Button
              variant={hasTrack ? 'secondary' : 'primary'}
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
      {canUpload && hasTrack && <div className="vr align-self-stretch" />}

      {hasLines && (
        <SelectDropdown
          id="colorizing_mode"
          breakpoint="lg"
          toggleIcon={<FaPalette />}
          name={cm?.colorizeBy}
          value={colorizeTrackBy ?? 'none'}
          onSelect={(approach) => {
            if (approach === LEGEND_ITEM) {
              dispatch(dataViewerSetColorizeLegend());

              return;
            }

            const mode = ColorizingModeSchema.nullable().parse(
              approach === 'none' ? null : approach,
            );

            trackMatomo([
              'trackEvent',
              'TrackViewer',
              'colorize',
              mode ?? 'none',
            ]);

            // Elevation-derived modes route through the same fill prompt as
            // the chart, but only while elevation is missing and undecided;
            // otherwise apply directly.
            if (
              mode &&
              colorizerNeedsElevation(mode) &&
              needsElevationDecision
            ) {
              dispatch(
                dataViewerSetElevationPrompt({ type: 'colorize', mode }),
              );
            } else {
              dispatch(dataViewerColorizeTrackBy(mode));
            }
          }}
          options={[
            ...legendToggleOption(colorizeTrackBy, colorizeLegend, cm?.legend),
            // Span-based modes read what a router reported. A recording
            // carries none until it is matched to the network, and each
            // mode's own `isAvailable` is what decides once it has been.
            ...colorizeModeOptions({
              modes: colorizingModes,
              labels: cm?.mode,
              activeMode: colorizeTrackBy,
              premiumColorize,
              isAvailable: isModeAvailable,
            }),
          ]}
        />
      )}

      {/* Always there: the default style is wanted before anything is drawn. */}
      <Dropdown id="more" onSelect={handleMoreSelect}>
        <Dropdown.Toggle variant="secondary">
          <FaEllipsisV />
        </Dropdown.Toggle>

        <FmDropdownMenu>
          <Dropdown.Item as="button" eventKey="default-style">
            <FaPaintBrush />
            <MenuLabel>{dm?.defProps.menuItem}</MenuLabel>
            <MenuGutter>
              <Chord modal="drawing-properties" />
            </MenuGutter>
          </Dropdown.Item>

          {hasTrack && <Dropdown.Divider />}

          {canUpdateElevation && (
            <Dropdown.Item as="button" eventKey="update-elevation">
              <FaMountain />
              <MenuLabel>
                <Text m={tvm} k="elevationFill.update" />
              </MenuLabel>
            </Dropdown.Item>
          )}

          {canSimplify && (
            <Dropdown.Item as="button" eventKey="simplify">
              <FaCompressAlt />
              <MenuLabel>
                <Text m={tvm} k="simplifyAll" />
              </MenuLabel>
            </Dropdown.Item>
          )}

          {hasTrack && !hasActiveMap && (
            <Dropdown.Item as="button" eventKey="save-as-map">
              <FaSave />
              <MenuLabel>
                <Text m={tvm} k="saveAsMap" />
              </MenuLabel>
            </Dropdown.Item>
          )}

          {canUploadToOsm && (
            <Dropdown.Item as="button" eventKey="upload-to-osm">
              <SiOpenstreetmap />
              <MenuLabel>
                <Text m={tvm} k="osmUpload.menuItem" />
              </MenuLabel>
            </Dropdown.Item>
          )}

          <BatchPropertiesItems
            modal="data-viewer-batch-properties"
            counts={batchCounts}
            divided
          />
        </FmDropdownMenu>
      </Dropdown>
    </ToolMenu>
  );
}
