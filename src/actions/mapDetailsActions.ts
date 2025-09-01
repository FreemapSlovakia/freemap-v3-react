import { createAction } from '@reduxjs/toolkit';

export type MapDetailsSource =
  | 'reverse'
  | 'nearby'
  | 'surrounding'
  | `wms:${string}`;

export const mapDetailsSetSources = createAction<MapDetailsSource[]>(
  'mapDetails/setSources',
);
