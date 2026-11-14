import type { Bbox } from '@features/mapArea/model/actions.js';
import {
  type AttributionDef,
  type IntegratedLayerDef,
  reportsTileCodes,
} from '@shared/mapDefinitions.js';
import { buildTileUrl, markDrawnTile, pickSubdomain } from '@shared/tileUrl.js';
import { TILE, worldPixels } from './tileGrid.js';

/** Where renderer tiles turn premium at the earliest; textures stay below it. */
const MAX_ZOOM = 18;

const MIN_ZOOM = 0;

const CONCURRENCY = 6;

/** One layer of image tiles, as a library map defines it. */
interface TileLayer {
  url: string;
  subdomains?: string | string[];
  tms?: boolean;
  /** Finest zoom read without a token. */
  maxZoom: number;
  attribution: AttributionDef[];
  /** Its tiles name their datasets in `X-Attribution`, so they are fetched. */
  reportsCodes: boolean;
}

/** An installed map drawable as a texture: image tiles, read with CORS. */
export type TextureMap = Extract<IntegratedLayerDef, { technology: 'tile' }>;

export function isTextureMap(def: IntegratedLayerDef): def is TextureMap {
  return (
    def.layer === 'base' &&
    def.technology === 'tile' &&
    def.cors !== false &&
    // Shading maps would shade the relief a second time.
    def.category !== 'elevation'
  );
}

/** The map's own tiles, then its detail layer where it has one, as on the map. */
function tileLayers(def: TextureMap): TileLayer[] {
  const own: TileLayer = {
    url: def.url,
    subdomains: def.subdomains,
    tms: def.tms,
    maxZoom: Math.min(
      MAX_ZOOM,
      def.maxNativeZoom ?? MAX_ZOOM,
      (def.premiumFromZoom ?? Number.POSITIVE_INFINITY) - 1,
    ),
    attribution: def.attribution,
    reportsCodes: reportsTileCodes(def),
  };

  return def.detail
    ? [
        own,
        {
          url: def.detail.url,
          maxZoom: Math.min(
            MAX_ZOOM,
            def.detail.maxNativeZoom,
            (def.detail.premiumFromZoom ?? Number.POSITIVE_INFINITY) - 1,
          ),
          attribution: def.detail.attribution,
          reportsCodes: false,
        },
      ]
    : [own];
}

function fill(layer: TileLayer, z: number, x: number, y: number): string {
  const flipped = 2 ** z - 1 - y;

  return buildTileUrl(
    layer.url.replaceAll('{r}', '').replaceAll('{-y}', String(flipped)),
    x,
    layer.tms ? flipped : y,
    z,
    pickSubdomain(layer.subdomains),
  );
}

/** A tile as an `<img>`: the service worker's tile cache serves it, and no provider refuses it. */
function loadImage(
  url: string,
  signal: AbortSignal,
): Promise<HTMLImageElement> {
  const { promise, resolve, reject } =
    Promise.withResolvers<HTMLImageElement>();

  const img = new Image();

  img.crossOrigin = 'anonymous';

  const abort = () => {
    img.src = '';

    reject(signal.reason);
  };

  signal.addEventListener('abort', abort, { once: true });

  img.onload = () => {
    signal.removeEventListener('abort', abort);

    resolve(img);
  };

  img.onerror = () => {
    signal.removeEventListener('abort', abort);

    reject(new Error(`tile ${url} failed`));
  };

  img.src = url;

  return promise;
}

export interface MapTexture {
  canvas: HTMLCanvasElement;
  /** The credits of the layers that drew a tile. */
  credits: AttributionDef[];
  /** The tiles' distinct `X-Attribution` values, unparsed, where they report any. */
  attributions: string[];
}

/**
 * The map over the bbox at the finest zoom that fits `maxSide` pixels and is
 * served without a token; Web Mercator, read through {@link mercatorV}.
 */
export async function mapTexture(
  def: TextureMap,
  bbox: Bbox,
  maxSide: number,
  signal: AbortSignal,
): Promise<MapTexture> {
  const [west, south, east, north] = bbox;

  const layers = tileLayers(def);

  let zoom = Math.max(MIN_ZOOM, def.minZoom ?? MIN_ZOOM);

  for (let z = layers[0]!.maxZoom; z > zoom; z--) {
    const { px, py } = worldPixels(z);

    if (px(east) - px(west) <= maxSide && py(south) - py(north) <= maxSide) {
      zoom = z;

      break;
    }
  }

  const { px, py } = worldPixels(zoom);

  // Even the coarsest zoom is too large, or past what is served without a token.
  if (
    zoom > layers[0]!.maxZoom ||
    px(east) - px(west) > maxSide ||
    py(south) - py(north) > maxSide
  ) {
    throw new Error('the area is too large for a texture of this map');
  }

  const x0 = px(west);

  const y0 = py(north);

  const canvas = document.createElement('canvas');

  canvas.width = Math.max(1, Math.ceil(px(east) - x0));

  canvas.height = Math.max(1, Math.ceil(py(south) - y0));

  const ctx = canvas.getContext('2d')!;

  const wanted: [number, number][] = [];

  for (
    let ty = Math.floor(y0 / TILE);
    ty <= Math.floor((y0 + canvas.height) / TILE);
    ty++
  ) {
    for (
      let tx = Math.floor(x0 / TILE);
      tx <= Math.floor((x0 + canvas.width) / TILE);
      tx++
    ) {
      wanted.push([tx, ty]);
    }
  }

  const attributions = new Set<string>();

  const credits: AttributionDef[] = [];

  let drewAny = false;

  // One layer after another, so a later one is never painted over.
  for (const layer of layers) {
    // A detail layer coarser than the texture would only blur it.
    if (layer.maxZoom < zoom) {
      continue;
    }

    let drew = false;

    let next = 0;

    // A tile that fails, as outside a detail layer's coverage, leaves the
    // layer under it.
    const draw = async (tx: number, ty: number) => {
      const url = fill(layer, zoom, tx, ty);

      if (layer.reportsCodes) {
        const res = await fetch(markDrawnTile(url), { signal });

        if (!res.ok) {
          return;
        }

        const attribution = res.headers.get('X-Attribution');

        if (attribution) {
          attributions.add(attribution);
        }

        const image = await createImageBitmap(await res.blob());

        ctx.drawImage(image, tx * TILE - x0, ty * TILE - y0, TILE, TILE);

        image.close();
      } else {
        const image = await loadImage(url, signal);

        ctx.drawImage(image, tx * TILE - x0, ty * TILE - y0, TILE, TILE);
      }

      drew = true;
    };

    const worker = async () => {
      while (next < wanted.length && !signal.aborted) {
        const [tx, ty] = wanted[next++]!;

        try {
          await draw(tx, ty);
        } catch (err) {
          if (signal.aborted) {
            throw err;
          }
        }
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    if (drew) {
      drewAny = true;

      credits.push(...layer.attribution);
    }
  }

  signal.throwIfAborted();

  // Not a black surface: a map that drew nothing leaves the preview plain.
  if (!drewAny) {
    throw new Error('no tile of the map could be read');
  }

  return { canvas, credits, attributions: [...attributions] };
}

/**
 * Where a latitude falls on a texture of the bbox, 0 at the south edge and 1
 * at the north, as texture coordinates count.
 */
export function mercatorV(bbox: Bbox, lat: number): number {
  const { py } = worldPixels(0);

  return (py(bbox[1]) - py(lat)) / (py(bbox[1]) - py(bbox[3]));
}
