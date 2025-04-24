import { createAction } from '@reduxjs/toolkit';

export interface ObjectsResult {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  type: 'node' | 'way' | 'relation';
}

export type MarkerType = 'pin' | 'square' | 'ring';

export const objectsSetFilter = createAction<string[]>('OBJECTS_SET_FILTER');

export const objectsSetResult =
  createAction<ObjectsResult[]>('OBJECTS_SET_RESULT');

export const setSelectedIcon = createAction<MarkerType>('SET_SELECTED_ICON');
