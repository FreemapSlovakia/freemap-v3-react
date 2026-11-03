import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { setUrlUpdatingEnabled } from '@app/url/urlUpdating.js';
import { drawingMeasure } from '@features/drawing/model/actions/drawingPointActions.js';
import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { FEATURES_PANE_CLASS } from '@features/map/hooks/featuresPane.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import {
  availableColorizer,
  colorizerHotlineOptions,
  NO_DATA_COLOR,
  NO_DATA_OPACITY,
  noDataRuns,
  splitOnGaps,
} from '@shared/colorizers/colorize.js';
import { colorizers } from '@shared/colorizers/index.js';
import { useUnlockedColorizingMode } from '@shared/colorizers/premiumColorize.js';
import { useZoomColorize } from '@shared/colorizers/useZoomColorize.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useIconContentProps } from '@shared/drawingIcons.js';
import { featureLabel } from '@shared/featureProperties.js';
import { cumulativeDistances } from '@shared/geoutils.js';
import {
  HALO_COLOR,
  HALO_PANE,
  HALO_WIDTH,
  SECOND_SELECTION_COLOR,
  SELECTION_COLOR,
} from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  type LabelTooltipMode,
  labelTooltipMode,
} from '@shared/labelVisibility.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@shared/styleFromProperties.js';
import { flatten } from '@turf/flatten';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from 'geojson';
import {
  type DragEndEvent,
  type LatLngLiteral,
  type LeafletMouseEvent,
  Point as LPoint,
} from 'leaflet';
import {
  type ComponentProps,
  Fragment,
  type ReactElement,
  useMemo,
} from 'react';
import { FaFlag, FaPlay, FaStop } from 'react-icons/fa';
import { RiScissorsFill } from 'react-icons/ri';
import { CircleMarker, Pane, Polygon, Polyline, Tooltip } from 'react-leaflet';
import { Hotline } from 'react-leaflet-hotline';
import { useDispatch } from 'react-redux';
import { isPoint } from '../featureEditing.js';
import { useStartFinishPoints } from '../hooks/useStartFinishPoints.js';
import { useTrackJoin } from '../hooks/useTrackJoin.js';
import { useTrackSplit } from '../hooks/useTrackSplit.js';
import { dataViewerMoveVertex } from '../model/actions.js';
import { trackLineParts } from '../trackLineParts.js';
import { editableParts } from '../vertexEditing.js';
import { VertexHandles } from './VertexHandles.js';

// The selection halo, and the colour the far half of a pending cut is told
// apart by. Whole objects, so a re-render hands Leaflet the same options back
// instead of restyling every path.
const HALO_OPTIONS = {
  opacity: 1,
  lineCap: 'round',
  lineJoin: 'round',
} as const;

const HEAD_HALO = { ...HALO_OPTIONS, color: SELECTION_COLOR };

const TAIL_HALO = { ...HALO_OPTIONS, color: SECOND_SELECTION_COLOR };

// What an unselected colorized line wears instead: its colors are the mode's,
// so it needs an outline of its own to stay legible over the map.
const CASING = { ...HALO_OPTIONS, color: HALO_COLOR };

// Fallback fill opacity, used only when no fill color is resolvable at all
// (e.g. the user cleared drawingFillColor). Passing an explicit number is
// required: Leaflet's `setOptions` copies `fillOpacity: undefined` over its own
// 0.2 default, which renders the fill fully opaque.
const defaultFillOpacity = 0.2;

const revisions = new WeakMap<object, number>();

let lastRevision = 0;

/** A number standing for this object — a feature — the same every time asked. */
function revisionOf(object: object): number {
  let revision = revisions.get(object);

  if (revision === undefined) {
    revision = ++lastRevision;

    revisions.set(object, revision);
  }

  return revision;
}

