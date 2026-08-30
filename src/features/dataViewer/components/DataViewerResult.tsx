import { selectFeature } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import { paleColor, splitColorAlpha } from '@shared/colorAlpha.js';
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
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@shared/styleFromProperties.js';
import { flatten } from '@turf/flatten';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Position,
} from 'geojson';
import { type LeafletMouseEvent, Point as LPoint } from 'leaflet';
import { Fragment, type ReactElement, useMemo } from 'react';
import { FaFlag, FaPlay, FaStop } from 'react-icons/fa';
import { RiScissorsFill } from 'react-icons/ri';
import { Pane, Polygon, Polyline, Tooltip } from 'react-leaflet';
import { Hotline } from 'react-leaflet-hotline';
import { useDispatch } from 'react-redux';
import { useStartFinishPoints } from '../hooks/useStartFinishPoints.js';
import { useTrackJoin } from '../hooks/useTrackJoin.js';
import { useTrackSplit } from '../hooks/useTrackSplit.js';
import { trackLineParts } from '../trackLineParts.js';

// The selection halo, and the colour the far half of a pending cut is told
// apart by. Whole objects, so a re-render hands Leaflet the same options back
// instead of restyling every path.
const SELECTION_COLOR = '#156efd';

const HALO_OPTIONS = {
  opacity: 1,
  lineCap: 'round',
  lineJoin: 'round',
} as const;

const HEAD_HALO = { ...HALO_OPTIONS, color: SELECTION_COLOR };

const TAIL_HALO = { ...HALO_OPTIONS, color: '#ff8c00' };

// Fallback fill opacity, used only when no fill color is resolvable at all
// (e.g. the user cleared drawingFillColor). Passing an explicit number is
// required: Leaflet's `setOptions` copies `fillOpacity: undefined` over its own
// 0.2 default, which renders the fill fully opaque.
const defaultFillOpacity = 0.2;

const revisions = new WeakMap<object, number>();

let lastRevision = 0;

