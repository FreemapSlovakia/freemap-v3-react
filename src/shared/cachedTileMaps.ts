import type { AttributionDef } from '@shared/mapDefinitions.js';

export interface CachedTileMapDef {
  id: string;
  name: string;
  sourceType: string;
  technology: 'tile' | 'wms';
  urlTemplate: string;
  layer: 'base';
  minZoom: number;
  maxZoom: number;
  bounds: [number, number, number, number]; // [west, south, east, north]
  tileCount: number;
  downloadedCount: number;
  cacheName: string;
  createdAt: string;
  sizeBytes: number;
  extraScales?: number[];
  scaleWithDpi?: boolean;
  attribution?: AttributionDef[];
}
