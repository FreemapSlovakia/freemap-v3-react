import type { Selection } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import type { MarkerType } from '@features/objects/model/actions.js';
import {
  ISOCHRONE_FILL_OPACITY,
  isochroneColor,
  isochroneLabel,
} from '@features/routePlanner/model/isochrones.js';
import type { RoutePlannerState } from '@features/routePlanner/model/reducer.js';
import {
  dominantStepMode,
  INACTIVE_ALTERNATIVE_COLOR,
  routeModeRuns,
  STEP_MODE_COLORS,
  stepModeDashArray,
  stopNumber,
  WAYPOINT_COLORS,
  WAYPOINT_ICONS,
  waypointKind,
} from '@features/routePlanner/model/routeColors.js';
import type { RoutePlannerSettingsState } from '@features/routePlanner/model/settingsReducer.js';
import { loadRoutePlannerMessages } from '@features/routePlanner/translations/loadRoutePlannerMessages.js';
import type { RoutePlannerMessages } from '@features/routePlanner/translations/RoutePlannerMessages.js';
import { hasGeometry } from '@features/search/model/resultUtils.js';
import type { TrackingState } from '@features/tracking/model/reducer.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { resolveGenericName } from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { poiIcons } from '@osm/poiIcons.js';
import { joinColorAlpha, splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import {
  buildMarkerSvg,
  resolveMarkerGlyph,
  svgToPngDataUrl,
  utf8ToBase64,
} from '@shared/markerSvg.js';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from '@shared/styleFromProperties.js';
import {
  featureCollection,
  lineString,
  multiLineString,
  point,
} from '@turf/helpers';
import type { Feature, FeatureCollection, Position } from 'geojson';
import { iconSpecToGarminSym } from '../garminSymMapping.js';
import {
  fetchPictures,
  type Picture,
  pictureExportUrls,
} from './processors/fetchPictures.js';
import {
  keepDrawingLine,
  keepDrawingPoint,
  keepObject,
  selectedTrackToken,
} from './selectionFilter.js';

// Which point representations to emit. Combinable: a data export wants
// `props`; the raster map server wants `svgMarker`; `pngMarker` rasterizes the
// same SVG (for consumers that can't render inline SVG).
export interface PointRenderMode {
  /** Lightweight simplestyle + freemap/markerType/icon properties. */
  props?: boolean;
  /** Self-contained `marker-svg` (shape + color + icon baked in). */
  svgMarker?: boolean;
  /** Rasterized `marker-png` data URL. */
  pngMarker?: boolean;
}

// Per-source switches. Mirrors the `Exportable` vocabulary so each handler maps
// its own selection onto these flags.
export interface ExportInclude {
  pictures?: boolean;
  drawingLines?: boolean;
  drawingAreas?: boolean;
  drawingPoints?: boolean;
  objects?: boolean;
  plannedRoute?: boolean;
  tracking?: boolean;
  import?: boolean;
  search?: boolean;
}

export interface BuildExportOptions {
  /**
   * Restrict the output to the single selected map feature. When set, each
   * source emits only the item this selection targets; sources the selection
   * doesn't target emit nothing. Undefined exports every included source.
   */
  only?: Selection;
  /**
   * Planned-route geometry: `all` emits every alternative as one
   * MultiLineString (data export); `active` emits only the active alternative,
   * split into one LineString per same-mode stretch so each carries the color
   * and dash the map gives it (raster map).
   */
  route?: 'all' | 'active';
  /**
   * Emit a Point per GPS sample (data export) alongside the tracking line. A
   * raster map wants the line only. Defaults to `true`.
   */
  trackingPoints?: boolean;
  /** Fallback stroke for drawing lines with no color of their own. */
  lineColorFallback?: string;
  /** Fallback width for drawing lines with no width of their own. */
  lineWidthFallback?: number;
}

interface Caches {
  faCache: Map<string, IconDefinition | undefined>;
}

interface MarkerSpec {
  markerType: MarkerType | undefined;
  color: string;
  icon?: string;
  label?: string;
  /**
   * Pre-resolved poi icon name (e.g. resolved from OSM tags). When set, its
   * drawing is embedded instead of resolving `icon`.
   */
  iconName?: string;
  /** Icon spec to use when neither `icon`/`label` nor `iconName` yields content. */
  fallbackIcon?: string;
}

// Resolves the bundled poi icon name from a feature's OSM tags — the same
// mapping the in-app POI and search markers use. Returns undefined when no tag
// matches. Non-string property values are ignored.
function osmTagIconName(
  props: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!props) {
    return undefined;
  }

  const tags: Record<string, string> = {};

  for (const [k, v] of Object.entries(props)) {
    if (typeof v === 'string') {
      tags[k] = v;
    }
  }

  return resolveGenericName(osmTagToIconMapping, tags)[0];
}

