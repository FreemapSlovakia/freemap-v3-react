import { createReducer } from '@reduxjs/toolkit';
import { terrainModelSetSettings } from './actions.js';

export interface TerrainModelSettingsState {
  /** Printer build volume, millimetres: width, depth, height. */
  bed: [number, number, number];
  /** Layer height, millimetres. */
  layerHeight: number;
  /** Vertical exaggeration of the relief. */
  exaggeration: number;
  /** Solid base under the lowest point, millimetres. */
  base: number;
  /**
   * How far a simplified surface may stray from the data, millimetres; 0 keeps
   * every grid point. One of {@link MAX_DEVIATION_STOPS}.
   */
  maxDeviation: number;
}

/** What the simplification slider offers; the useful values span decades. */
export const MAX_DEVIATION_STOPS = [0, 0.005, 0.01, 0.02, 0.04, 0.08];

/** What the form accepts, and so what a stored setting may hold. */
export const LIMITS = {
  bed: { min: 10, max: 2000 },
  layerHeight: { min: 0.04, max: 1 },
  exaggeration: { min: 1, max: 5 },
  base: { min: 0.4, max: 50 },
} as const;

export const terrainModelSettingsInitialState: TerrainModelSettingsState = {
  bed: [256, 256, 256],
  layerHeight: 0.2,
  exaggeration: 1.5,
  base: 3,
  maxDeviation: 0,
};

export const terrainModelSettingsReducer = createReducer(
  terrainModelSettingsInitialState,
  (builder) =>
    builder.addCase(terrainModelSetSettings, (state, action) => ({
      ...state,
      ...action.payload,
    })),
);
