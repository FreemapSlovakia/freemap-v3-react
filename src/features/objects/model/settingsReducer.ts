import { createReducer } from '@reduxjs/toolkit';
import { COLORS } from '@shared/colors.js';
import type { LabelVisibility } from '@shared/labelVisibility.js';
import {
  type MarkerType,
  objectsSetLabelVisibility,
  objectsSetStyle,
} from './actions.js';

// Marker shape + color applied to displayed objects. A dedicated, persisted
// settings slice (not the transient objects/active list), so the user's
// choices survive map clears.
export interface ObjectsSettingsState {
  selectedIcon: MarkerType;
  color: string;
  labelVisibility: LabelVisibility;
}

export const objectsSettingsInitialState: ObjectsSettingsState = {
  selectedIcon: 'pin',
  color: COLORS.normal,
  labelVisibility: 'hover',
};

export const objectsSettingsReducer = createReducer(
  objectsSettingsInitialState,
  (builder) =>
    builder
      .addCase(objectsSetStyle, (state, action) => {
        state.selectedIcon = action.payload.selectedIcon;
        state.color = action.payload.color;
      })
      .addCase(objectsSetLabelVisibility, (state, action) => {
        state.labelVisibility = action.payload;
      }),
);