// Bakes the `marker-svg` / `marker-png` properties for a point, mirroring the
// in-app RichMarker. Returns an empty object when no marker mode is requested
// (so a props-only export leaves points untouched).
async function bakeMarkerProps(
  spec: MarkerSpec,
  mode: PointRenderMode,
  caches: Caches,
): Promise<Record<string, string>> {
  if (!mode.svgMarker && !mode.pngMarker) {
    return {};
  }

  // Glyph source priority: explicit icon spec (fm:icon / sym / osmand:icon,
  // with a ≤2-char label as inline text) → an OSM-tag-resolved icon image →
  // the explicit fallback (e.g. a flag).
  let glyph = await resolveMarkerGlyph({
    icon: spec.icon,
    label: spec.label,
    ...caches,
  });

  if (!glyph.hasContent && spec.iconName) {
    const poi = poiIcons[spec.iconName];

    if (poi) {
      glyph = { poi, hasContent: true };
    }
  }

  if (!glyph.hasContent && spec.fallbackIcon) {
    glyph = await resolveMarkerGlyph({ icon: spec.fallbackIcon, ...caches });
  }

  const { svg, width, height } = buildMarkerSvg({
    markerType: spec.markerType,
    color: spec.color,
    hasContent: glyph.hasContent,
    text: glyph.text,
    faSvg: glyph.faSvg,
    poi: glyph.poi,
    // Center the anchor so a shape-agnostic renderer places every marker by
    // centering it on the coordinate.
    anchorAtCenter: true,
  });

  const out: Record<string, string> = {};

  if (mode.svgMarker) {
    out['marker-svg'] = svg;
  }

  if (mode.pngMarker) {
    const png = await svgToPngDataUrl(
      `data:image/svg+xml;base64,${utf8ToBase64(svg)}`,
      width,
      height,
    );

    if (png) {
      out['marker-png'] = png;
    }
  }

  return out;
}

