import { openTool, setActiveModal } from '@app/store/actions.js';
import { ProjectPointModal } from '@features/drawing/components/ProjectPointModal.js';
import { featureToOsmXml } from '@features/drawing/josmXml.js';
import { drawingPreventCutHoleHint } from '@features/drawing/model/actions/drawingLineActions.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import { featureOsmTags } from '@features/drawing/osmTags.js';
import { loadDrawingMessages } from '@features/drawing/translations/loadDrawingMessages.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { OpenInExternalAppMenuButton } from '@features/openInExternalApp/components/OpenInExternalAppMenuButton.js';
import { josmRemote } from '@features/openInExternalApp/josmRemote.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import {
  type ToastAction,
  toastsAdd,
  toastsRemove,
} from '@features/toasts/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { PromptToolbar } from '@shared/components/PromptToolbar.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { Selection } from '@shared/components/Selection.js';
import { featureLabel } from '@shared/featureProperties.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEscapeKbd } from '@shared/hooks/useEscapeKbd.js';
import {
  pointStyleFromProperties,
  pointStyleToProperties,
} from '@shared/styleFromProperties.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { area } from '@turf/area';
import { booleanContains } from '@turf/boolean-contains';
import { destination } from '@turf/destination';
import type { Feature, Polygon } from 'geojson';
import { type ReactElement, useMemo, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaChartArea,
  FaCheck,
  FaCompressAlt,
  FaDrawPolygon,
  FaEdit,
  FaEllipsisV,
  FaExchangeAlt,
  FaInfoCircle,
  FaMagic,
  FaMapMarkerAlt,
  FaMountain,
  FaObjectGroup,
  FaObjectUngroup,
  FaRegStopCircle,
  FaTag,
  FaTimes,
} from 'react-icons/fa';
import { RiScissorsFill } from 'react-icons/ri';
import {
  TbAngle,
  TbArrowsJoin,
  TbArrowsJoin2,
  TbTimeline,
} from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { isPoint, lineKindOf } from '../featureEditing.js';
import { useSimplifyData } from '../hooks/useSimplifyData.js';
import {
  dataViewerAddFeatures,
  dataViewerCutHole,
  dataViewerDetachHole,
  dataViewerDrawStop,
  dataViewerExplodeTrack,
  dataViewerInsertVertex,
  dataViewerMakeHole,
  dataViewerReverse,
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
import { breakApart, isExplodable, isSplittable } from '../splitTrack.js';
import { isRecording } from '../trackChannels.js';
import { isTrackLine, trackLineFeatures } from '../trackSelection.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';
import { editableParts } from '../vertexEditing.js';
import { DataViewerToggleButton } from './DataViewerToggleButton.js';

/**
 * The polygon a "make this a hole" would attach `inner` to: the smallest one
 * that fully contains it, so a ring inside nested polygons joins the one it
 * visually sits in.
 */
function enclosingPolygon(
  features: readonly Feature[],
  index: number,
): number | undefined {
  const inner = features[index];

  if (inner?.geometry.type !== 'Polygon') {
    return undefined;
  }

  let best: number | undefined;

  let bestArea = Number.POSITIVE_INFINITY;

  for (const [i, other] of features.entries()) {
    if (i === index || other.geometry.type !== 'Polygon') {
      continue;
    }

    const outer: Polygon = {
      type: 'Polygon',
      coordinates: [other.geometry.coordinates[0] ?? []],
    };

    if (!booleanContains(outer, inner.geometry)) {
      continue;
    }

    const a = area(outer);

    if (a < bestArea) {
      bestArea = a;

      best = i;
    }
  }

  return best;
}

export default function DataViewerSelection(): ReactElement | null {
  const m = useMessages();

  const dvm = useDataViewerMessages();

  const dm = useDrawingMessages();

  const oeam = useOpenInExternalAppMessages();

  const dispatch = useDispatch();

  const simplify = useSimplifyData();

  const selection = useAppSelector((state) => state.main.selection);

  const index = selection?.type === 'feature' ? selection.id : undefined;

  // A hole of the polygon, where one is picked rather than the shape.
  const hole =
    selection?.type === 'feature' && selection.part
      ? selection.part
      : undefined;

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const feature: Feature | undefined =
    index === undefined ? undefined : trackGeojson?.features[index];

  const elevationDecision = useAppSelector(
    (state) => state.trackViewer.elevationDecision,
  );

  const elevationChartActive = useAppSelector(
    (state) =>
      state.elevationChart.target?.type === 'track-viewer' &&
      state.trackViewer.activeTrackIndex === index,
  );

  const trackInfoActive = useAppSelector(
    (state) => TRACK_INFO_TOAST_ID in state.toasts.toasts,
  );

  const splitting = useAppSelector((state) => state.trackViewer.splitting);

  const splitPoint = useAppSelector((state) => state.trackViewer.splitPoint);

  const joinWith = useAppSelector((state) => state.trackViewer.joinWith);

  const drawing = useAppSelector(
    (state) =>
      state.trackViewer.drawing !== null &&
      state.trackViewer.drawing.index === index,
  );

  const cuttingHole = useAppSelector(
    (state) => index !== undefined && state.trackViewer.holeFor === index,
  );

  const preventCutHoleHint = useAppSelector(
    (state) => state.drawingSettings.preventCutHoleHint,
  );

  // Offering "don't show next time" only once the pref can outlive the session.
  const canRememberHintPref = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const language = useAppSelector((state) => state.l10n.language);

  const stopKbd = useEscapeKbd(
    cuttingHole ? dataViewerCutHole(null) : dataViewerDrawStop(),
  );

  const [projecting, setProjecting] = useState(false);

  // Tested against every polygon, so only for a polygon without holes.
  const enclosing = useMemo(() => {
    const geometry =
      index === undefined ? undefined : trackGeojson?.features[index]?.geometry;

    return index !== undefined &&
      trackGeojson &&
      hole === undefined &&
      geometry?.type === 'Polygon' &&
      geometry.coordinates.length === 1
      ? enclosingPolygon(trackGeojson.features, index)
      : undefined;
  }, [index, trackGeojson, hole]);

  const line =
    feature !== undefined && isTrackLine(feature) ? feature : undefined;

  if (!feature || index === undefined) {
    return null;
  }

  // Armed, the toolbar makes way for what the mode is waiting on.
  if (joinWith) {
    return (
      <PromptToolbar
        prompt={joinWith.end === undefined ? dvm?.join.pick : dvm?.join.pickEnd}
        cancel={dataViewerSetJoining(null)}
      />
    );
  }

  if (splitting) {
    return (
      <PromptToolbar
        prompt={dvm?.split.pick}
        cancel={dataViewerSetSplitting(false)}
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

  const point = isPoint(feature.geometry);

  const updateElevation = () => {
    dispatch(dataViewerSetElevationPrompt({ type: 'update', index }));
  };

  // A gapped line, a polygon with holes, a multi-point, multi-polygon or
  // collection, into a feature per segment, ring or member.
  // A picked hole is offered Detach hole instead.
  const breakable = line
    ? isExplodable(line)
    : feature.geometry.type === 'Polygon'
      ? hole === undefined && feature.geometry.coordinates.length > 1
      : breakApart(feature) !== null;

  const doBreakApart = () => {
    trackMatomo([
      'trackEvent',
      'DataViewer',
      'breakApart',
      feature.geometry.type,
    ]);

    dispatch(dataViewerExplodeTrack(index));
  };

  const polygon = feature.geometry.type === 'Polygon';

  const lastVertex =
    feature.geometry.type === 'Point'
      ? feature.geometry.coordinates
      : feature.geometry.type === 'LineString'
        ? feature.geometry.coordinates.at(-1)
        : undefined;

  const projectPoint = (distance: number, azimuth: number) => {
    setProjecting(false);

    if (!lastVertex) {
      return;
    }

    const { coordinates } = destination(lastVertex, distance, azimuth, {
      units: 'meters',
    }).geometry;

    if (feature.geometry.type === 'LineString') {
      dispatch(
        dataViewerInsertVertex({
          index,
          part: 0,
          vertex: feature.geometry.coordinates.length,
          position: coordinates,
        }),
      );

      dispatch(drawingMeasure({}));
    } else {
      // A point projects a new point, styled as the one it was taken from —
      // its style alone, not its description, time or data.
      dispatch(
        dataViewerAddFeatures({
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates },
              properties: pointStyleToProperties(
                {},
                pointStyleFromProperties(feature.properties),
              ),
            },
          ],
        }),
      );
    }
  };

  const cutHole = () => {
    // Opening a map-click tool disarms hole mode, so arm it once it is open.
    dispatch(openTool('draw-polygons'));

    dispatch(dataViewerCutHole(index));

    if (preventCutHoleHint) {
      return;
    }

    const actions: ToastAction[] = [{ nameKey: 'general.ok' }];

    if (canRememberHintPref) {
      actions.push({
        nameKey: 'general.preventShowingAgain',
        action: drawingPreventCutHoleHint(),
        variant: 'dark',
      });
    }

    dispatch(
      toastsAdd({
        id: 'drawing.cutHoleHint',
        messageKey: 'cutHoleHint',
        messageLoader: loadDrawingMessages,
        style: 'info',
        actions,
        // Spent once the hole's first point lands, dropped when cancelled.
        statePredicate: (state) => state.trackViewer.holeFor === null,
      }),
    );
  };

  // The place's title for "Open in…", which only a point offers.
  const labelText = featureLabel(feature, {
    locale: language,
    singleLine: true,
  });

  const name = point ? labelText : undefined;

  const kind = lineKindOf(feature.properties);

  const label =
    hole !== undefined
      ? m?.selections.drawPolygonHole
      : line
        ? (labelText ??
          dvm?.unnamedTrack({
            kind,
            n:
              lines
                .filter(
                  (candidate) =>
                    lineKindOf(candidate.feature.properties) === kind,
                )
                .findIndex((candidate) => candidate.index === index) + 1,
          }))
        : (labelText ??
          (point ? m?.selections.drawPoints : m?.selections.drawPolygons));

  // A MultiPoint has no single position; its first stands for the feature the
  // toolbar acts on.
  const [lon, lat] =
    feature.geometry.type === 'Point'
      ? feature.geometry.coordinates
      : feature.geometry.type === 'MultiPoint'
        ? (feature.geometry.coordinates[0] ?? [])
        : [];

  const placeMenu = point && lat !== undefined && lon !== undefined;

  const parts = editableParts(feature.geometry);

  return (
    <>
      <ProjectPointModal
        show={projecting}
        onClose={() => setProjecting(false)}
        onAdd={projectPoint}
      />

      <Selection
        control={<DataViewerToggleButton />}
        icon={
          line ? <TbTimeline /> : point ? <FaMapMarkerAlt /> : <FaDrawPolygon />
        }
        label={label}
        deletable
      >
        {(drawing || cuttingHole) && (
          <LongPressTooltip
            breakpoint="sm"
            label={cuttingHole ? m?.general.cancel : dm?.stopDrawing}
            kbd={stopKbd}
          >
            {({ label, labelClassName, props }) => (
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch(
                    cuttingHole
                      ? dataViewerCutHole(null)
                      : dataViewerDrawStop(),
                  )
                }
                {...props}
              >
                {cuttingHole ? <FaTimes /> : <FaRegStopCircle />}
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        <ResponsiveActions
          gap={1}
          align="start"
          toggleLabel={m?.general.actions}
        >
          {/* A hole has no label or style of its own: it is part of its polygon. */}
          {hole === undefined && (
            <Action
              icon={<FaTag />}
              label={dm?.modify}
              showLabelFrom="md"
              onClick={() => {
                dispatch(setActiveModal({ type: 'data-viewer-properties' }));
              }}
            />
          )}

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
                // The stats depend on elevation: a recording missing some is
                // settled first, any other line is read from the terrain.
                if (trackInfoActive) {
                  dispatch(toastsRemove(TRACK_INFO_TOAST_ID));
                } else if (
                  elevationDecision === 'undecided' &&
                  isRecording(line) &&
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
              showFrom="never"
              onClick={() => {
                dispatch(dataViewerSetSplitting(true));
              }}
            />
          )}

          {joinable && (
            <Action
              icon={<TbArrowsJoin />}
              label={dvm?.join.action}
              showFrom="md"
              showLabelFrom="lg"
              // The two ways of joining differ in the result, so neither is the
              // one a press means: the button asks which before it arms.
              menuOnly
              menu={[
                <Dropdown.Item
                  key="line"
                  as="button"
                  onClick={() => {
                    dispatch(
                      dataViewerSetJoining({
                        featureIndex: index,
                        mode: 'line',
                      }),
                    );
                  }}
                >
                  <TbArrowsJoin />
                  <MenuLabel>
                    <Text m={dvm} k="join.asLine" />
                  </MenuLabel>
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
                  <TbArrowsJoin2 />
                  <MenuLabel>
                    <Text m={dvm} k="join.asSegments" />
                  </MenuLabel>
                </Dropdown.Item>,
              ]}
            />
          )}

          {/* A point has it in its place menu, which is its only ⋮; a picked
              hole is the polygon's, which takes it whole. */}
          {(line ||
            (hole === undefined &&
              (feature.geometry.type === 'Polygon' ||
                feature.geometry.type === 'MultiPolygon'))) && (
            <Action
              icon={<FaMountain />}
              label={dvm?.elevationFill.update}
              showFrom="never"
              onClick={updateElevation}
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

          {/* A multi-point has it in its place menu, its only ⋮. */}
          {breakable && !placeMenu && (
            <Action
              icon={<FaObjectUngroup />}
              label={dvm?.breakApart}
              showFrom="never"
              onClick={doBreakApart}
            />
          )}

          {isSimplifiable(feature) && hole === undefined && (
            <Action
              icon={<FaCompressAlt />}
              label={m?.general.simplify.title}
              showFrom="never"
              onClick={() => {
                void simplify(index);
              }}
            />
          )}

          {feature.geometry.type === 'LineString' && (
            <Action
              icon={<FaExchangeAlt />}
              label={dm?.reverse}
              showFrom="never"
              onClick={() => {
                dispatch(dataViewerReverse(index));
              }}
            />
          )}

          {feature.geometry.type === 'LineString' && (
            <Action
              icon={<TbAngle />}
              label={dm?.projection.projectPoint}
              showFrom="never"
              onClick={() => setProjecting(true)}
            />
          )}

          {polygon && hole === undefined && parts && (
            <Action
              icon={<RiScissorsFill />}
              label={dm?.cutHole}
              showFrom="never"
              active={cuttingHole}
              onClick={cutHole}
            />
          )}

          {enclosing !== undefined && (
            <Action
              icon={<FaObjectGroup />}
              label={dm?.makeHole}
              showFrom="never"
              onClick={() => {
                dispatch(dataViewerMakeHole({ index, parent: enclosing }));
              }}
            />
          )}

          {hole !== undefined && (
            <Action
              icon={<FaObjectUngroup />}
              label={dm?.detachHole}
              showFrom="never"
              onClick={() => {
                dispatch(dataViewerDetachHole({ index, part: hole }));
              }}
            />
          )}

          {/* A line or a polygon: the OSM XML says no other shape. */}
          {!window.fmEmbedded &&
            (feature.geometry.type === 'LineString' || polygon) &&
            hole === undefined && (
              <Action
                icon={<FaEdit />}
                label={
                  oeam &&
                  m?.general.openIn({
                    what: oeam.josm,
                  })
                }
                showFrom="never"
                onClick={() => {
                  const data = featureToOsmXml(feature);

                  if (data) {
                    // The geometry itself, as a new layer of unsaved data — the
                    // editor has nothing to download it from.
                    josmRemote(dispatch, 'load_data', {
                      new_layer: 'true',
                      layer_name: name || label || 'Freemap',
                      data,
                    });
                  }
                }}
              />
            )}
        </ResponsiveActions>

        {placeMenu && (
          // Not only "open in": the menu also carries what the map's context
          // menu does with the place.
          <LongPressTooltip label={m?.general.actions}>
            {({ props }) => (
              <OpenInExternalAppMenuButton
                lat={lat}
                lon={lon}
                includePoint
                pointTitle={name}
                pointTags={featureOsmTags(feature.properties)}
                url={`/?point=${lat}/${lon}`}
                toggleProps={props}
                menuItems={
                  // A MultiPoint has no one point to project from.
                  feature.geometry.type === 'Point' ? (
                    <>
                      <Dropdown.Item
                        as="button"
                        onClick={() => setProjecting(true)}
                      >
                        <TbAngle />
                        <MenuLabel>
                          <Text m={dm} k="projection.projectPoint" />
                        </MenuLabel>
                      </Dropdown.Item>

                      <Dropdown.Item as="button" onClick={updateElevation}>
                        <FaMountain />
                        <MenuLabel>
                          <Text m={dvm} k="elevationFill.update" />
                        </MenuLabel>
                      </Dropdown.Item>
                    </>
                  ) : (
                    breakable && (
                      <Dropdown.Item as="button" onClick={doBreakApart}>
                        <FaObjectUngroup />
                        <MenuLabel>
                          <Text m={dvm} k="breakApart" />
                        </MenuLabel>
                      </Dropdown.Item>
                    )
                  )
                }
              >
                <FaEllipsisV />
              </OpenInExternalAppMenuButton>
            )}
          </LongPressTooltip>
        )}
      </Selection>
    </>
  );
}
