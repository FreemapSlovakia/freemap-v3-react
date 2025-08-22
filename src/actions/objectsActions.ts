import { createAction } from '@reduxjs/toolkit';
import { LatLon } from '../types/common.js';
import { OsmFeatureId } from '../types/featureId.js';

export interface ObjectsResult {
  id: OsmFeatureId;
  coords: LatLon;
  tags: Record<string, string>;
}

export type MarkerType = 'pin' | 'square' | 'ring';

export const objectsSetFilter = createAction<string[]>('OBJECTS_SET_FILTER');

export const objectsSetResult =
  createAction<ObjectsResult[]>('OBJECTS_SET_RESULT');

export const setSelectedIcon = createAction<MarkerType>('SET_SELECTED_ICON');