// Converts a foreign GeoJSON FeatureCollection (an imported GPX/GeoJSON track
// or a search result, carrying simplestyle / freemap:* / osmand:* / Garmin
// <sym> styling in its properties) into export features: points become baked
// markers, lines/polygons become simplestyle. Mirrors how `DataViewerResult`
// renders the same features in-app, so the export matches the on-screen
// preview. Unstyled features fall back to the supplied default style (the
// track-viewer or search result style, matching the on-map rendering).
async function convertForeignFeatures(
  features: Feature[],
  defaults: DrawingStyle,
  mode: PointRenderMode,
  caches: Caches,
): Promise<Feature[]> {
  const out: Feature[] = [];

  for (const feature of features) {
    const geom = feature.geometry;

    if (!geom || geom.type === 'GeometryCollection') {
      continue;
    }

    const props = feature.properties;
    const rawName = props?.['name'];
    const name = typeof rawName === 'string' ? rawName : '';

    if (geom.type === 'Point' || geom.type === 'MultiPoint') {
      const style = pointStyleFromProperties(props);

      const markerProps = await bakeMarkerProps(
        {
          markerType: style.markerType ?? defaults.markerType,
          color: style.color ?? defaults.color,
          icon: style.icon,
          label: name,
          // No explicit icon → resolve one from OSM tags (search results /
          // POIs), then fall back to a flag glyph (matching the in-app
          // waypoint).
          iconName: style.icon ? undefined : osmTagIconName(props),
          fallbackIcon: 'fa:flag',
        },
        mode,
        caches,
      );

      const coordsList: Position[] =
        geom.type === 'Point' ? [geom.coordinates] : geom.coordinates;

      for (const coordinates of coordsList) {
        out.push({
          type: 'Feature',
          properties: { title: name, ...markerProps },
          geometry: { type: 'Point', coordinates },
        });
      }

      continue;
    }

    // LineString / Polygon / Multi* → simplestyle.
    const closed =
      geom.type === 'Polygon' ||
      geom.type === 'MultiPolygon' ||
      (geom.type === 'LineString' &&
        geom.coordinates.length > 2 &&
        geom.coordinates[0][0] ===
          geom.coordinates[geom.coordinates.length - 1][0] &&
        geom.coordinates[0][1] ===
          geom.coordinates[geom.coordinates.length - 1][1]);

    const style = lineStyleFromProperties(props, closed);

    const stroke = splitColorAlpha(style.color ?? defaults.color);

    const fillSpec = style.fillColor ?? defaults.fillColor;
    const fill = fillSpec ? splitColorAlpha(fillSpec) : undefined;

    out.push({
      type: 'Feature',
      properties: {
        title: name,
        stroke: stroke.color,
        'stroke-opacity': stroke.opacity < 1 ? stroke.opacity : undefined,
        fill: fill?.color,
        'fill-opacity': fill && fill.opacity < 1 ? fill.opacity : undefined,
        'stroke-width': style.width ?? defaults.width,
        'stroke-linejoin': style.lineJoin ?? defaults.lineJoin,
        'stroke-linecap': style.lineCap ?? defaults.lineCap,
        'stroke-dasharray': style.dashArray ?? defaults.dashArray,
      },
      geometry: geom,
    });
  }

  return out;
}

function addPictures(features: Feature[], pictures: Picture[]) {
  for (const picture of pictures) {
    const {
      lat,
      lon,
      takenAt,
      title,
      description,
      createdAt,
      user,
      tags,
      license,
      azimuth,
    } = picture;

    const { imageUrl, webUrl, commonsUrl } = pictureExportUrls(picture);

    features.push(
      point([lon, lat], {
        takenAt: takenAt ? takenAt.toISOString() : undefined,
        publishedAt: createdAt ? createdAt.toISOString() : undefined,
        title,
        description,
        imageUrl,
        webUrl,
        commonsUrl,
        author: user ?? undefined,
        license: license ?? undefined,
        azimuth: azimuth ?? undefined,
        tags,
      }),
    );
  }
}

