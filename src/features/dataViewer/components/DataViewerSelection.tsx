import { setActiveModal } from '@app/store/actions.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { OpenInExternalAppMenuButton } from '@features/openInExternalApp/components/OpenInExternalAppMenuButton.js';
import { toastsRemove } from '@features/toasts/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { PromptToolbar } from '@shared/components/PromptToolbar.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
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
  FaTag,
} from 'react-icons/fa';
import { RiScissorsFill } from 'react-icons/ri';
import {
  TbArrowsJoin,
  TbArrowsJoin2,
  TbArrowsSplit,
  TbTimeline,
} from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { useConvertTrackToDrawing } from '../hooks/useConvertTrackToDrawing.js';
import { useSimplifyData } from '../hooks/useSimplifyData.js';
import {
  dataViewerExplodeTrack,
  dataViewerSetElevationPrompt,
  dataViewerSetJoining,
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

  // The properties editor is the drawing tool's, labels and all.
  const dm = useDrawingMessages();

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

  const joinWith = useAppSelector((state) => state.trackViewer.joinWith);

  const line =
    feature !== undefined && isTrackLine(feature) ? feature : undefined;

  if (!feature || index === undefined) {
    return null;
  }

  // Armed, the toolbar makes way for what the mode is waiting on.
  if (joinWith) {
    return (
      <PromptToolbar
        prompt={dvm?.join.pick}
        onCancel={() => {
          dispatch(dataViewerSetJoining(null));
        }}
      />
    );
  }

  if (splitting) {
    return (
      <PromptToolbar
        prompt={dvm?.split.pick}
        onCancel={() => {
          dispatch(dataViewerSetSplitting(false));
        }}
      >
        {/* Only a finger ever gets this far: a pointer that can hover cuts
            where it points, and leaves nothing to confirm. */}
        {splitPoint && (
          <LongPressTooltip breakpoint="sm" label={dvm?.split.here}>
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
      </PromptToolbar>
    );
  }

  const lines = trackLineFeatures(trackGeojson);

  // A join needs a second line to aim at.
  const joinable = line !== undefined && lines.length > 1;

  const geometryType = feature.geometry.type;

  const isPoint = geometryType === 'Point' || geometryType === 'MultiPoint';

  const name = feature.properties?.['name'];

  // Unnamed features are told apart by their kind, a line additionally by its
  // position among the loaded lines.
  const label =
    (typeof name === 'string' && name) ||
    (line
      ? dvm?.unnamedTrack({
          n: lines.findIndex((candidate) => candidate.index === index) + 1,
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

  // A point's own menu carries what the packed menu would otherwise hold, so it
  // takes the conversion with it.
  const placeMenu = isPoint && lat !== undefined && lon !== undefined;

  return (
    <Selection
      icon={
        line ? <TbTimeline /> : isPoint ? <FaMapMarkerAlt /> : <FaDrawPolygon />
      }
      label={label}
      deletable
    >
      <ResponsiveActions gap={1} align="start" toggleLabel={m?.general.actions}>
        <Action
          icon={<FaTag />}
          label={dm?.modify}
          showLabelFrom="md"
          onClick={() => {
            dispatch(setActiveModal({ type: 'data-viewer-properties' }));
          }}
        />

        {line && (
          <Action
            icon={<FaChartArea />}
            label={m?.general.elevationProfile}
            showLabelFrom="md"
            active={elevationChartActive}
            onClick={() => {
              dispatch(dataViewerToggleElevationChart());
            }}
          />
        )}

        {line && (
          <Action
            icon={<FaInfoCircle />}
            label={dvm?.moreInfo}
            showFrom="sm"
            showLabelFrom="md"
            active={trackInfoActive}
            onClick={() => {
              // The stats depend on elevation, so settle it first when some is
              // missing and the user hasn't decided yet. Measured here rather
              // than per render: it walks every coordinate.
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
          />
        )}

        {line && isSplittable(line) && (
          <Action
            icon={<RiScissorsFill />}
            label={dvm?.split.action}
            showFrom="sm"
            // Later than the buttons beside them: both carry a caret as well.
            showLabelFrom="lg"
            onClick={() => {
              dispatch(dataViewerSetSplitting(true));
            }}
            menu={
              isExplodable(line) && [
                <Dropdown.Item
                  key="segments"
                  as="button"
                  onClick={() => {
                    dispatch(dataViewerExplodeTrack(index));
                  }}
                >
                  <TbArrowsSplit /> &nbsp;{dvm?.split.segments ?? '…'}
                </Dropdown.Item>,
              ]
            }
          />
        )}

        {joinable && (
          <Action
            icon={<TbArrowsJoin />}
            label={dvm?.join.action}
            showFrom="md"
            // Later than the buttons beside it: it carries a caret as well.
            showLabelFrom="lg"
            // The two ways of joining differ in the result, so neither is the
            // one a press means: the button asks which before it arms anything.
            menuOnly
            menu={[
              <Dropdown.Item
                key="line"
                as="button"
                onClick={() => {
                  dispatch(
                    dataViewerSetJoining({ featureIndex: index, mode: 'line' }),
                  );
                }}
              >
                <TbArrowsJoin /> &nbsp;{dvm?.join.asLine ?? '…'}
              </Dropdown.Item>,

              <Dropdown.Item
                key="segments"
                as="button"
                onClick={() => {
                  dispatch(
                    dataViewerSetJoining({
                      featureIndex: index,
                      mode: 'segments',
                    }),
                  );
                }}
              >
                <TbArrowsJoin2 /> &nbsp;{dvm?.join.asSegments ?? '…'}
              </Dropdown.Item>,
            ]}
          />
        )}

        {line && (
          <Action
            icon={<FaMagic />}
            label={dvm?.match.menuItem}
            showFrom="never"
            onClick={() => {
              dispatch(setActiveModal({ type: 'track-viewer-match' }));
            }}
          />
        )}

        {isSimplifiable(feature) && (
          <Action
            icon={<FaCompressAlt />}
            label={m?.general.simplify.title}
            showFrom="never"
            onClick={() => {
              void simplify(index);
            }}
          />
        )}

        {!placeMenu && (
          <Action
            icon={<FaPencilAlt />}
            label={m?.general.convertToDrawing}
            showFrom="never"
            onClick={() => {
              void convertToDrawing(index);
            }}
          />
        )}
      </ResponsiveActions>

      {placeMenu && (
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
      )}
    </Selection>
  );
}
