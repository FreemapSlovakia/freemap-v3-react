import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { OpenInExternalAppMenuButton } from '@features/openInExternalApp/components/OpenInExternalAppMenuButton.js';
import { toastsRemove } from '@features/toasts/model/actions.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { RouteEndpointItems } from '@shared/components/RouteEndpointItems.js';
import { Selection } from '@shared/components/Selection.js';
import { ViewFromHereItems } from '@shared/components/ViewFromHereItems.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature } from 'geojson';
import type { ReactElement } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaChartArea,
  FaCheck,
  FaCompressAlt,
  FaDrawPolygon,
  FaEllipsisV,
  FaInfoCircle,
  FaMagic,
  FaMapMarkerAlt,
  FaPencilAlt,
} from 'react-icons/fa';
import { RiScissorsFill } from 'react-icons/ri';
import { TbArrowsSplit, TbTimeline } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { useConvertTrackToDrawing } from '../hooks/useConvertTrackToDrawing.js';
import { useSimplifyData } from '../hooks/useSimplifyData.js';
import {
  dataViewerExplodeTrack,
  dataViewerSetElevationPrompt,
  dataViewerSetSplitting,
  dataViewerSplitTrack,
  dataViewerToggleElevationChart,
} from '../model/actions.js';
import {
  TRACK_INFO_TOAST_ID,
  trackInfoToast,
} from '../model/trackInfoToast.js';
import { isSimplifiable } from '../simplifyTrack.js';
import { isExplodable, isSplittable } from '../splitTrack.js';
import { isTrackLine, trackLineFeatures } from '../trackSelection.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