async function addPlannedRoute(
  features: Feature[],
  {
    alternatives,
    activeAlternativeIndex,
    isochrones,
    points,
    waypoints,
    finishOnly,
    mode,
  }: RoutePlannerState,
  { lineWidth, lineOpacity, markerOpacity }: RoutePlannerSettingsState,
  selection: 'all' | 'active',
  rpm: RoutePlannerMessages,
  language: string,
  pointMode: PointRenderMode,
  caches: Caches,
) {
  // The start/finish/stop markers are part of what the route puts on the map,
  // so they always come along, in the colors and glyphs the map gives them.
  for (const [i, pt] of points.entries()) {
    const kind = waypointKind(i, points.length, finishOnly, mode);

    // `markerOpacity` rides on the color's alpha: both the baked SVG and the
    // in-app marker turn it into a group opacity, fading shape, inset and glyph
    // together.
    const color = joinColorAlpha(WAYPOINT_COLORS[kind], markerOpacity);

    const number = stopNumber(i, mode, waypoints);

    // Stops are numbered inside their marker, in the visiting order the map
    // shows.
    const label =
      kind === 'stop' && number !== undefined ? String(number) : undefined;

    const props: Record<string, unknown> = {};

    // A waypoint's name is generated boilerplate, and its marker already shows
    // the play/stop glyph or the stop's number — so it goes only into the data
    // formats, where a name is the sole way to tell waypoints apart. A rendered
    // map would just get "Start"/"Finish" repeating what the marker says.
    if (pointMode.props) {
      props['title'] =
        kind === 'start'
          ? rpm.start
          : kind === 'finish'
            ? rpm.finish
            : `${rpm.stop} ${number ?? i}`;

      props['marker-color'] = WAYPOINT_COLORS[kind];

      if (markerOpacity < 1) {
        props['marker-color-opacity'] = markerOpacity;
      }
    }

    Object.assign(
      props,
      await bakeMarkerProps(
        {
          markerType: 'pin',
          color,
          icon: WAYPOINT_ICONS[kind],
          label,
        },
        pointMode,
        caches,
      ),
    );

    features.push(point([pt.lon, pt.lat], props));
  }

  // Isochrones replace the route alternatives, so they are what the route
  // source exports when present. Simplestyle mirrors the on-map rendering:
  // per-bucket stroke color, fill on the outermost ring only.
  if (isochrones?.length) {
    for (const isochrone of isochrones) {
      const bucket = isochrone.properties?.['bucket'] ?? 0;

      const color = isochroneColor(bucket, isochrones.length);

      features.push({
        type: 'Feature',
        properties: {
          title: isochroneLabel(isochrone, bucket, rpm.isochroneRing, language),
          stroke: color,
          'stroke-opacity': lineOpacity < 1 ? lineOpacity : undefined,
          'stroke-width': lineWidth,
          fill: color,
          // The inner rings are outlines only; a fully transparent fill says so
          // explicitly, so no consumer falls back to a default fill. The map
          // fades the whole ring group, so the fill takes `lineOpacity` on top
          // of its own.
          'fill-opacity':
            bucket === isochrones.length - 1
              ? ISOCHRONE_FILL_OPACITY * lineOpacity
              : 0,
        },
        geometry: isochrone.geometry,
      });
    }

    return;
  }

  // One feature per same-mode stretch, each in the color the map paints it, so
  // a multimodal route reads the same on paper as on screen.
  if (selection === 'active') {
    const alt = alternatives[activeAlternativeIndex];

    for (const run of alt ? routeModeRuns(alt) : []) {
      features.push(
        lineString(run.coordinates, {
          stroke: STEP_MODE_COLORS[run.mode],
          'stroke-opacity': lineOpacity < 1 ? lineOpacity : undefined,
          'stroke-width': lineWidth,
          'stroke-dasharray': stepModeDashArray(run.mode),
        }),
      );
    }

    return;
  }

  for (const [i, alternative] of alternatives.entries()) {
    const dominant = dominantStepMode(alternative);

    features.push(
      multiLineString(
        alternative.legs.flatMap((leg) =>
          leg.steps.map((step) => step.geometry.coordinates),
        ),
        {
          title: `${rpm.alternative} ${i + 1}`,
          // One feature per alternative keeps the data export's structure, so
          // a multimodal route gets its dominant mode's color rather than a
          // per-stretch one. Alternatives the user isn't following are drawn
          // dimmed, as on the map.
          stroke:
            i === activeAlternativeIndex
              ? STEP_MODE_COLORS[dominant]
              : INACTIVE_ALTERNATIVE_COLOR,
          'stroke-opacity': lineOpacity < 1 ? lineOpacity : undefined,
          'stroke-width': lineWidth,
          'stroke-dasharray': stepModeDashArray(dominant),
        },
      ),
    );
  }
}