/** One drawn ring set of a polygon feature, in the style it is drawn with. */
function polygonEntry(
  feature: Feature,
  // [outerRing, ...holes], which Leaflet's Polygon renders as positions.
  coordinates: Position[][],
  featureIndex: number,
  defaultStyle: DrawingStyle,
) {
  const style = lineStyleFromProperties(feature.properties, true);

  const stroke = splitColorAlpha(style.color ?? defaultStyle.color);

  // With no explicit fill, fall back to the default fill so an unstyled
  // imported polygon looks semitransparent rather than a solid blob.
  const fillSpec = style.fillColor ?? defaultStyle.fillColor;

  const fill = splitColorAlpha(fillSpec ?? style.color ?? defaultStyle.color);

  return {
    featureIndex,
    positions: coordinates.map((ring) =>
      ring.map(([lng, lat]) => ({ lat: lat!, lng: lng! })),
    ),
    style: {
      strokeColor: stroke.color,
      strokeOpacity: stroke.opacity,
      fillColor: fill.color,
      fillOpacity: fillSpec ? fill.opacity : defaultFillOpacity,
      width: style.width ?? defaultStyle.width,
      dashArray: style.dashArray ?? defaultStyle.dashArray,
      lineCap: style.lineCap ?? defaultStyle.lineCap,
      lineJoin: style.lineJoin ?? defaultStyle.lineJoin,
    },
  };
}

