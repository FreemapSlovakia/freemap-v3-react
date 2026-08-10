import { createAction } from '@reduxjs/toolkit';
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

/**
 * Shows an object as a lookup result — or, with no `id`, every visible one at
 * once, which hands them over for good: they are taken off as objects, the way
 * converting them to a drawing takes them off.
 */
export const objectsShowAsLookup = createAction<{ id?: OsmFeatureId }>(
  'OBJECTS_SHOW_AS_LOOKUP',
);

/**
 * Whether the details toast accompanies the selected feature. The toast is a
 * view of this preference and the current selection, so this is what both the
 * selection toolbars' details toggle and the toast's own × switch.
 */
export const objectsSetShowDetails = createAction<boolean>(
  'OBJECTS_SET_SHOW_DETAILS',
);
