import { createAction } from '@reduxjs/toolkit';

/** Axis-aligned bounding box in `[west, south, east, north]` (GeoJSON BBox) order. */
export type Bbox = [number, number, number, number];

// Start drawing a rectangle on the map, initialized to the given bbox. This also
// causes the active map-area consumer modal (download/offline maps) to hide.
export const mapAreaSelectStart = createAction<Bbox>('MAP_AREA_SELECT_START');

// Update the rectangle being drawn (during corner/move handle dragging).
export const mapAreaSetSelecting = createAction<Bbox>('MAP_AREA_SET_SELECTING');

// Confirm the drawn rectangle as the selected area and leave drawing mode.
export const mapAreaSelectConfirm = createAction('MAP_AREA_SELECT_CONFIRM');

// Leave drawing mode discarding the in-progress rectangle (keeps previous result).
export const mapAreaSelectCancel = createAction('MAP_AREA_SELECT_CANCEL');

// Forget the previously selected area.
export const mapAreaClear = createAction('MAP_AREA_CLEAR');
