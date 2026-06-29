import type { RootState } from '@app/store/store.js';
import type { DrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import type { MarkerType } from '@features/objects/model/actions.js';
import type { RoutePlannerState } from '@features/routePlanner/model/reducer.js';
import { loadRoutePlannerMessages } from '@features/routePlanner/translations/loadRoutePlannerMessages.js';
import type { RoutePlannerMessages } from '@features/routePlanner/translations/RoutePlannerMessages.js';
import type { TrackingState } from '@features/tracking/model/reducer.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { resolveGenericName } from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import { poiIconBBoxes } from '@osm/poiIconBBoxes.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import {
  buildMarkerSvg,
  fetchSvgText,
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
import { fetchPictures, type Picture } from './processors/fetchPictures.js';

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
  plannedRouteWithStops?: boolean;
  tracking?: boolean;
  import?: boolean;
  search?: boolean;
}

export interface BuildExportOptions {
  /**
   * Planned-route geometry: `all` emits every alternative as a MultiLineString
   * (data export); `active` emits only the active alternative as a single
   * LineString (raster map).
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
  poiSvgCache: Map<string, Promise<string | undefined>>;
}

interface MarkerSpec {
  markerType: MarkerType | undefined;
  color: string;
  icon?: string;
  label?: string;
  /**
   * Pre-resolved icon image URL (e.g. an OSM-tag-resolved POI SVG). When set it
   * is fetched and embedded instead of resolving `icon`.
   */
  iconUrl?: string;
  /** Icon spec to use when neither `icon`/`label` nor `iconUrl` yields content. */
  fallbackIcon?: string;
}

// Resolves a POI icon (the bundled SVG URL) from a feature's OSM tags — the
// same mapping the in-app POI and search markers use. Returns undefined when no
// tag matches. Non-string property values are ignored.
function osmTagIconUrl(
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

  if (!glyph.hasContent && spec.iconUrl) {
    let p = caches.poiSvgCache.get(spec.iconUrl);

    if (!p) {
      p = fetchSvgText(spec.iconUrl);
      caches.poiSvgCache.set(spec.iconUrl, p);
    }

    const poiSvg = await p;

    if (poiSvg) {
      glyph = {
        poiSvg,
        poiBBox: poiIconBBoxes[spec.iconUrl],
        hasContent: true,
      };
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
    poiSvg: glyph.poiSvg,
    poiBBox: glyph.poiBBox,
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
// markers, lines/polygons become simplestyle. Mirrors how `TrackViewerResult`
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
          iconUrl: style.icon ? undefined : osmTagIconUrl(props),
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
  for (const {
    lat,
    lon,
    id,
    takenAt,
    title,
    description,
    createdAt,
    user,
    tags,
    hmac,
  } of pictures) {
    let imageUrl = `${process.env['API_URL']}/gallery/pictures/${id}/image`;

    if (hmac) {
      imageUrl += '&hmac=' + encodeURIComponent(hmac);
    }

    features.push(
      point([lon, lat], {
        takenAt: takenAt ? takenAt.toISOString() : undefined,
        publishedAt: createdAt ? createdAt.toISOString() : undefined,
        title,
        description,
        imageUrl,
        webUrl: `${location.origin}?image=${id}`,
        author: user,
        tags,
      }),
    );
  }
}

function addPlannedRoute(
  features: Feature[],
  {
    alternatives,
    activeAlternativeIndex,
    points,
    finishOnly,
  }: RoutePlannerState,
  selection: 'all' | 'active',
  withStops: boolean,
  rpm: RoutePlannerMessages,
) {
  if (withStops) {
    for (const [i, pt] of points.entries()) {
      features.push(
        point([pt.lon, pt.lat], {
          title:
            i === 0 && !finishOnly
              ? rpm.start
              : i === points.length - 1
                ? rpm.finish
                : rpm.stop + ' ' + (i + 1),
        }),
      );
    }
  }

  if (selection === 'active') {
    const alt = alternatives[activeAlternativeIndex];

    if (alt) {
      const coords: Position[] = [];

      for (const leg of alt.legs) {
        for (const step of leg.steps) {
          coords.push(...step.geometry.coordinates);
        }
      }

      if (coords.length >= 2) {
        features.push(lineString(coords, {}));
      }
    }

    return;
  }

  for (const [i, { legs }] of alternatives.entries()) {
    features.push(
      multiLineString(
        legs.flatMap((leg) =>
          leg.steps.map((step) => step.geometry.coordinates),
        ),
        {
          title: rpm.alternative + ' ' + (i + 1),
        },
      ),
    );
  }
}

function addTracking(
  features: Feature[],
  { tracks, trackedDevices }: TrackingState,
  trackingPoints: boolean,
) {
  const tdMap = new Map(trackedDevices.map((td) => [td.token, td]));

  const tracks1 = tracks.map((track) => ({
    ...track,
    ...(tdMap.get(track.token) ?? {}),
  }));

  for (const track of tracks1) {
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
    tracking,
    trackViewer,
    trackViewerSettings,
    search,
    searchSettings,
  } = getState();

  const caches: Caches = {
    faCache: new Map(),
    poiSvgCache: new Map(),
  };

  const markerMode = Boolean(pointMode.svgMarker || pointMode.pngMarker);

  const features: Feature[] = [];

  if (include.pictures) {
    addPictures(features, await fetchPictures(getState));
  }

  for (const line of drawingLines.lines) {
    if (line.type === 'line' ? !include.drawingLines : !include.drawingAreas) {
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
          ? { type: 'Polygon', coordinates: [positions] }
          : { type: 'LineString', coordinates: positions },
    });
  }

  if (include.drawingPoints) {
    for (const p of drawingPoints.points) {
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
    for (const { coords, tags } of objects.objects) {
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
            iconUrl: osmTagIconUrl(tags),
          },
          pointMode,
          caches,
        ),
      );

      features.push(point([coords.lon, coords.lat], props));
    }
  }

  if (include.plannedRoute || include.plannedRouteWithStops) {
    addPlannedRoute(
      features,
      routePlanner,
      options.route ?? 'all',
      Boolean(include.plannedRouteWithStops),
      await loadRoutePlannerMessages(getState().l10n.language),
    );
  }

  if (include.tracking) {
    addTracking(features, tracking, options.trackingPoints ?? true);
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
    const geojson = search.selectedResult?.geojson;

    const searchFeatures =
      geojson?.type === 'FeatureCollection'
        ? geojson.features
        : geojson?.type === 'Feature'
          ? [geojson]
          : [];

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
