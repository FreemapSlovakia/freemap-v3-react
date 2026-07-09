import {
  type DrawingLineType,
  isDrawingLineType,
  isLineCap,
  isLineJoin,
  type LineCap,
  type LineJoin,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { garminSymToIconSpec } from '@features/mapFeaturesExport/garminSymMapping.js';
import {
  osmAndBackgroundToMarkerType,
  osmAndIconToIconSpec,
} from '@features/mapFeaturesExport/osmandIconMapping.js';
import {
  type MarkerType,
  MarkerTypeSchema,
} from '@features/objects/model/actions.js';
import { joinColorAlpha } from '@shared/colorAlpha.js';

// Simplestyle splits a colour into a base hex plus a separate `*-opacity`
// number (e.g. `fill` + `fill-opacity`). Foreign imports (KML, third-party
// GeoJSON) use that split, so fold the opacity back into a `#RRGGBBAA` colour;
// our own `freemap:*` colours already carry alpha and skip this path.
function withSimplestyleOpacity(
  properties: Record<string, unknown> | null | undefined,
  color: string | undefined,
  opacityKey: string,
): string | undefined {
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color;
  }

  const raw = properties?.[opacityKey];

  const opacity =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? Number(raw)
        : Number.NaN;

  return Number.isFinite(opacity) ? joinColorAlpha(color, opacity) : color;
}

// Plucks drawing-point styling out of a GeoJSON feature's properties.
// Priority: freemap-private (lossless round-trip) → OsmAnd → plain GeoJSON
// keys (imported geojson) → Garmin <sym> / simplestyle marker-symbol.
// Returns undefined fields when nothing matches so the caller can fall
// back to drawing settings / OSM-tag inference.
export function pointStyleFromProperties(
  properties: Record<string, unknown> | null | undefined,
): {
  markerType?: MarkerType;
  icon?: string;
  color?: string;
} {
  const get = (key: string): string | undefined => {
    const v = properties?.[key];

    return typeof v === 'string' && v ? v : undefined;
  };

  const rawMarkerType = get('freemap:markerType') ?? get('markerType');

  const markerType =
    (rawMarkerType
      ? MarkerTypeSchema.safeParse(rawMarkerType).data
      : undefined) ?? osmAndBackgroundToMarkerType(get('osmand:background'));

  // A plain `icon` is our iconSpec (`poi:`/`fa:`/literal). togeojson also
  // surfaces a KML `<IconStyle>` image href under this key — a URL, which is
  // not an icon spec — so ignore path-like values.
  const plainIcon = get('icon');

  const icon =
    get('freemap:icon') ??
    osmAndIconToIconSpec(get('osmand:icon')) ??
    (plainIcon && !plainIcon.includes('/') ? plainIcon : undefined) ??
    garminSymToIconSpec(get('sym') ?? get('marker-symbol'));

  const color =
    get('freemap:color') ??
    get('osmand:color') ??
    withSimplestyleOpacity(
      properties,
      get('marker-color'),
      'marker-color-opacity',
    ) ??
    // KML `<IconStyle><color>` tint, the closest thing KML has to a marker
    // colour.
    withSimplestyleOpacity(properties, get('icon-color'), 'icon-opacity');

  const pointStyle = { markerType, icon, color };

  for (const [key, value] of Object.entries(pointStyle)) {
    if (value === undefined) {
      delete pointStyle[key as keyof typeof pointStyle];
    }
  }
  return pointStyle;
}

// Plucks line/polygon styling out of a GeoJSON feature's properties. GPX has
// no native polygon type, so callers must combine `type` here with a
// closed-ring check to decide whether to dispatch as polygon. Priority:
// freemap:* (lossless) → osmand:* → simplestyle (stroke/fill).
export function lineStyleFromProperties(
  properties: Record<string, unknown> | null | undefined,
  closed: boolean,
): {
  type?: DrawingLineType;
  color?: string;
  fillColor?: string;
  width?: number;
  lineCap?: LineCap;
  lineJoin?: LineJoin;
  dashArray?: number[];
} {
  const get = (key: string): string | undefined => {
    const v = properties?.[key];

    return typeof v === 'string' && v ? v : undefined;
  };

  // Simplestyle emits numeric values (e.g. togeojson writes `stroke-width` as a
  // number), while our `freemap:*`/`osmand:*` extensions are strings; accept
  // both.
  const getNum = (key: string): number | undefined => {
    const v = properties?.[key];

    const n =
      typeof v === 'number'
        ? v
        : typeof v === 'string'
          ? Number(v)
          : Number.NaN;

    return Number.isFinite(n) ? n : undefined;
  };

  const rawType = get('freemap:type');

  const type: DrawingLineType | undefined = isDrawingLineType(rawType)
    ? rawType
    : closed && get('gpx_style:hasFill')
      ? 'polygon'
      : undefined;

  const color =
    get('freemap:color') ??
    get('osmand:color') ??
    withSimplestyleOpacity(properties, get('stroke'), 'stroke-opacity');

  const fillColor =
    get('freemap:fillColor') ??
    get('osmand:fill_color') ??
    withSimplestyleOpacity(properties, get('fill'), 'fill-opacity');

  const width =
    getNum('freemap:width') ?? getNum('osmand:width') ?? getNum('stroke-width');

  const rawCap = get('freemap:lineCap') ?? get('stroke-linecap');
  const lineCap = isLineCap(rawCap) ? rawCap : undefined;

  const rawJoin = get('freemap:lineJoin') ?? get('stroke-linejoin');
  const lineJoin = isLineJoin(rawJoin) ? rawJoin : undefined;

  const rawDash = get('freemap:dashArray') ?? get('stroke-dasharray');
  const dashArray = rawDash
    ? rawDash
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => Number.isFinite(n))
    : undefined;

  const lineStyle = {
    type,
    color,
    fillColor,
    width,
    lineCap,
    lineJoin,
    dashArray,
  };

  for (const [key, value] of Object.entries(lineStyle)) {
    if (value === undefined) {
      delete lineStyle[key as keyof typeof lineStyle];
    }
  }

  return lineStyle;
}
