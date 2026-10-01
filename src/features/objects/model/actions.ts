import { createAction } from '@reduxjs/toolkit';
import type { LabelVisibility } from '@shared/labelVisibility.js';
import type { LatLon } from '@shared/types/common.js';
import type { OsmFeatureId } from '@shared/types/featureId.js';
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

/**
 * Replaces the whole marker style (shape + color) applied to displayed objects.
 * A single whole-replace setter mirrors the other style settings
 * (`searchSetResultStyle`, `dataViewerSetStyle`); partial updates (e.g. from the
 * `#objects-style=` URL param) merge against the current value before dispatch.
 */
export const objectsSetStyle = createAction<{
  selectedIcon: MarkerType;
  color: string;
}>('OBJECTS_SET_STYLE');

export const objectsSetLabelVisibility = createAction<LabelVisibility>(
  'OBJECTS_SET_LABEL_VISIBILITY',
);

/**
 * Shows an object as a lookup result — or, with no `id`, every visible one at
 * once, which hands them over for good: they are taken off as objects, the way
 * converting them to a drawing takes them off.
 */
export const objectsShowAsLookup = createAction<{ id?: OsmFeatureId }>(
  'OBJECTS_SHOW_AS_LOOKUP',
);

/**
 * Overrides whether the details toast accompanies the selected feature. Both
 * the selection toolbars' details toggle and the toast's own × write it, and
 * it belongs to this spell of having the feature selected: selecting anything
 * — the same feature included — drops it, so coming back asks the question
 * again. `null` restores the default.
 */
export const objectsSetDetailsOverride = createAction<boolean | null>(
  'OBJECTS_SET_DETAILS_OVERRIDE',
);
