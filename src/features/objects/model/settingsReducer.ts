import { createReducer } from '@reduxjs/toolkit';
import { COLORS } from '@shared/colors.js';
import type { LabelVisibility } from '@shared/labelVisibility.js';
import {
  type MarkerType,
  objectsSetLabelSettings,
  objectsSetStyle,
} from './actions.js';

// Marker shape + color applied to displayed objects. A dedicated, persisted
// settings slice (not the transient objects/active list), so the user's
// choices survive map clears.
export interface ObjectsSettingsState {
  selectedIcon: MarkerType;
  color: string;
  labelVisibility: LabelVisibility;
  labelMinZoom: number | null;
}

export const objectsSettingsInitialState: ObjectsSettingsState = {
  selectedIcon: 'pin',
  color: COLORS.normal,
  labelVisibility: 'hover',
  labelMinZoom: null,
};

export const objectsSettingsReducer = createReducer(
  objectsSettingsInitialState,
  (builder) =>
    builder
      .addCase(objectsSetStyle, (state, action) => {
        state.selectedIcon = action.payload.selectedIcon;
        state.color = action.payload.color;
      })
      .addCase(objectsSetLabelSettings, (state, { payload }) => {
        state.labelVisibility = payload.visibility;
        state.labelMinZoom = payload.minZoom;
      }),
);
