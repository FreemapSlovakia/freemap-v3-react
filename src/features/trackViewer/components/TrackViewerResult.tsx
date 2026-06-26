import { setTool } from '@app/store/actions.js';
import { selectingModeSelector } from '@app/store/selectors.js';
import { ElevationChartActivePoint } from '@features/elevationChart/components/ElevationChartActivePoint.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import {
  NO_DATA_COLOR,
  NO_DATA_OPACITY,
  noDataRuns,
  splitOnGaps,
} from '@shared/colorizers/colorize.js';
import { colorizers } from '@shared/colorizers/index.js';
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
import {
  Feature,
  FeatureCollection,
  LineString,
  Point,
  Polygon as PolygonGeometry,
} from 'geojson';
import { Point as LPoint } from 'leaflet';
import { Fragment, ReactElement, useMemo } from 'react';
import { FaFlag, FaPlay, FaStop } from 'react-icons/fa';
import { Pane, Polygon, Polyline, Tooltip } from 'react-leaflet';
import { Hotline } from 'react-leaflet-hotline';
import { useDispatch } from 'react-redux';
import { useStartFinishPoints } from '../hooks/useStartFinishPoints.js';
import { trackViewerSetSelectedTrack } from '../model/actions.js';
import { isTrackLine, resolveActiveTrack } from '../trackSelection.js';

interface GetFeatures {
  (type: 'LineString'): Feature<LineString>[];
  (type: 'Point'): Feature<Point>[];
  (type: 'Polygon'): Feature<PolygonGeometry>[];
}

