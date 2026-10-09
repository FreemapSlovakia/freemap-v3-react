import { createAction } from '@reduxjs/toolkit';
import type { drawingLineChangeProperties } from './drawingLineActions.js';
import type { drawingPointChangeProperties } from './drawingPointActions.js';

export type PointChange = Partial<
  ReturnType<typeof drawingPointChangeProperties>['payload']['properties']
>;

export type LineChange = Partial<
  ReturnType<typeof drawingLineChangeProperties>['payload']['properties']
>;

/**
 * Many points and lines changed at once, as one step of history, each by just
 * what changes on it. Only `pickedColors`, what the user chose, go to the
 * recent colors.
 */
export const drawingChangePropertiesBatch = createAction<{
  points: { index: number; properties: PointChange }[];
  lines: { index: number; properties: LineChange }[];
  pickedColors: string[];
}>('DRAWING_CHANGE_PROPERTIES_BATCH');
