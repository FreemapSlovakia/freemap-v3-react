import { createAction } from '@reduxjs/toolkit';
import type { TerrainModelSettingsState } from './settingsReducer.js';

export const terrainModelSetSettings = createAction<
  Partial<TerrainModelSettingsState>
>('TERRAIN_MODEL_SET_SETTINGS');
