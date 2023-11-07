import { createAction } from 'typesafe-actions';

export interface ObjectsResult {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  type: 'node' | 'way' | 'relation';
}

export type MarkerType = 'pin' | 'square' | 'ring';

export const objectsSetFilter = createAction('OBJECTS_SET_FILTER')<string[]>();

export const objectsSetResult =
  createAction('OBJECTS_SET_RESULT')<ObjectsResult[]>();

export const setSelectedIcon = createAction('SET_SELECTED_ICON')<MarkerType>();