export default function DataViewerResult({
  trackGeojson,
}: {
  trackGeojson: FeatureCollection;
}): ReactElement | null {
  const language = useAppSelector((state) => state.l10n.language);

  const [startPoints, finishPoints] = useStartFinishPoints();

  const displayingElevationChart = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const colorizeTrackBy = useUnlockedColorizingMode(
    useAppSelector((state) => state.trackViewerSettings.colorizeTrackBy),
  );

  // Style applied to imported features that carry no style of their own. Its own
  // independent setting (not the drawing tool defaults), editable from the
  // track-viewer toolbar.
  const defaultStyle = useAppSelector(
    (state) => state.trackViewerSettings.style,
  );

  const zoom = useAppSelector((state) => state.map.zoom);

  // Memoized so the per-zoom colorize cache survives across renders.
  const lineFeatures = useMemo(
    () => trackLineParts(trackGeojson),
    [trackGeojson],
  );

  // The mode is persisted, so it outlives the track it was picked for. Where it
  // has nothing to say about this one, the plain styled line stands: painting
  // the whole track Unknown grey would hide its own style and say nothing.
  const picked = colorizeTrackBy ? colorizers[colorizeTrackBy] : null;

  const activeColorizer = availableColorizer(picked, lineFeatures);

  const colorizedPositions = useZoomColorize(
    activeColorizer,
    lineFeatures,
    zoom,
  );

  // Stable reference so react-leaflet-hotline's options-effect doesn't fire
  // (and schedule a canvas redraw) on every render.
  const hotlineOptions = useMemo(
    () => ({
      weight: 6,
      outlineWidth: 0,
      ...colorizerHotlineOptions(activeColorizer),
    }),
    [activeColorizer],
  );

  const colorizedRuns = useMemo(
    () =>
      colorizedPositions.map((positions) => ({
        noData: noDataRuns(positions),
        runs: splitOnGaps(positions),
      })),
    [colorizedPositions],
  );

  const interactive = useAppSelector(selectingModeSelector);

  const selection = useAppSelector((state) => state.main.selection);

  const selectedIndex =
    selection?.type === 'feature' || selection?.type === 'vertex'
      ? selection.id
      : undefined;

  // A selected hole wears the halo instead of its polygon.
  const selectedHole =
    selection?.type === 'feature' && selection.part
      ? selection.part
      : undefined;

  const drawing = useAppSelector((state) => state.trackViewer.drawing);

  const labelVisibility = useAppSelector(
    (state) => state.trackViewerSettings.labelVisibility,
  );

  const labelModeOf = (featureIndex: number) =>
    labelTooltipMode(labelVisibility, featureIndex === selectedIndex);

  // Per source feature, as a template's `{length}` measures the whole of it.
  const labels = useMemo(
    () =>
      trackGeojson.features.map((feature) =>
        featureLabel(feature, { locale: language }),
      ),
    [trackGeojson, language],
  );

  const dispatch = useDispatch();

  const split = useTrackSplit(selectedIndex);

  const join = useTrackJoin();

  // Clicking a feature gives it its own toolbar, which reaches the tool's panel
  // by a button of its own; a line also becomes the one the chart / "more info"
  // act on (`dataViewerSelectProcessor`).
  const select = (featureIndex: number, part?: number) => {
    dispatch(selectFeature({ type: 'feature', id: featureIndex, part }));

    dispatch(drawingMeasure({}));
  };

  // Remounts a feature's layers when it changes, which some of them need to
  // redraw — only its own, so a drag doesn't rebuild every label. A revision
  // per object, not a hash: an edit replaces just the features it touches.
  const featureKey = (featureIndex: number) => {
    const feature = trackGeojson?.features[featureIndex];

    return feature ? revisionOf(feature) : 0;
  };

  // Flatten line-like features into per-segment render entries, keeping each
  // segment's source feature index so a click selects that whole track and the
  // selected one is highlighted (a `MultiLineString` is one track over several
  // segments). Memoized so it doesn't re-traverse every coordinate on unrelated
  // re-renders (zoom, selection, …).
  const features = useMemo(
    () =>
      trackGeojson.features.flatMap((feature, featureIndex) => {
        // A collection's lines too, as the polygons and points below open it.
        const segments = lineCoordinates(feature.geometry);

        if (segments.length === 0) {
          return [];
        }

        // A permanent label goes on the longest segment only, not a stray
        // fragment; a hover label stays on every segment.
        const lengths =
          segments.length > 1
            ? segments.map((s) => cumulativeDistances(s).at(-1) ?? 0)
            : [0];

        const labelledIndex = lengths.indexOf(Math.max(...lengths));

        return segments.map((coords, segmentIndex) => {
          const closed =
            coords.length > 2 &&
            coords[0]![0] === coords.at(-1)![0] &&
            coords[0]![1] === coords.at(-1)![1];

          const style = lineStyleFromProperties(feature.properties, closed);

          const stroke = splitColorAlpha(style.color ?? defaultStyle.color);

          // Same default-fill treatment as native polygons below (ignored for
          // lines, which render as unfilled Polylines).
          const fillSpec = style.fillColor ?? defaultStyle.fillColor;

          const fill = splitColorAlpha(
            fillSpec ?? style.color ?? defaultStyle.color,
          );

          return {
            featureIndex,
            labelled: segmentIndex === labelledIndex,
            lineData: coords.map(([lng, lat]) => ({ lat: lat!, lng: lng! })),
            style: {
              type: style.type === 'polygon' ? 'polygon' : 'line',
              strokeColor: stroke.color,
              strokeOpacity: stroke.opacity,
              fillColor: fill.color,
              fillOpacity: fillSpec ? fill.opacity : defaultFillOpacity,
              width: style.width ?? defaultStyle.width,
              dashArray: style.dashArray ?? defaultStyle.dashArray,
              lineCap: style.lineCap ?? defaultStyle.lineCap,
              lineJoin: style.lineJoin ?? defaultStyle.lineJoin,
            },
          };
        });
      }),
    [trackGeojson, defaultStyle],
  );

  // Native GeoJSON Polygon geometry (e.g. an imported .geojson) and standalone
  // points (GPX `<wpt>`), in one pass: `flatten` splits Multi* and opens a
  // GeometryCollection, and the source feature index rides along so a click
  // selects the whole feature a part came from.
  const [polygons, points] = useMemo(() => {
    const polygons: (ReturnType<typeof polygonEntry> & {
      editable: boolean;
    })[] = [];

    const points: {
      lat: number;
      lon: number;
      featureIndex: number;
      properties: GeoJsonProperties;
      /** A point of its own rather than one of a multi-point. */
      movable: boolean;
    }[] = [];

    for (const [featureIndex, feature] of trackGeojson.features.entries()) {
      for (const part of flatten(feature).features) {
        const geom = part.geometry;

        if (geom.type === 'Point') {
          points.push({
            lat: geom.coordinates[1]!,
            lon: geom.coordinates[0]!,
            featureIndex,
            properties: feature.properties,
            movable: feature.geometry.type === 'Point',
          });

          continue;
        }

        if (geom.type === 'Polygon') {
          polygons.push({
            ...polygonEntry(
              feature,
              geom.coordinates,
              featureIndex,
              defaultStyle,
            ),
            editable: feature.geometry.type === 'Polygon',
          });
        }
      }
    }

    return [polygons, points] as const;
  }, [trackGeojson, defaultStyle]);

  // Width comes from the feature properties alone, so every segment of the
  // selected one shares it.
  const haloWidth =
    features.find(({ featureIndex }) => featureIndex === selectedIndex)?.style
      .width ?? defaultStyle.width;

  // The halo of the selected feature — or, with a cut aimed, the two halves it
  // would come out as, each in its own colour. With a join armed, the candidate
  // under the pointer wears the second colour, so the pair is visible first.
  // Keyed by the segment they are of rather than by their place in this list:
  // a hover adds a halo partway up it, and index keys would hand the selected
  // track's `Polyline` the hovered track's points instead of leaving it alone.
  const halos = split.preview
    ? [
        ...split.preview.head.map((positions, i) => ({
          key: `head-${i}`,
          positions,
          options: HEAD_HALO,
          width: haloWidth,
        })),
        ...split.preview.tail.map((positions, i) => ({
          key: `tail-${i}`,
          positions,
          options: TAIL_HALO,
          width: haloWidth,
        })),
      ]
    : features.flatMap(({ lineData, featureIndex, style }, i) => {
        const options =
          featureIndex === join.hovered
            ? TAIL_HALO
            : featureIndex === selectedIndex
              ? HEAD_HALO
              : activeColorizer
                ? CASING
                : null;

        return options
          ? [
              {
                key: `line-${featureKey(featureIndex)}-${i}`,
                positions: lineData,
                options,
                width: style.width,
              },
            ]
          : [];
      });

  const timeFormat = useDateTimeFormat({
    hour: 'numeric',
    minute: '2-digit',
  });

  // The vertices as stored, not the densified render copy the lines are drawn
  // from: a handle addresses a vertex by index.
  const stored = useAppSelector((state) => state.trackViewer.trackGeojson);

  // The selected feature's handles, and those of whatever is being drawn. Not
  // while a split or a join is aimed: the click is theirs.
  const handles = useMemo(() => {
    const out: ComponentProps<typeof VertexHandles>[] = [];

    if (window.fmEmbedded || split.armed || join.armed || !stored) {
      return out;
    }

    for (const index of new Set([selectedIndex, drawing?.index])) {
      const feature = index === undefined ? undefined : stored.features[index];

      const parts = feature && editableParts(feature.geometry);

      if (
        index === undefined ||
        !feature ||
        !parts ||
        isPoint(feature.geometry)
      ) {
        continue;
      }

      const ring = feature.geometry.type === 'Polygon';

      const style = lineStyleFromProperties(feature.properties, ring);

      const stroke = splitColorAlpha(style.color ?? defaultStyle.color);

      for (const [part, vertices] of parts.entries()) {
        out.push({
          index,
          part,
          vertices,
          ring,
          color: stroke.color,
          previewStyle: {
            weight: style.width ?? defaultStyle.width,
            opacity: stroke.opacity,
            dashArray: style.dashArray ?? defaultStyle.dashArray,
            lineCap: style.lineCap ?? 'round',
            lineJoin: style.lineJoin ?? 'round',
          },
          selectedVertex:
            selection?.type === 'vertex' &&
            selection.id === index &&
            selection.part === part
              ? selection.vertex
              : undefined,
          drawing: drawing?.index === index && drawing.part === part,
        });
      }
    }

    return out;
  }, [
    stored,
    selectedIndex,
    selection,
    drawing,
    defaultStyle,
    split.armed,
    join.armed,
  ]);

  const layers = (
    <Fragment key={String(displayingElevationChart)}>
      <Pane
        name="fm-trackviewer-polygons"
        className={FEATURES_PANE_CLASS}
        style={{ zIndex: 399 }}
      />

      {/* Above the hotline canvas (default overlayPane, zIndex 400) so the
          invisible outline below catches clicks even when the track is
          colorized; below markerPane (600) so waypoints stay clickable. */}
      <Pane name="fm-trackviewer-hit" style={{ zIndex: 450 }} />

      {halos.map(({ key, positions, options, width }) => (
        <Polyline
          key={`halo-${key}`}
          pane={HALO_PANE}
          weight={width + HALO_WIDTH}
          positions={positions}
          pathOptions={options}
          interactive={false}
        />
      ))}

      {polygons
        .filter(({ featureIndex }) => featureIndex === selectedIndex)
        .map(({ positions, style, featureIndex }, i) => (
          <Polygon
            key={`poly-highlight-${featureKey(featureIndex)}-${i}`}
            pane={HALO_PANE}
            weight={style.width + HALO_WIDTH}
            // A picked hole is the ring the toolbar acts on.
            positions={
              selectedHole === undefined
                ? positions
                : [positions[selectedHole] ?? []]
            }
            pathOptions={{
              color: SELECTION_COLOR,
              opacity: 1,
              fill: false,
              lineJoin: 'round',
            }}
            interactive={false}
          />
        ))}

      {features.map(({ lineData, style, featureIndex, labelled }, i) => (
        <Polyline
          key={`outline-${featureKey(featureIndex)}-${i}-${interactive ? 'a' : 'b'}`}
          pane="fm-trackviewer-hit"
          weight={style.width + 8}
          interactive={interactive}
          positions={lineData}
          opacity={0}
          bubblingMouseEvents={false}
          eventHandlers={{
            // With a mode armed the click is the edit, and only the tracks that
            // mode acts on answer it — everything else still selects.
            click: (e) => {
              if (
                !join.handleClick(featureIndex) &&
                !split.handleClick(featureIndex, e.latlng)
              ) {
                select(featureIndex);
              }
            },
            // Only while armed: a `mouseout` listener here makes the outline
            // the sole target of the event, and the map stops getting its own —
            // which is what clears the elevation chart readout.
            ...(split.armed || join.armed
              ? {
                  mousemove: (e: LeafletMouseEvent) => {
                    split.handleMove(featureIndex, e.latlng);

                    join.handleMove(featureIndex);
                  },
                  mouseout: () => {
                    split.handleOut();

                    join.handleOut();
                  },
                }
              : {}),
          }}
        >
          {(labelled || labelModeOf(featureIndex) === 'hover') && (
            <LabelTooltip
              mode={labelModeOf(featureIndex)}
              label={labels[featureIndex]}
            />
          )}
        </Polyline>
      ))}

      {activeColorizer &&
        colorizedRuns.flatMap((colorized, i) => [
          ...colorized.noData.map((run, j) => (
            <Polyline
              key={`nodata-${colorizeTrackBy}-${i}-${j}`}
              positions={run.map((p): [number, number] => [p.lat, p.lon])}
              weight={4}
              pathOptions={{
                color: NO_DATA_COLOR,
                opacity: NO_DATA_OPACITY,
                lineCap: 'round',
              }}
              interactive={false}
            />
          )),
          ...colorized.runs.map((run, j) => (
            <Hotline
              // Not remounted on new data: the hotline redraws for a new `data`.
              key={`${colorizeTrackBy}-${i}-${j}`}
              data={run}
              getVal={(p) => p.point.color}
              getLat={(p) => p.point.lat}
              getLng={(p) => p.point.lon}
              options={hotlineOptions}
            />
          )),
        ])}

      {!activeColorizer &&
        features.map(({ lineData, style, featureIndex }, i) => {
          const pathOptions = {
            color: style.strokeColor,
            opacity: style.strokeOpacity,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity,
            dashArray: style.dashArray,
            lineCap: style.lineCap ?? 'round',
            lineJoin: style.lineJoin ?? 'round',
          } as const;

          return style.type === 'polygon' ? (
            <Polygon
              key={`poly-${featureKey(featureIndex)}-${i}-${interactive ? 'a' : 'b'}`}
              pane="fm-trackviewer-polygons"
              weight={style.width}
              pathOptions={pathOptions}
              positions={lineData}
              interactive={interactive}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: () => select(featureIndex),
              }}
            />
          ) : (
            <Polyline
              key={`poly-${featureKey(featureIndex)}-${i}-${interactive ? 'a' : 'b'}`}
              weight={style.width}
              pathOptions={pathOptions}
              positions={lineData}
              interactive={interactive}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: () => select(featureIndex),
              }}
            />
          );
        })}

      {polygons.map(({ positions, style, featureIndex }, i) => (
        <Polygon
          key={`mpoly-${featureKey(featureIndex)}-${i}-${interactive ? 'a' : 'b'}`}
          pane="fm-trackviewer-polygons"
          weight={style.width}
          pathOptions={{
            color: style.strokeColor,
            opacity: style.strokeOpacity,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity,
            dashArray: style.dashArray,
            lineCap: style.lineCap ?? 'round',
            lineJoin: style.lineJoin ?? 'round',
          }}
          positions={positions}
          interactive={interactive}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: () => select(featureIndex),
          }}
        >
          <LabelTooltip
            mode={labelModeOf(featureIndex)}
            label={labels[featureIndex]}
            polygon
          />
        </Polygon>
      ))}

      {/* The fill punches the holes out and lets clicks through them, so
          each hole has an outline of its own to be picked by. */}
      {polygons.flatMap(({ positions, style, featureIndex, editable }, i) =>
        editable
          ? positions.slice(1).map((ring, j) => (
              <Polyline
                key={`hole-${featureKey(featureIndex)}-${i}-${j}-${interactive ? 'a' : 'b'}`}
                pane="fm-trackviewer-hit"
                weight={style.width + 8}
                opacity={0}
                interactive={interactive}
                bubblingMouseEvents={false}
                eventHandlers={{
                  click: () => select(featureIndex, j + 1),
                }}
                positions={ring}
              />
            ))
          : [],
      )}

      {startPoints.map((p, i) => (
        <RichMarker
          faIcon={<FaPlay color="#409a40" />}
          key={`sp-${featureKey(p.featureIndex)}-${i}`}
          color="#409a40"
          interactive={interactive}
          position={{ lat: p.lat, lng: p.lon }}
          eventHandlers={{
            click: () => select(p.featureIndex),
          }}
        >
          {p.startTime && !Number.isNaN(new Date(p.startTime).getTime()) && (
            <Tooltip
              className="compact"
              offset={new LPoint(10, 10)}
              direction="right"
              permanent
            >
              <span>{timeFormat.format(new Date(p.startTime))}</span>
            </Tooltip>
          )}
        </RichMarker>
      ))}

      {finishPoints.map((p, i) => (
        <RichMarker
          faIcon={<FaStop color="#d9534f" />}
          key={`fp-${featureKey(p.featureIndex)}-${i}`}
          color="#d9534f"
          interactive={interactive}
          position={{ lat: p.lat, lng: p.lon }}
          eventHandlers={{
            click: () => select(p.featureIndex),
          }}
        >
          <Tooltip
            className="compact"
            offset={new LPoint(10, 10)}
            direction="right"
            permanent
          >
            <span>
              {p.finishTime &&
                !Number.isNaN(new Date(p.finishTime).getTime()) && (
                  <>
                    {p.finishTime
                      ? timeFormat.format(new Date(p.finishTime))
                      : null}
                    {p.finishTime ? ', ' : ''}
                  </>
                )}
              {formatDistance(p.length, language)}
            </span>
          </Tooltip>
        </RichMarker>
      ))}

      {split.cursor && (
        <RichMarker
          faIcon={
            <RiScissorsFill
              color={split.cursor.frozen ? SELECTION_COLOR : 'grey'}
            />
          }
          color={split.cursor.frozen ? SELECTION_COLOR : 'grey'}
          position={{ lat: split.cursor.lat, lng: split.cursor.lon }}
          // A frozen cut can be dragged along the track to adjust it, which is
          // the only way to aim one with a finger.
          interactive={split.cursor.frozen}
          draggable={split.cursor.frozen}
          eventHandlers={{
            dragend: (e) => {
              const position = split.handleDragEnd(e.target.getLatLng());

              if (position) {
                e.target.setLatLng(position);
              }
            },
          }}
        >
          <Tooltip
            className="compact"
            offset={new LPoint(10, 10)}
            direction="right"
            permanent
          >
            <span>
              ← {formatDistance(split.cursor.distance, language)}
              <br />→ {formatDistance(split.cursor.remaining, language)}
            </span>
          </Tooltip>
        </RichMarker>
      )}
    </Fragment>
  );

  // Outside the keyed group above: a marker remounted mid-drag drops the
  // gesture, and the chart opening or closing remounts that group.
  return (
    <>
      {layers}

      {points.map(({ lat, lon, properties, featureIndex, movable }, i) => (
        <WaypointMarker
          key={`point-${i}`}
          lat={lat}
          lon={lon}
          name={labels[featureIndex]}
          properties={properties}
          interactive={interactive || featureIndex === selectedIndex}
          labelMode={labelModeOf(featureIndex)}
          selected={featureIndex === selectedIndex}
          draggable={
            movable && featureIndex === selectedIndex && !window.fmEmbedded
          }
          onClick={() => {
            if (featureIndex !== selectedIndex) {
              select(featureIndex);
            }
          }}
          onMove={(position, done) => {
            dispatch(
              dataViewerMoveVertex({
                index: featureIndex,
                part: 0,
                vertex: 0,
                position,
              }),
            );

            dispatch(drawingMeasure({ elevation: done }));
          }}
        />
      ))}

      {handles.map((props) => (
        <VertexHandles key={`${props.index}-${props.part}`} {...props} />
      ))}

      {/* Armed from an end vertex, the end of another line it is to meet. */}
      {join.ends.length > 0 && (
        <Pane name="fm-trackviewer-join-ends" style={{ zIndex: 620 }} />
      )}

      {join.ends.map(({ featureIndex, end, position }) => (
        <CircleMarker
          key={`join-${featureKey(featureIndex)}-${end}`}
          pane="fm-trackviewer-join-ends"
          center={[position[1]!, position[0]!]}
          radius={8}
          pathOptions={{
            color: SECOND_SELECTION_COLOR,
            fillColor: '#fff',
            fillOpacity: 1,
            weight: 3,
          }}
          bubblingMouseEvents={false}
          eventHandlers={{
            click: () => join.handleEnd(featureIndex, end),
          }}
        />
      ))}
    </>
  );
}

