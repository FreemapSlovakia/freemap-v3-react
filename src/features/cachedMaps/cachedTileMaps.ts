import type {
  AttributionDef,
  CustomLayerDef,
  IsTileLayerDef,
  IsWmsLayerDef,
} from '@shared/mapDefinitions.js';

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
};
