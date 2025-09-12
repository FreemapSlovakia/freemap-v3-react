import { createAction } from '@reduxjs/toolkit';

export type MapDetailsSource =
  | 'nominatim-reverse'
  | 'overpass-nearby'
  | 'overpass-surrounding'
  | `wms:${string}`;

export const mapDetailsExcludeSources = createAction<MapDetailsSource[]>(
  'mapDetails/excludeSources',
);
