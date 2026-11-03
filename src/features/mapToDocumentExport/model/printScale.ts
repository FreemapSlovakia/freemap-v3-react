import { CRS, latLng } from 'leaflet';

// A map pixel prints at 1/96 in, as the renderer sizes its pages.
const METRES_PER_PRINTED_PX = 0.0254 / 96;

const EARTH_CIRCUMFERENCE = 2 * Math.PI * 6378137;

/** The scale denominator a zoom prints at, at latitude `lat`. */
export function nativeScale(lat: number, zoom: number) {
  const metresPerPx =
    (EARTH_CIRCUMFERENCE * Math.cos((lat * Math.PI) / 180)) / (256 * 2 ** zoom);

  return metresPerPx / METRES_PER_PRINTED_PX;
}

export type Bbox = [number, number, number, number];

/** The map's size in pixels at `zoom`, as the renderer measures it (DPI aside). */
export function bboxPixelSize(
  [minLon, minLat, maxLon, maxLat]: Bbox,
  zoom: number,
) {
  const min = CRS.EPSG3857.latLngToPoint(latLng(minLat, minLon), zoom);

  const max = CRS.EPSG3857.latLngToPoint(latLng(maxLat, maxLon), zoom);

  return {
    width: Math.round(max.x - min.x),
    height: Math.round(min.y - max.y),
  };
}

/**
 * The three linked choices: the paper (scale and print width are one choice),
 * its density, and the pixels, which are the other two multiplied.
 */
export type PrintField = 'paper' | 'dpi' | 'px';

// Also which unlocked values hold when fewer than two are locked: the paper
// keeps the zoom's own scale, so a new image size changes only the DPI.
export const PRINT_FIELDS: readonly PrintField[] = ['paper', 'dpi', 'px'];

export type PrintInput = {
  zoom: number;
  /** `null` follows the zoom: the map prints at the zoom's own scale. */
  paper: { by: 'scale' | 'cm'; value: number } | null;
  dpi: number;
  /** Image width; `null` until typed. */
  px: number | null;
  locked: readonly PrintField[];
};

export type PrintLimits = {
  minZoom: number;
  maxZoom: number;
  minDpi: number;
  maxDpi: number;
  /** Output pixels per map pixel; the renderer's pixel cap ignores it. */
  maxPxPerMapPx: number;
};

export type ResolvedPrint = {
  zoom: number;
  /** Map pixels at `zoom`. */
  mapPx: { width: number; height: number };
  denominator: number;
  /** Size of text and symbols on paper relative to the zoom's own scale. */
  enlargement: number;
  cm: { width: number; height: number };
  dpi: number;
  px: { width: number; height: number };
};

export type PrintResult =
  | { ok: true; print: ResolvedPrint; derived: PrintField }
  | {
      ok: false;
      invalid: 'zoom' | PrintField;
      /** The values that failed, when they could be computed. */
      print?: ResolvedPrint;
    };

/** Two of paper, DPI and pixels decide the third: locked ones first. */
export function resolvePrint(
  bbox: Bbox,
  input: PrintInput,
  limits: PrintLimits,
): PrintResult {
  const { zoom, paper, dpi, px, locked } = input;

  if (
    !Number.isInteger(zoom) ||
    zoom < limits.minZoom ||
    zoom > limits.maxZoom
  ) {
    return { ok: false, invalid: 'zoom' };
  }

  const mapPx = bboxPixelSize(bbox, zoom);

  if (mapPx.width <= 0 || mapPx.height <= 0) {
    return { ok: false, invalid: 'zoom' };
  }

  // True at the area's centre.
  const native = nativeScale((bbox[1] + bbox[3]) / 2, zoom);

  // Print width at the zoom's own scale.
  const nativeCm = (mapPx.width * 2.54) / 96;

  const order = [
    ...PRINT_FIELDS.filter((f) => locked.includes(f)),
    ...PRINT_FIELDS.filter((f) => !locked.includes(f)),
  ].filter((f) => f !== 'px' || px !== null);

  const [a, b] = order;

  const derived = PRINT_FIELDS.find((f) => f !== a && f !== b)!;

  const given = new Set([a, b]);

  let cmWidth = !paper
    ? nativeCm
    : paper.by === 'cm'
      ? paper.value
      : (nativeCm * native) / paper.value;

  let dpiValue = dpi;

  const pxWidth = px ?? NaN;

  for (const [field, value] of [
    ['paper', cmWidth],
    ['dpi', dpiValue],
    ['px', pxWidth],
  ] as const) {
    if (given.has(field) && !(Number.isFinite(value) && value > 0)) {
      return { ok: false, invalid: field };
    }
  }

  if (derived === 'paper') {
    cmWidth = (pxWidth / dpiValue) * 2.54;
  } else if (derived === 'dpi') {
    dpiValue = pxWidth / (cmWidth / 2.54);
  }

  const enlargement = cmWidth / nativeCm;

  const pxPerMapPx = (enlargement * dpiValue) / 96;

  const print: ResolvedPrint = {
    zoom,
    mapPx,
    denominator: native / enlargement,
    enlargement,
    cm: { width: cmWidth, height: (cmWidth * mapPx.height) / mapPx.width },
    dpi: dpiValue,
    px: {
      width: Math.round(mapPx.width * pxPerMapPx),
      height: Math.round(mapPx.height * pxPerMapPx),
    },
  };

  // Typed or derived, the DPI is what the renderer bounds.
  if (!(dpiValue >= limits.minDpi && dpiValue <= limits.maxDpi)) {
    return { ok: false, invalid: 'dpi', print };
  }

  // Blamed on what was computed, or on the paper when only the image size was.
  if (pxPerMapPx > limits.maxPxPerMapPx) {
    return { ok: false, invalid: derived === 'px' ? 'paper' : derived, print };
  }

  return {
    ok: true,
    derived,
    print,
  };
}
