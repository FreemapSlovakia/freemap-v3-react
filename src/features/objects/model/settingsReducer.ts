import { createReducer } from '@reduxjs/toolkit';
import { COLORS } from '@shared/colors.js';
import {
  type MarkerType,
  objectsSetShowDetails,
  objectsSetStyle,
} from './actions.js';

// Marker shape + color applied to displayed objects, and whether a selected
// feature comes with its details toast. A dedicated, persisted settings slice
// (not the transient objects/active list), so the user's choices survive map
// clears.
export interface ObjectsSettingsState {
  selectedIcon: MarkerType;
  color: string;
  showDetails: boolean;
}

export const objectsSettingsInitialState: ObjectsSettingsState = {
  selectedIcon: 'pin',
  color: COLORS.normal,
  showDetails: true,
};

export const objectsSettingsReducer = createReducer(
  objectsSettingsInitialState,
  (builder) =>
    builder
      .addCase(objectsSetStyle, (state, action) => {
        state.selectedIcon = action.payload.selectedIcon;
        state.color = action.payload.color;
      })
      .addCase(objectsSetShowDetails, (state, action) => {
        state.showDetails = action.payload;
      }),
);
