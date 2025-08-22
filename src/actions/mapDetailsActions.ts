import { createAction } from '@reduxjs/toolkit';

export type MapDetailsSource =
  | 'reverse'
  | 'nearby'
  | 'surrounding'
  | `wms:${string}`;

export const mapDetailsSetUserSelectedPosition = createAction<{
  lat: number;
  lon: number;
}>('mapDetails/setUserSelectedPosition');

export const mapDetailsSetSources = createAction<MapDetailsSource[]>(
  'mapDetails/setSources',
);
