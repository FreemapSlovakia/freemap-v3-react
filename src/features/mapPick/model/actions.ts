import { createAction } from '@reduxjs/toolkit';
import type { LatLon } from '@shared/types/common.js';

/** Stages the place a picking mode's OK will answer with. */
export const mapPickSetPosition = createAction<LatLon>('MAP_PICK_SET_POSITION');

export const mapPickClear = createAction('MAP_PICK_CLEAR');
