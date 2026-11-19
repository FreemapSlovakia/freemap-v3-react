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
  /** Width of a line coloured on the model, millimetres. */
  lineWidth: number;
  /** Diameter of a point coloured on the model, millimetres. */
  pointSize: number;
  /** `#rrggbb` filament colour of the ground. */
  groundColour: string;
  /**
   * `#rrggbb` filament colour by `#rrggbb` map colour, where it isn't the map
   * colour itself; kept for colours not on the map now.
   */
  colourMap: Record<string, string>;
  /** `#rrggbb` map colours whose features are left off the model. */
  omitted: string[];
}

/** The map's feature sources a model can colour. */
export const FEATURE_SOURCES = [
  'plannedRoute',
  'drawingLines',
  'drawingAreas',
  'drawingPoints',
  'tracking',
  'search',
] as const;

export type FeatureSource = (typeof FEATURE_SOURCES)[number];

/** What the simplification slider offers; the useful values span decades, the top ones for low-poly prints. */
export const MAX_DEVIATION_STOPS = [
  0, 0.002, 0.005, 0.01, 0.015, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.15,
  0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3, 5,
];

/** What the form accepts, and so what a stored setting may hold. */
export const LIMITS = {
  exaggeration: { min: 1, max: 5 },
  base: { min: 0.4, max: 50 },
  lineWidth: { min: 0.2, max: 10 },
  pointSize: { min: 0.5, max: 20 },
} as const;

export const terrainModelSettingsInitialState: TerrainModelSettingsState = {
  exaggeration: 1.5,
  base: 3,
  maxDeviation: 0,
  texture: 'none',
  lineWidth: 2,
  pointSize: 3,
  groundColour: '#f0f0f0',
  colourMap: {},
  omitted: [],
};

export const terrainModelSettingsReducer = createReducer(
  terrainModelSettingsInitialState,
  (builder) =>
    builder.addCase(terrainModelSetSettings, (state, action) => ({
      ...state,
      ...action.payload,
    })),
);