/** A number standing for this collection, the same one every time it is asked. */
function revisionOf(fc: object): number {
  let revision = revisions.get(fc);

  if (revision === undefined) {
    revision = ++lastRevision;

    revisions.set(fc, revision);
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
    name: feature.properties?.['name'],
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

  const selectedIndex = useAppSelector((state) =>
    state.main.selection?.type === 'data-viewer'
      ? state.main.selection.id
      : undefined,
  );

  const dispatch = useDispatch();

  const split = useTrackSplit(selectedIndex);

  const join = useTrackJoin();

  // Clicking a feature gives it its own toolbar, which reaches the tool's panel
  // by a button of its own; a line also becomes the one the chart / "more info"
  // act on (`dataViewerSelectProcessor`).
  const select = (featureIndex: number) => {
    dispatch(selectFeature({ type: 'data-viewer', id: featureIndex }));
  };

  // Remounts the layers below on new data, which some of them need to redraw.
  // A revision per collection rather than a hash of one: the store replaces the
  // object on every edit, and serializing a 100k-point track to measure it cost
  // more than everything else here put together.
  const keyToAssureProperRefresh = `${revisionOf(trackGeojson)}-${displayingElevationChart}`;

  // Flatten line-like features into per-segment render entries, keeping each
  // segment's source feature index so a click selects that whole track and the
  // selected one is highlighted (a `MultiLineString` is one track over several
  // segments). Memoized so it doesn't re-traverse every coordinate on unrelated
  // re-renders (zoom, selection, …).
  const features = useMemo(
    () =>
      trackGeojson.features.flatMap((feature, featureIndex) => {
        const geom = feature.geometry;

        if (geom.type !== 'LineString' && geom.type !== 'MultiLineString') {
          return [];
        }

        const segments =
          geom.type === 'LineString' ? [geom.coordinates] : geom.coordinates;

        return segments.map((coords) => {
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
            name: feature.properties?.['name'] as string | undefined,
            featureIndex,
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
    const polygons: ReturnType<typeof polygonEntry>[] = [];

    const points: {
      lat: number;
      lon: number;
      featureIndex: number;
      properties: GeoJsonProperties;
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
          });

          continue;
        }

        if (geom.type === 'Polygon') {
          polygons.push(
            polygonEntry(feature, geom.coordinates, featureIndex, defaultStyle),
          );
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
        })),
        ...split.preview.tail.map((positions, i) => ({
          key: `tail-${i}`,
          positions,
          options: TAIL_HALO,
        })),
      ]
    : features.flatMap(({ lineData, featureIndex }, i) =>
        featureIndex === selectedIndex || featureIndex === join.hovered
          ? [
              {
                key: `line-${i}`,
                positions: lineData,
                options: featureIndex === join.hovered ? TAIL_HALO : HEAD_HALO,
              },
            ]
          : [],
      );

  const timeFormat = useDateTimeFormat({
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Fragment key={keyToAssureProperRefresh}>
      {/* Below the line foreground (overlayPane, zIndex 400) so the active
          track's wider blue halo shows as an outline around it without changing
          the line's own style. */}
      <Pane name="fm-trackviewer-highlight" style={{ zIndex: 398 }} />

      <Pane name="fm-trackviewer-polygons" style={{ zIndex: 399 }} />

      {/* Above the hotline canvas (default overlayPane, zIndex 400) so the
          invisible outline below catches clicks even when the track is
          colorized; below markerPane (600) so waypoints stay clickable. */}
      <Pane name="fm-trackviewer-hit" style={{ zIndex: 450 }} />

      {halos.map(({ key, positions, options }) => (
        <Polyline
          key={`halo-${key}`}
          pane="fm-trackviewer-highlight"
          weight={haloWidth + 6}
          positions={positions}
          pathOptions={options}
          interactive={false}
        />
      ))}

      {polygons
        .filter(({ featureIndex }) => featureIndex === selectedIndex)
        .map(({ positions, style }, i) => (
          <Polygon
            key={`poly-highlight-${i}`}
            pane="fm-trackviewer-highlight"
            weight={style.width + 6}
            positions={positions}
            pathOptions={{
              color: SELECTION_COLOR,
              opacity: 1,
              fill: false,
              lineJoin: 'round',
            }}
            interactive={false}
          />
        ))}

      {features.map(({ lineData, name, style, featureIndex }, i) => (
        <Polyline
          key={`outline-${i}-${interactive ? 'a' : 'b'}`}
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
          {name && (
            <Tooltip className="compact" direction="top" permanent>
              <span>{name}</span>
            </Tooltip>
          )}
        </Polyline>
      ))}

      {activeColorizer &&
        colorizedRuns.flatMap(({ noData, runs }, i) => [
          ...noData.map((run, j) => (
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
          ...runs.map((run, j) => (
            <Hotline
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
              key={`poly-${i}-${interactive ? 'a' : 'b'}`}
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
              key={`poly-${i}-${interactive ? 'a' : 'b'}`}
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

      {polygons.map(({ positions, name, style, featureIndex }, i) => (
        <Polygon
          key={`mpoly-${i}-${interactive ? 'a' : 'b'}`}
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
          {name && (
            <Tooltip className="compact" direction="top" permanent>
              <span>{name}</span>
            </Tooltip>
          )}
        </Polygon>
      ))}

      {points.map(({ lat, lon, properties, featureIndex }, i) => (
        <WaypointMarker
          key={`point-${i}`}
          lat={lat}
          lon={lon}
          name={properties?.['name']}
          properties={properties}
          interactive={interactive}
          selected={featureIndex === selectedIndex}
          onClick={() => select(featureIndex)}
        />
      ))}

      {startPoints.map((p, i) => (
        <RichMarker
          faIcon={<FaPlay color="#409a40" />}
          key={`sp-${i}`}
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
          key={`fp-${i}`}
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
}

function WaypointMarker({
  lat,
  lon,
  name,
  properties,
  interactive,
  selected,
  onClick,
}: {
  lat: number;
  lon: number;
  name: string | undefined;
  properties: Record<string, unknown> | null | undefined;
  interactive: boolean;
  selected: boolean;
  onClick: () => void;
}): ReactElement {
  const style = pointStyleFromProperties(properties);

  const contentProps = useIconContentProps(style.icon);

  // The track-viewer default style colors and shapes unstyled waypoints.
  const defaultStyle = useAppSelector(
    (state) => state.trackViewerSettings.style,
  );

  const color = style.color ?? defaultStyle.color;

  // Selection pales the shape and keeps the glyph in the point's own color, as
  // a selected drawing point is drawn.
  const renderColor = selected ? paleColor(color) : color;

  const glyphColor = selected ? splitColorAlpha(color).color : undefined;

  // No icon spec resolved → fall back to the legacy flag glyph.
  const hasIconContent =
    contentProps.poi ?? contentProps.iconSvg ?? contentProps.label;

  return (
    <RichMarker
      position={{ lat, lng: lon }}
      color={renderColor}
      glyphColor={glyphColor}
      markerType={style.markerType ?? defaultStyle.markerType}
      interactive={interactive}
      eventHandlers={{ click: onClick }}
      {...(hasIconContent
        ? contentProps
        : { faIcon: <FaFlag color={color} /> })}
    >
      {name && (
        <Tooltip className="compact" direction="top" permanent>
          <span>{name}</span>
        </Tooltip>
      )}
    </RichMarker>
  );
}
