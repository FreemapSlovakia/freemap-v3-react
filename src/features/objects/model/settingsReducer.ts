import { createReducer } from '@reduxjs/toolkit';
import { COLORS } from '@shared/colors.js';
import { type MarkerType, objectsSetStyle } from './actions.js';

// Marker shape + color applied to displayed objects. A dedicated, persisted
// settings slice (not the transient objects/active list), so the user's choices
// survive map clears.
export interface ObjectsSettingsState {
  selectedIcon: MarkerType;
  color: string;
}

export const objectsSettingsInitialState: ObjectsSettingsState = {
  selectedIcon: 'pin',
  color: COLORS.normal,
};

export const objectsSettingsReducer = createReducer(
  objectsSettingsInitialState,
  (builder) =>
    builder.addCase(objectsSetStyle, (state, action) => {
      state.selectedIcon = action.payload.selectedIcon;
      state.color = action.payload.color;
    }),
);
