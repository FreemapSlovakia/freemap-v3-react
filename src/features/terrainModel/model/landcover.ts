import type { Bbox } from '@features/mapArea/model/actions.js';
import z from 'zod';
import { type LineCoords, landcoverGrid, type Paint } from './paint.js';
import { groundSize, PREMIUM_MAX_SAMPLES } from './plan.js';
import { TILE, worldPixels } from './tileGrid.js';

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

/**
 * The classes, bottom first: a later one covers an earlier one, so parks mapped
 * inside built-up stay. `colour` is a class's row and default filament colour.
 */
export const LANDCOVER_CLASSES = [
  {
    id: 'builtUp',
    colour: '#9e9e9e',
    types: [
      'residential',
      'commercial',
      'industrial',
      'retail',
      'garages',
      'railway',
      'brownfield',
      'landfill',
      'quarry',
      'parking',
      'school',
      'college',
      'university',
      'hospital',
      'building',
    ],
  },
  {
    id: 'farmland',
    colour: '#e6c84f',
    types: [
      'farmland',
      'orchard',
      'vineyard',
      'grapes',
      'allotments',
      'plant_nursery',
      'farmyard',
    ],
  },
  {
    id: 'meadow',
    colour: '#9ccc65',
    types: [
      'meadow',
      'grass',
      'grassland',
      'heath',
      'fell',
      'wet_meadow',
      'village_green',
      'park',
      'recreation_ground',
      'golf_course',
      'pitch',
      'garden',
      'cemetery',
      'grave_yard',
      'wetland',
      'marsh',
      'bog',
      'fen',
      'reedbed',
      'swamp',
    ],
  },
  {
    id: 'forest',
    colour: '#2e7d32',
    types: ['forest', 'wood', 'scrub', 'tree_group', 'clearcut'],
  },
  {
    id: 'rock',
    colour: '#8d6e63',
    types: ['bare_rock', 'scree', 'sand', 'beach'],
  },
  { id: 'glacier', colour: '#e0f7fa', types: ['glacier'] },
  {
    id: 'water',
    colour: '#1e88e5',
    types: ['water', 'sea', 'riverbank', 'reservoir', 'basin', 'lake', 'pond'],
  },
] as const;

export type LandcoverClass = (typeof LANDCOVER_CLASSES)[number]['id'];

const classOfType = new Map<string, number>(
  LANDCOVER_CLASSES.flatMap(({ types }, i) =>
    types.map((type) => [type, i] as const),
  ),
);

/** One class's polygons, each its outer ring then its holes. */
export interface LandcoverLayer {
  id: LandcoverClass;
  colour: string;
  polygons: LineCoords[][];
}

/**
 * Snapping tolerance for an area, metres: half the finest grid step a model of
 * it may get, rounded up to a power of two so nearby areas share it.
 */
function landcoverTolerance(bbox: Bbox): number {
  const { width, depth } = groundSize(bbox);

  const half = Math.sqrt((width * depth) / PREMIUM_MAX_SAMPLES) / 2;

  return 2 ** Math.max(0, Math.ceil(Math.log2(half)));
}

const LandcoverResponseSchema = z.object({
  features: z.array(
    z.object({
      properties: z.object({ type: z.unknown() }).nullish(),
      geometry: z
        .object({ type: z.string(), coordinates: z.array(z.unknown()) })
        .nullish(),
    }),
  ),
});

/** The area's landcover by class, bottom first; types of no class left out. */
export async function fetchLandcover(
  bbox: Bbox,
  signal: AbortSignal,
): Promise<LandcoverLayer[]> {
  const tolerance = landcoverTolerance(bbox);

  const params = new URLSearchParams({
    bbox: bbox.join(','),
    tolerance: String(tolerance),
    // A coarse cut against the payload; the model's own limit applies later.
    minArea: String((2 * tolerance) ** 2),
  });

  const res = await fetch(`${fmMapserverUrl}/landcover?${params}`, { signal });

  if (!res.ok) {
    throw new Error(`landcover: HTTP ${res.status}`);
  }

  // Only the shape the loop reads: validating every position of a large area
  // (`zod-geojson`) would hold the page up after every area change.
  const fc = LandcoverResponseSchema.parse(await res.json());

  const layers: LandcoverLayer[] = LANDCOVER_CLASSES.map(({ id, colour }) => ({
    id,
    colour,
    polygons: [],
  }));

  for (const { geometry, properties } of fc.features) {
    const type = properties?.['type'];

    const i = typeof type === 'string' ? classOfType.get(type) : undefined;

    if (i === undefined) {
      continue;
    }

    const { polygons } = layers[i]!;

    if (geometry?.type === 'Polygon') {
      polygons.push(geometry.coordinates as LineCoords[]);
    } else if (geometry?.type === 'MultiPolygon') {
      polygons.push(...(geometry.coordinates as LineCoords[][]));
    }
  }

  return layers.filter(({ polygons }) => polygons.length > 0);
}

/** RGBA pixels, transparent where there is no landcover. */
export interface LandcoverImage {
  data: Uint8ClampedArray<ArrayBuffer>;
  cols: number;
  rows: number;
}

/** The model's grid, which the landcover is opened on. */
export interface ModelGrid {
  cols: number;
  rows: number;
  widthMm: number;
  depthMm: number;
}

/**
 * The landcover exactly as the model gets it, on its own grid, as a Web
 * Mercator image of the area for the area view; made in a worker.
 */
export function landcoverImage(
  bbox: Bbox,
  paint: Paint,
  { cols, rows, widthMm, depthMm }: ModelGrid,
): LandcoverImage {
  const [, south, , north] = bbox;

  const { py } = worldPixels(0);

  // Rows even in latitude, as the model's; the image's are Web Mercator.
  const grid = landcoverGrid(bbox, cols, rows, widthMm, depthMm, paint);

  const top = py(north);

  const span = py(south) - top;

  const rgb = paint.palette.map((hex) => [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ]);

  const image = { data: new Uint8ClampedArray(4 * cols * rows), cols, rows };

  // Pixel centres, as for the rows, onto the grid's points, which span the area.
  const gridCol = Array.from({ length: cols }, (_, c) =>
    Math.round(((c + 0.5) / cols) * (cols - 1)),
  );

  for (let r = 0; r < rows; r++) {
    const k = 4 * Math.PI * (0.5 - (top + ((r + 0.5) / rows) * span) / TILE);

    const lat = (Math.asin(Math.tanh(k / 2)) * 180) / Math.PI;

    const gr = Math.min(
      rows - 1,
      Math.max(0, Math.round(((north - lat) / (north - south)) * (rows - 1))),
    );

    for (let c = 0; c < cols; c++) {
      const v = grid[gr * cols + gridCol[c]!]!;

      if (v) {
        const at = 4 * (r * cols + c);

        const [red = 0, green = 0, blue = 0] = rgb[v]!;

        image.data[at] = red;
        image.data[at + 1] = green;
        image.data[at + 2] = blue;
        image.data[at + 3] = 255;
      }
    }
  }

  return image;
}
