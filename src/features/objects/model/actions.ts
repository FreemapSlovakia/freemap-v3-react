import { createAction } from '@reduxjs/toolkit';
import { LatLon } from '@shared/types/common.js';
import { OsmFeatureId } from '@shared/types/featureId.js';
import z from 'zod';

export interface ObjectsResult {
  id: OsmFeatureId;
  coords: LatLon;
  tags: Record<string, string>;
}

export const MarkerTypeSchema = z.enum(['pin', 'square', 'ring']);

export type MarkerType = z.infer<typeof MarkerTypeSchema>;

export const objectsSetFilter = createAction<string[]>('OBJECTS_SET_FILTER');

export const objectsSetResult =
  createAction<ObjectsResult[]>('OBJECTS_SET_RESULT');

export const setSelectedIcon = createAction<MarkerType>('SET_SELECTED_ICON');