export default function TrackViewerResult({
  trackGeojson,
}: {
  trackGeojson: FeatureCollection;
}): ReactElement | null {
  const language = useAppSelector((state) => state.l10n.language);

  const [startPoints, finishPoints] = useStartFinishPoints();

  const displayingElevationChart = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const colorizeTrackBy = useAppSelector(
    (state) => state.trackViewer.colorizeTrackBy,
  );

  // Style unstyled features with the current drawing defaults so the preview
  // matches what "convert to drawing" will produce.
  const drawingColor = useAppSelector(
    (state) => state.drawingSettings.style.color,
  );

  const drawingWidth = useAppSelector(
    (state) => state.drawingSettings.style.width,
  );

  const drawingFillColor = useAppSelector(
    (state) => state.drawingSettings.style.fillColor,
  );

  const getFeatures: GetFeatures = (type: 'LineString' | 'Point' | 'Polygon') =>
    flatten(trackGeojson).features.filter((f) => f.geometry?.type === type);

  const activeColorizer = colorizeTrackBy ? colorizers[colorizeTrackBy] : null;

  const zoom = useAppSelector((state) => state.map.zoom);

  // Memoized so the per-zoom colorize cache survives across renders.
  // biome-ignore lint/correctness/useExhaustiveDependencies: getFeatures derives only from trackGeojson
  const lineFeatures = useMemo(() => getFeatures('LineString'), [trackGeojson]);

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
      palette: activeColorizer?.palette,
    }),
    [activeColorizer],
  );

  const interactive = useAppSelector(selectingModeSelector);

  const selectedTrackIndex = useAppSelector(
    (state) => state.trackViewer.selectedTrackIndex,
  );

  // The active track only matters (and is only selectable/highlighted) when
  // several lines are loaded; otherwise the single line is implicitly active.
  const multipleTracks = trackGeojson.features.filter(isTrackLine).length > 1;

  const activeTrackIndex = resolveActiveTrack(
    trackGeojson,
    selectedTrackIndex,
  )?.index;

  const dispatch = useDispatch();

  const setThisTool = () => {
    dispatch(setTool({ tool: 'import-file', mode: 'open' }));
  };

  // Clicking a line focuses the import tool and, when several tracks are
  // loaded, makes the clicked one active for the chart / "more info".
  const selectTrack = (featureIndex: number) => {
    if (multipleTracks) {
      dispatch(trackViewerSetSelectedTrack(featureIndex));
    }

    setThisTool();
  };

  // TODO rather compute some hash or better - detect real change
  const keyToAssureProperRefresh = `OOXlDWrtVn-${
    (JSON.stringify(trackGeojson) + displayingElevationChart).length
  }`; // otherwise GeoJSON will still display the first data

  // Fallback fill opacity, used only when no fill color is resolvable at all
  // (e.g. the user cleared drawingFillColor). Passing an explicit number is
  // required: Leaflet's `setOptions` copies `fillOpacity: undefined` over its
  // own 0.2 default, which renders the fill fully opaque.
  const defaultFillOpacity = 0.2;

  // Flatten line-like features into per-segment render entries, keeping each
  // segment's source feature index so a click can select that whole track and
  // the active one can be highlighted (a `MultiLineString` is one track over
  // several segments).
  const features = trackGeojson.features.flatMap((feature, featureIndex) => {
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

      const stroke = splitColorAlpha(style.color ?? drawingColor);

      // Same default-fill treatment as native polygons below (ignored for
      // lines, which render as unfilled Polylines).
      const fillSpec = style.fillColor ?? drawingFillColor;

      const fill = splitColorAlpha(fillSpec ?? style.color ?? drawingColor);

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
          width: style.width ?? drawingWidth,
          dashArray: style.dashArray,
          lineCap: style.lineCap,
          lineJoin: style.lineJoin,
        },
      };
    });
  });

  // Native GeoJSON Polygon geometry (e.g. an imported .geojson; MultiPolygon
  // is split into Polygon features by `flatten`). GPX never produces these —
  // its "polygons" arrive as closed LineStrings handled above. Each Polygon's
  // coordinates are [outerRing, ...holes], which Leaflet's Polygon renders
  // directly as positions.
  const polygons = getFeatures('Polygon').map((feature) => {
    const style = lineStyleFromProperties(feature.properties, true);

    const stroke = splitColorAlpha(style.color ?? drawingColor);

    // With no explicit fill, fall back to the drawing default fill so an
    // unstyled imported polygon looks like a freshly drawn one (semitransparent)
    // rather than a solid blob.
    const fillSpec = style.fillColor ?? drawingFillColor;

    const fill = splitColorAlpha(fillSpec ?? style.color ?? drawingColor);

    return {
      name: feature.properties?.['name'],
      positions: feature.geometry.coordinates.map((ring) =>
        ring.map(([lng, lat]) => ({ lat: lat!, lng: lng! })),
      ),
      style: {
        strokeColor: stroke.color,
        strokeOpacity: stroke.opacity,
        fillColor: fill.color,
        fillOpacity: fillSpec ? fill.opacity : defaultFillOpacity,
        width: style.width ?? drawingWidth,
        dashArray: style.dashArray,
        lineCap: style.lineCap,
        lineJoin: style.lineJoin,
      },
    };
  });

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

      {multipleTracks &&
        features
          .filter(({ featureIndex }) => featureIndex === activeTrackIndex)
          .map(({ lineData, style }, i) => (
            <Polyline
              key={`highlight-${i}`}
              pane="fm-trackviewer-highlight"
              weight={style.width + 6}
              positions={lineData}
              pathOptions={{
                color: '#156efd',
                opacity: 1,
                lineCap: 'round',
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
            click: () => selectTrack(featureIndex),
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
        colorizedPositions.flatMap((positions, i) => [
          ...noDataRuns(positions).map((run, j) => (
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
          ...splitOnGaps(positions).map((run, j) => (
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

      {colorizeTrackBy === null &&
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
                click: () => selectTrack(featureIndex),
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
                click: () => selectTrack(featureIndex),
              }}
            />
          );
        })}

      {polygons.map(({ positions, name, style }, i) => (
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
            click: setThisTool,
          }}
        >
          {name && (
            <Tooltip className="compact" direction="top" permanent>
              <span>{name}</span>
            </Tooltip>
          )}
        </Polygon>
      ))}

      {getFeatures('Point').map(({ geometry, properties }, i) => (
        <WaypointMarker
          key={`point-${i}-${interactive ? 'a' : 'b'}`}
          lat={geometry.coordinates[1]!}
          lon={geometry.coordinates[0]!}
          name={properties?.['name']}
          properties={properties}
          interactive={interactive}
          onClick={setThisTool}
        />
      ))}

      {startPoints.map((p, i) => (
        <RichMarker
          faIcon={<FaPlay color="#409a40" />}
          key={`sp-${i}-${interactive ? 'a' : 'b'}`}
          color="#409a40"
          interactive={interactive}
          position={{ lat: p.lat, lng: p.lon }}
          eventHandlers={{
            click: setThisTool,
          }}
        >
          {p.startTime && !isNaN(new Date(p.startTime).getTime()) && (
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
          key={`fp-${i}-${interactive ? 'a' : 'b'}`}
          color="#d9534f"
          interactive={interactive}
          position={{ lat: p.lat, lng: p.lon }}
          eventHandlers={{
            click: setThisTool,
          }}
        >
          <Tooltip
            className="compact"
            offset={new LPoint(10, 10)}
            direction="right"
            permanent
          >
            <span>
              {p.finishTime && !isNaN(new Date(p.finishTime).getTime()) && (
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

      <ElevationChartActivePoint />
    </Fragment>
  );
}

function WaypointMarker({
  lat,
  lon,
  name,
  properties,
  interactive,
  onClick,
}: {
  lat: number;
  lon: number;
  name: string | undefined;
  properties: Record<string, unknown> | null | undefined;
  interactive: boolean;
  onClick: () => void;
}): ReactElement {
  const style = pointStyleFromProperties(properties);

  const contentProps = useIconContentProps(style.icon);

  // Match the drawing default point color for unstyled waypoints.
  const drawingColor = useAppSelector(
    (state) => state.drawingSettings.style.color,
  );

  // No icon spec resolved → fall back to the legacy flag glyph.
  const hasIconContent =
    contentProps.image || contentProps.iconSvg || contentProps.label;

  return (
    <RichMarker
      position={{ lat, lng: lon }}
      color={style.color ?? drawingColor}
      markerType={style.markerType}
      interactive={interactive}
      eventHandlers={{ click: onClick }}
      {...(hasIconContent
        ? contentProps
        : { faIcon: <FaFlag color={style.color ?? drawingColor} /> })}
    >
      {name && (
        <Tooltip
          className="compact"
          offset={new LPoint(10, 10)}
          direction="right"
          permanent
        >
          <span>{name}</span>
        </Tooltip>
      )}
    </RichMarker>
  );
}
