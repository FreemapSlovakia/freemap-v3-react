import { type TileRange, tileRangesInBbox } from './tileEnumeration.js';
import { buildTileUrl, withTileScale } from './tileUrl.js';

/**
 * Tile weight varies by layer, zoom, scale and terrain — a city tile and a
 * forest tile differ several-fold — so the download size is estimated by
 * fetching a few real tiles from the selected area and extrapolating.
 */

/** Used only for zooms that yielded no sample (offline, CORS, layer down). */
const FALLBACK_TILE_SIZE = 20_000;

/** At most this many zoom levels are sampled, however wide the range is. */
const MAX_SAMPLED_ZOOMS = 3;

const SAMPLES_AT_DEEPEST_ZOOM = 4;

const SAMPLES_AT_OTHER_ZOOMS = 2;

/**
 * Relative positions inside the bbox tile rectangle, ordered so that even the
 * first two already sit apart.
 */
const SAMPLE_POSITIONS: [number, number][] = [
  [0.5, 0.5],
  [0.2, 0.8],
  [0.8, 0.25],
  [0.25, 0.2],
  [0.75, 0.75],
  [0.1, 0.45],
];

export type TileSizeEstimate = {
  /** Extrapolated size of the whole bbox × zoom range, in bytes. */
  totalBytes: number;
  /** Measured average tile size per sampled zoom, in bytes. */
  bytesPerZoom: Map<number, number>;
};

export type SampleTilesSizeParams = {
  urlTemplate: string;
  /** The `{s}` host to sample from; see `pickSubdomain`. */
  subdomain?: string;
  bbox: [number, number, number, number];
  minZoom: number;
  maxZoom: number;
  /** The `@Nx` variant that will really be downloaded; see `pickTileScale`. */
  scale?: number;
  signal?: AbortSignal;
};

/**
 * Estimates the total download size as `Σ_z (count_z × sampled avgSize_z)`,
 * sampling at the scale that will actually be fetched. Returns `undefined` when
 * no tile could be fetched at all.
 */
export async function sampleTilesSize({
  urlTemplate,
  subdomain,
  bbox,
  minZoom,
  maxZoom,
  scale,
  signal,
}: SampleTilesSizeParams): Promise<TileSizeEstimate | undefined> {
  const ranges = tileRangesInBbox(bbox, minZoom, maxZoom);

  const sampled = await Promise.all(
    pickSampledZooms(ranges).map(async (range) => {
      const sizes = await Promise.all(
        pickSampleTiles(
          range,
          range.zoom === maxZoom
            ? SAMPLES_AT_DEEPEST_ZOOM
            : SAMPLES_AT_OTHER_ZOOMS,
        ).map(async ([x, y]) => {
          const url = withTileScale(
            buildTileUrl(urlTemplate, x, y, range.zoom, subdomain),
            scale,
          );

          try {
            const response = await fetch(url, {
              signal,
              // the app is served `no-referrer`, so send the referrer the tile
              // <img> requests send — providers that authenticate by `Referer`
              // would otherwise answer 403 and skew the estimate
              referrerPolicy: 'strict-origin-when-cross-origin',
            });

            return response.ok ? (await response.blob()).size : undefined;
          } catch {
            return undefined;
          }
        }),
      );

      const measured = sizes.filter((size) => size !== undefined);

      return measured.length
        ? ([
            range.zoom,
            measured.reduce((a, b) => a + b, 0) / measured.length,
          ] as const)
        : undefined;
    }),
  );

  const bytesPerZoom = new Map(sampled.filter((entry) => entry !== undefined));

  if (bytesPerZoom.size === 0) {
    return undefined;
  }

  return {
    totalBytes: ranges.reduce(
      (sum, range) =>
        sum + range.count * tileSizeAtZoom(bytesPerZoom, range.zoom),
      0,
    ),
    bytesPerZoom,
  };
}

/**
 * The deepest zoom holds roughly three quarters of all tiles, so it is always
 * sampled; the rest of the budget goes to the shallowest zoom and the middle of
 * the range.
 */
function pickSampledZooms(ranges: TileRange[]): TileRange[] {
  if (ranges.length <= MAX_SAMPLED_ZOOMS) {
    return ranges;
  }

  return [
    ranges[0]!,
    ranges[Math.floor((ranges.length - 1) / 2)]!,
    ranges[ranges.length - 1]!,
  ];
}

function pickSampleTiles(range: TileRange, count: number): [number, number][] {
  const width = range.maxX - range.minX + 1;

  const height = range.maxY - range.minY + 1;

  const tiles = new Map<string, [number, number]>();

  for (const [fx, fy] of SAMPLE_POSITIONS) {
    if (tiles.size >= count) {
      break;
    }

    const x = range.minX + Math.min(width - 1, Math.floor(fx * width));

    const y = range.minY + Math.min(height - 1, Math.floor(fy * height));

    tiles.set(`${x}/${y}`, [x, y]);
  }

  return [...tiles.values()];
}

/**
 * Interpolates between the sampled zooms — tile size peaks in the middle zooms
 * and falls off again as deep tiles get emptier, so the neighbouring samples
 * describe an unsampled zoom better than any single average.
 */
function tileSizeAtZoom(bytesPerZoom: Map<number, number>, zoom: number) {
  const sampled = bytesPerZoom.get(zoom);

  if (sampled !== undefined) {
    return sampled;
  }

  const zooms = [...bytesPerZoom.keys()].sort((a, b) => a - b);

  const below = zooms.filter((z) => z < zoom).at(-1);

  const above = zooms.find((z) => z > zoom);

  if (below === undefined || above === undefined) {
    const nearest = below ?? above;

    return nearest === undefined
      ? FALLBACK_TILE_SIZE
      : bytesPerZoom.get(nearest)!;
  }

  const t = (zoom - below) / (above - below);

  return bytesPerZoom.get(below)! * (1 - t) + bytesPerZoom.get(above)! * t;
}

/** The size shown until sampling succeeds. */
export function fallbackTilesSize(tileCount: number, scale = 1): number {
  // a hi-DPI tile carries ~scale² more pixels, so the flat constant scales with it
  return tileCount * FALLBACK_TILE_SIZE * scale ** 2;
}