export default function DataViewerSelection(): ReactElement | null {
  const m = useMessages();

  const dvm = useDataViewerMessages();

  const dispatch = useDispatch();

  const convertToDrawing = useConvertTrackToDrawing();

  const simplify = useSimplifyData();

  const index = useAppSelector((state) =>
    state.main.selection?.type === 'data-viewer'
      ? state.main.selection.id
      : undefined,
  );

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const feature: Feature | undefined =
    index === undefined ? undefined : trackGeojson?.features[index];

  const elevationDecision = useAppSelector(
    (state) => state.trackViewer.elevationDecision,
  );

  const elevationChartActive = useAppSelector(
    (state) => state.elevationChart.target?.type === 'track-viewer',
  );

  const trackInfoActive = useAppSelector(
    (state) => TRACK_INFO_TOAST_ID in state.toasts.toasts,
  );

  const splitting = useAppSelector((state) => state.trackViewer.splitting);

  const splitPoint = useAppSelector((state) => state.trackViewer.splitPoint);

  const line =
    feature !== undefined && isTrackLine(feature) ? feature : undefined;

  if (!feature || index === undefined) {
    return null;
  }

  const handleMoreSelect = (eventKey: string | null) => {
    switch (eventKey) {
      case 'convert-to-drawing':
        void convertToDrawing(index);

        break;

      case 'simplify':
        void simplify(index);

        break;

      case 'match-to-network':
        dispatch(setActiveModal({ type: 'track-viewer-match' }));

        break;

      case 'explode':
        dispatch(dataViewerExplodeTrack(index));

        break;
    }
  };

  const geometryType = feature.geometry.type;

  const isPoint = geometryType === 'Point' || geometryType === 'MultiPoint';

  const name = feature.properties?.['name'];

  // Unnamed features are told apart by their kind, a line additionally by its
  // position among the loaded lines.
  const label =
    (typeof name === 'string' && name) ||
    (line
      ? dvm?.unnamedTrack({
          n:
            trackLineFeatures(trackGeojson).findIndex(
              (candidate) => candidate.index === index,
            ) + 1,
        })
      : isPoint
        ? m?.selections.drawPoints
        : m?.selections.drawPolygons);

  // A MultiPoint has no single position; its first stands for the feature the
  // toolbar acts on.
  const [lon, lat] =
    feature.geometry.type === 'Point'
      ? feature.geometry.coordinates
      : feature.geometry.type === 'MultiPoint'
        ? (feature.geometry.coordinates[0] ?? [])
        : [];

  return (
    <Selection
      icon={
        line ? <TbTimeline /> : isPoint ? <FaMapMarkerAlt /> : <FaDrawPolygon />
      }
      label={label}
      deletable
    >
      {line && (
        <LongPressTooltip breakpoint="md" label={m?.general.elevationProfile}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              active={elevationChartActive}
              onClick={() => {
                dispatch(dataViewerToggleElevationChart());
              }}
              {...props}
            >
              <FaChartArea />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {line && (
        <LongPressTooltip breakpoint="md" label={dvm?.moreInfo}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              active={trackInfoActive}
              onClick={() => {
                // The stats depend on elevation, so settle it first when some
                // is missing and the user hasn't decided yet. Measured here
                // rather than per render: it walks every coordinate.
                if (trackInfoActive) {
                  dispatch(toastsRemove(TRACK_INFO_TOAST_ID));
                } else if (
                  elevationDecision === 'undecided' &&
                  elevationCoverage([line]) !== 'full'
                ) {
                  dispatch(dataViewerSetElevationPrompt({ type: 'info' }));
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

      {line && isSplittable(line) && (
        <LongPressTooltip breakpoint="md" label={dvm?.split.action}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              active={splitting}
              onClick={() => {
                dispatch(dataViewerSetSplitting(!splitting));
              }}
              {...props}
            >
              <RiScissorsFill />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {/* Only a finger ever gets this far: a pointer that can hover cuts where
          it points, and leaves nothing to confirm. */}
      {splitPoint && (
        <LongPressTooltip breakpoint="md" label={dvm?.split.here}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="primary"
              onClick={() => {
                dispatch(dataViewerSplitTrack(splitPoint));
              }}
              {...props}
            >
              <FaCheck />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {isPoint && lat !== undefined && lon !== undefined ? (
        // Not only "open in": the menu also routes to the point, takes a view
        // from it and hands it to an editor.
        <LongPressTooltip label={m?.general.actions}>
          {({ props }) => (
            <OpenInExternalAppMenuButton
              lat={lat}
              lon={lon}
              includePoint
              pointTitle={typeof name === 'string' ? name : undefined}
              url={`/?point=${lat}/${lon}`}
              toggleProps={props}
              menuItems={
                <>
                  <Dropdown.Item
                    as="button"
                    onClick={() => {
                      void convertToDrawing(index);
                    }}
                  >
                    <FaPencilAlt /> {m?.general.convertToDrawing}
                  </Dropdown.Item>

                  <RouteEndpointItems divider lat={lat} lon={lon} />

                  <ViewFromHereItems divider lat={lat} lon={lon} />
                </>
              }
            >
              <FaEllipsisV />
            </OpenInExternalAppMenuButton>
          )}
        </LongPressTooltip>
      ) : (
        <Dropdown id="more" onSelect={handleMoreSelect}>
          <Dropdown.Toggle variant="secondary">
            <FaEllipsisV />
          </Dropdown.Toggle>

          <FmDropdownMenu>
            {line && (
              <Dropdown.Item as="button" eventKey="match-to-network">
                <FaMagic /> &nbsp;{dvm?.match.menuItem ?? '…'}
              </Dropdown.Item>
            )}

            {line && isExplodable(line) && (
              <Dropdown.Item as="button" eventKey="explode">
                <TbArrowsSplit /> &nbsp;{dvm?.split.segments ?? '…'}
              </Dropdown.Item>
            )}

            {isSimplifiable(feature) && (
              <Dropdown.Item as="button" eventKey="simplify">
                <FaCompressAlt /> &nbsp;{m?.general.simplify.title ?? '…'}
              </Dropdown.Item>
            )}

            <Dropdown.Item as="button" eventKey="convert-to-drawing">
              <FaPencilAlt /> &nbsp;{m?.general.convertToDrawing ?? '…'}
            </Dropdown.Item>
          </FmDropdownMenu>
        </Dropdown>
      )}
    </Selection>
  );
}