/** The line segments a geometry draws, a collection's members' included. */
function lineCoordinates(geometry: Geometry | null): Position[][] {
  switch (geometry?.type) {
    case 'LineString':
      return [geometry.coordinates];

    case 'MultiLineString':
      return geometry.coordinates;

    case 'GeometryCollection':
      return geometry.geometries.flatMap(lineCoordinates);

    default:
      return [];
  }
}

function WaypointMarker({
  lat,
  lon,
  name,
  properties,
  interactive,
  labelMode,
  selected,
  draggable,
  onClick,
  onMove,
}: {
  lat: number;
  lon: number;
  name: string | undefined;
  properties: Record<string, unknown> | null | undefined;
  interactive: boolean;
  labelMode: LabelTooltipMode | undefined;
  selected: boolean;
  draggable: boolean;
  onClick: () => void;
  /** `done` on the drop, which is when the elevation is worth reading. */
  onMove: (position: Position, done: boolean) => void;
}): ReactElement {
  const style = pointStyleFromProperties(properties);

  const contentProps = useIconContentProps(style.icon);

  // The track-viewer default style colors and shapes unstyled waypoints.
  const defaultStyle = useAppSelector(
    (state) => state.trackViewerSettings.style,
  );

  const color = style.color ?? defaultStyle.color;

  // An imported waypoint with no icon spec wears the flag glyph; a drawn point
  // is the plain marker.
  const flag =
    !(contentProps.poi ?? contentProps.iconSvg ?? contentProps.label) &&
    properties?.['fm:kind'] !== undefined;

  // The label fades with the marker (0.9 is Leaflet's own tooltip opacity).
  const { opacity } = splitColorAlpha(color);

  return (
    <RichMarker
      position={{ lat, lng: lon }}
      color={color}
      // Selection is the ring, so the waypoint keeps its own color, as a
      // selected line does.
      halo={selected ? SELECTION_COLOR : undefined}
      markerType={style.markerType ?? defaultStyle.markerType}
      interactive={interactive}
      draggable={draggable}
      eventHandlers={{
        click: onClick,
        dragstart() {
          // One history entry for the whole gesture, written on the drop.
          setUrlUpdatingEnabled(false);
        },
        move(e) {
          // see https://github.com/PaulLeCam/react-leaflet/issues/981
          const { latlng } = e as unknown as { latlng: LatLngLiteral };

          if (draggable) {
            onMove([latlng.lng, latlng.lat], false);
          }
        },
        dragend(e) {
          setUrlUpdatingEnabled(true);

          const { lat, lng } = (e as DragEndEvent).target.getLatLng();

          onMove([lng, lat], true);
        },
      }}
      {...(flag ? { faIcon: <FaFlag color={color} /> } : contentProps)}
    >
      {name && labelMode && (
        <Tooltip
          key={labelMode}
          className="compact multiline"
          direction="top"
          permanent={labelMode === 'permanent'}
          opacity={0.9 * opacity}
        >
          <span>{name}</span>
        </Tooltip>
      )}
    </RichMarker>
  );
}

/** A path's name; a hover one follows the pointer, as the shape's centre may be off-screen. */
function LabelTooltip({
  mode,
  label,
  polygon,
}: {
  mode: LabelTooltipMode | undefined;
  label: string | undefined;
  /** A permanent one centred on the area, with no pointer to it. */
  polygon?: boolean;
}): ReactElement | null {
  return mode && label ? (
    <Tooltip
      key={mode}
      className="compact multiline"
      // A hover one follows the pointer, so centred it would cover it.
      {...(polygon &&
        mode === 'permanent' && { direction: 'center', offset: [-4, 0] })}
      permanent={mode === 'permanent'}
      sticky={mode === 'hover'}
    >
      <span>{label}</span>
    </Tooltip>
  ) : null;
}