function addTracking(
  features: Feature[],
  { tracks, trackedDevices }: TrackingState,
  trackingPoints: boolean,
  onlyToken: string | null,
) {
  const tdMap = new Map(trackedDevices.map((td) => [td.token, td]));

  const tracks1 = tracks.map((track) => ({
    ...track,
    ...(tdMap.get(track.token) ?? {}),
  }));

  for (const track of tracks1) {
    if (onlyToken !== null && String(track.token) !== onlyToken) {
      continue;
    }

    const stroke = track.color ? splitColorAlpha(track.color) : undefined;

    // A line needs ≥2 points; a device that has produced 0 or 1 fix would make
    // turf's lineString throw and abort the whole export, so emit only the
    // points for it.
    if (track.trackPoints.length >= 2) {
      features.push(
        lineString(
          track.trackPoints.map((tp) => [tp.lon, tp.lat]),
          {
            title: track.label,
            stroke: stroke?.color,
            'stroke-opacity':
              stroke && stroke.opacity < 1 ? stroke.opacity : undefined,
            'stroke-width': track.width,
            maxAge: track.maxAge,
            maxCount: track.maxCount,
            fromTime: track.fromTime,
            splitDistance: track.splitDistance,
            splitDuration: track.splitDuration,
          },
        ),
      );
    }

    if (!trackingPoints) {
      continue;
    }

    for (const {
      ts,
      lat,
      lon,
      altitude,
      speed,
      accuracy,
      bearing,
      battery,
      gsmSignal,
      message,
    } of track.trackPoints) {
      features.push(
        point([lon, lat], {
          time: ts,
          lat,
          lon,
          altitude,
          speed,
          accuracy,
          bearing,
          battery,
          gsmSignal,
          message,
        }),
      );
    }
  }
}

