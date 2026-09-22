import type {
  CustomLayerDef,
  IsTileLayerDef,
  IsWmsLayerDef,
} from '@shared/mapDefinitions.js';
import type { LicenseDict } from '@shared/tileLicenses.js';
import { pickTileScale } from '@shared/tileUrl.js';

export type CachedTileMapDef = CustomLayerDef<
  IsTileLayerDef | IsWmsLayerDef
> & {
  sourceType: string;
  bounds: [number, number, number, number]; // [west, south, east, north]
  tileCount: number;
  downloadedCount: number;
  cacheName: string;
  createdAt: string;
  sizeBytes: number;
  /**
   * The union of the dataset codes the downloaded tiles reported, absent when
   * any of them didn't — the map is then credited from its source layer, which
   * names more sources than it holds rather than fewer.
   */
  attributionCodes?: string[];
  /**
   * What those codes mean, taken from the renderer at download time. An offline
   * map can't ask, so it carries the answer.
   */
  attributionLicenses?: LicenseDict;
  /**
   * The `@Nx` variant the tiles are stored at (1 = plain tiles). A cached map
   * holds exactly one, so it is rendered at this scale whatever the screen and
   * the resolution/feature-scale preferences say.
   */
  tileScale?: number;
  /**
   * Whether a tile the map doesn't hold may be fetched from the source server
   * while there is a connection. Off makes the map a sealed artifact: it shows
   * what was downloaded and nothing else. Absent counts as on.
   */
  networkFallback?: boolean;
};

/**
 * Whether two versions of a map cover the same tiles — an edit that changed
 * only the name has nothing to download or prune.
 */
export function sameCoverage(
  a: CachedTileMapDef,
  b: CachedTileMapDef,
): boolean {
  return (
    a.minZoom === b.minZoom &&
    a.maxNativeZoom === b.maxNativeZoom &&
    a.bounds.every((v, i) => v === b.bounds[i])
  );
}

/**
 * The scale a cached map holds. Maps whose metadata carries no scale are
 * guessed at with the rule their download used — what this screen's DPI picks.
 */
export function getCachedTileScale(meta: CachedTileMapDef): number {
  return (
    meta.tileScale ??
    (meta.technology === 'tile' ? pickTileScale(meta.extraScales) : 1)
  );
}
