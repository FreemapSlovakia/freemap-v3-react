import { createAction } from '@reduxjs/toolkit';
import type { ColorScheme, RadarFrame } from '../api.js';
import type { WeatherRadarSettingsState } from './settingsReducer.js';

/** Asks for a fresh metadata document; the frame list ages out every few minutes. */
export const weatherRadarRefresh = createAction('WEATHER_RADAR_REFRESH');

export const weatherRadarSetFrames = createAction<{
  frames: RadarFrame[];
  colorSchemes: ColorScheme[];
  generated: number;
}>('WEATHER_RADAR_SET_FRAMES');

/** The frame to show, or `null` to keep following the newest observed one. */
export const weatherRadarSetTime = createAction<number | null>(
  'WEATHER_RADAR_SET_TIME',
);

export const weatherRadarSetPlaying = createAction<boolean>(
  'WEATHER_RADAR_SET_PLAYING',
);

export const weatherRadarClear = createAction('WEATHER_RADAR_CLEAR');

export const weatherRadarSetSettings = createAction<
  Partial<WeatherRadarSettingsState>
>('WEATHER_RADAR_SET_SETTINGS');
