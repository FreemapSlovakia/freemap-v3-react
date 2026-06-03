import {
  MarkerType,
  MarkerTypeSchema,
} from '@features/objects/model/actions.js';
import { garminSymToIconSpec } from '@/features/mapFeaturesExport/garminSymMapping.js';
import {
  osmAndBackgroundToMarkerType,
  osmAndIconToIconSpec,
} from '@/features/mapFeaturesExport/osmandIconMapping.js';
import {
  type DrawingLineType,
  isDrawingLineType,
  isLineCap,
  isLineJoin,
  type LineCap,
  type LineJoin,
} from './actions/drawingLineActions.js';

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

  const icon =
    get('freemap:icon') ??
    osmAndIconToIconSpec(get('osmand:icon')) ??
    get('icon') ??
    garminSymToIconSpec(get('sym') ?? get('marker-symbol'));

  const color =
    get('freemap:color') ?? get('osmand:color') ?? get('marker-color');

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

  const rawType = get('freemap:type');

  const type: DrawingLineType | undefined = isDrawingLineType(rawType)
    ? rawType
    : closed && get('gpx_style:hasFill')
      ? 'polygon'
      : undefined;

  const color = get('freemap:color') ?? get('osmand:color') ?? get('stroke');

  const fillColor =
    get('freemap:fillColor') ?? get('osmand:fill_color') ?? get('fill');

  const rawWidth =
    get('freemap:width') ?? get('osmand:width') ?? get('stroke-width');
  const widthNum = rawWidth ? Number(rawWidth) : Number.NaN;
  const width = Number.isFinite(widthNum) ? widthNum : undefined;

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