// Builds the GeoJSON FeatureCollection shared by the data export
// (`pointMode: { props: true }`) and the raster map export
// (`pointMode: { svgMarker: true }`). Source order matches the legacy
// per-handler order so output stays stable.
export async function buildExportFeatureCollection({
  getState,
  include,
  pointMode,
  options = {},
}: {
  getState: () => RootState;
  include: ExportInclude;
  pointMode: PointRenderMode;
  options?: BuildExportOptions;
}): Promise<FeatureCollection> {
  const {
    drawingLines,
    drawingPoints,
    objects,
    objectsSettings,
    routePlanner,
    routePlannerSettings,
    tracking,
    trackViewer,
    trackViewerSettings,
    search,
    searchSettings,
  } = getState();

  const caches: Caches = {
    faCache: new Map(),
  };

  const markerMode = Boolean(pointMode.svgMarker || pointMode.pngMarker);

  const { only } = options;

  const features: Feature[] = [];

  if (include.pictures) {
    addPictures(features, await fetchPictures(getState));
  }

  // A hole has no meaning apart from the polygon it belongs to: it is written
  // as one of its interior rings, and picking either one exports the shape.
  const holeIndexes = new Map<number, number[]>();

  for (const [i, line] of drawingLines.lines.entries()) {
    if (line.holeOfId !== undefined) {
      const bucket = holeIndexes.get(line.holeOfId);

      if (bucket) {
        bucket.push(i);
      } else {
        holeIndexes.set(line.holeOfId, [i]);
      }
    }
  }

  for (const [lineIndex, line] of drawingLines.lines.entries()) {
    if (line.type === 'line' ? !include.drawingLines : !include.drawingAreas) {
      continue;
    }

    if (line.holeOfId !== undefined) {
      continue;
    }

    const holes = holeIndexes.get(line.id) ?? [];

    if (![lineIndex, ...holes].some((i) => keepDrawingLine(only, i))) {
      continue;
    }

    const colorSrc = line.color ?? options.lineColorFallback;
    const stroke = colorSrc ? splitColorAlpha(colorSrc) : undefined;
    const fill = line.fillColor ? splitColorAlpha(line.fillColor) : undefined;

    const props = {
      title: line.label,
      stroke: stroke?.color,
      'stroke-opacity':
        stroke && stroke.opacity < 1 ? stroke.opacity : undefined,
      fill: fill?.color,
      'fill-opacity': fill && fill.opacity < 1 ? fill.opacity : undefined,
      'stroke-width': line.width ?? options.lineWidthFallback,
      'stroke-linecap': line.lineCap,
      'stroke-linejoin': line.lineJoin,
      'stroke-dasharray': line.dashArray,
      // freemap:* shadows preserve the raw hex (incl. alpha) so our importer
      // restores the original losslessly; other consumers ignore them.
      'freemap:color': line.color,
      'freemap:fillColor': line.fillColor,
    };

    const positions = (
      line.type === 'polygon' ? [...line.points, line.points[0]] : line.points
    ).map((p) => [p.lon, p.lat] as Position);

    features.push({
      type: 'Feature',
      properties: props,
      geometry:
        line.type === 'polygon'
          ? {
              type: 'Polygon',
              coordinates: [
                positions,
                ...holes.map((i) => {
                  const { points } = drawingLines.lines[i]!;

                  return [...points, points[0]!].map(
                    (p) => [p.lon, p.lat] as Position,
                  );
                }),
              ],
            }
          : { type: 'LineString', coordinates: positions },
    });
  }

  if (include.drawingPoints) {
    for (const [index, p] of drawingPoints.points.entries()) {
      if (!keepDrawingPoint(only, index)) {
        continue;
      }

      const props: Record<string, unknown> = { title: p.label };

      if (pointMode.props) {
        const marker = p.color ? splitColorAlpha(p.color) : undefined;

        props['marker-color'] = marker?.color;
        props['marker-color-opacity'] =
          marker && marker.opacity < 1 ? marker.opacity : undefined;
        props['marker-symbol'] = iconSpecToGarminSym(p.icon);
        props['markerType'] = p.markerType;
        props['icon'] = p.icon;
      }

      Object.assign(
        props,
        await bakeMarkerProps(
          {
            markerType: p.markerType,
            color: p.color ?? COLORS.normal,
            icon: p.icon,
            label: p.label,
          },
          pointMode,
          caches,
        ),
      );

      features.push(point([p.coords.lon, p.coords.lat], props));
    }
  }

  if (include.objects) {
    for (const { id, coords, tags } of objects.objects) {
      if (!keepObject(only, id)) {
        continue;
      }

      // Data export keeps the raw OSM tags; a marker export resolves the icon
      // from the tags (same mapping the in-app POI markers use).
      const props: Record<string, unknown> = pointMode.props
        ? { ...tags }
        : { title: tags['name'] };

      Object.assign(
        props,
        await bakeMarkerProps(
          {
            markerType: objectsSettings.selectedIcon,
            color: objectsSettings.color,
            iconName: osmTagIconName(tags),
          },
          pointMode,
          caches,
        ),
      );

      // Carry a recorded `ele` tag into the coordinate z so the elevation
      // filler treats it as recorded (keep/fill-missing/override), matching the
      // GPX handler. The tag stays in `props` for the data export too.
      const ele = Number.parseFloat(tags['ele']);

      features.push(
        point(
          Number.isNaN(ele)
            ? [coords.lon, coords.lat]
            : [coords.lon, coords.lat, ele],
          props,
        ),
      );
    }
  }

  if (include.plannedRoute) {
    await addPlannedRoute(
      features,
      routePlanner,
      routePlannerSettings,
      options.route ?? 'all',
      await loadRoutePlannerMessages(getState().l10n.language),
      getState().l10n.language,
      pointMode,
      caches,
    );
  }

  if (include.tracking) {
    addTracking(
      features,
      tracking,
      options.trackingPoints ?? true,
      selectedTrackToken(only),
    );
  }

  if (include.import && trackViewer.trackGeojson) {
    const imported = trackViewer.trackGeojson.features;

    if (markerMode) {
      features.push(
        ...(await convertForeignFeatures(
          imported,
          trackViewerSettings.style,
          pointMode,
          caches,
        )),
      );
    } else {
      features.push(...imported);
    }
  }

  if (include.search) {
    const searchFeatures = search.selectedResults
      .filter(hasGeometry)
      .flatMap(({ geojson }) =>
        geojson.type === 'FeatureCollection' ? geojson.features : [geojson],
      );

    if (markerMode) {
      features.push(
        ...(await convertForeignFeatures(
          searchFeatures,
          searchSettings.resultStyle,
          pointMode,
          caches,
        )),
      );
    } else {
      features.push(...searchFeatures);
    }
  }

  return featureCollection(features);
}
