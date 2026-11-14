import { createReducer } from '@reduxjs/toolkit';
import { terrainModelSetSettings } from './actions.js';

export interface TerrainModelSettingsState {
  /** Vertical exaggeration of the relief. */
  exaggeration: number;
  /** Solid base under the lowest point, millimetres. */
  base: number;
  /**
   * How far a simplified surface may stray from the data, millimetres; 0 keeps
   * every grid point. One of {@link MAX_DEVIATION_STOPS}.
   */
  maxDeviation: number;
  /** What the preview drapes over the surface: `none` or an installed map's id. */
  texture: string;
}

/** What the simplification slider offers; the useful values span decades. */
export const MAX_DEVIATION_STOPS = [
  0, 0.002, 0.005, 0.01, 0.015, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.15,
  0.2,
];

/** What the form accepts, and so what a stored setting may hold. */
export const LIMITS = {
  exaggeration: { min: 1, max: 5 },
  base: { min: 0.4, max: 50 },
} as const;

export const terrainModelSettingsInitialState: TerrainModelSettingsState = {
  exaggeration: 1.5,
  base: 3,
  maxDeviation: 0,
  texture: 'none',
};

export const terrainModelSettingsReducer = createReducer(
  terrainModelSettingsInitialState,
  (builder) =>
    builder.addCase(terrainModelSetSettings, (state, action) => ({
      ...state,
      ...action.payload,
    })),
);
