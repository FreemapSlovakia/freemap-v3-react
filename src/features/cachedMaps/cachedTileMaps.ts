import type {
  AttributionDef,
  CustomLayerDef,
  IsTileLayerDef,
  IsWmsLayerDef,
} from '@shared/mapDefinitions.js';
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
  attribution?: AttributionDef[];
  /**
   * The `@Nx` variant the tiles are stored at (1 = plain tiles). A cached map
   * holds exactly one, so it is rendered at this scale whatever the screen and
   * the resolution/feature-scale preferences say.
   */
  tileScale?: number;
};

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
