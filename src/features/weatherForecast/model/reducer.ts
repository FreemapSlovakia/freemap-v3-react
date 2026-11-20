import { clearMapFeatures, selectFeature } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import { weatherForecastSetPicking } from './actions.js';

export interface WeatherForecastState {
  picking: boolean;
}

export const weatherForecastInitialState: WeatherForecastState = {
  picking: false,
};

export const weatherForecastReducer = createReducer(
  weatherForecastInitialState,
  (builder) =>
    builder
      .addCase(weatherForecastSetPicking, (state, { payload }) => {
        state.picking = payload;
      })
      // The pick is the forecast's selection; any other one, such as Back
      // restoring a panel, ends it too. Not a deselection, which processors
      // dispatch on their own.
      .addCase(selectFeature, (state, { payload }) => {
        if (payload) {
          state.picking = false;
        }
      })
      .addCase(clearMapFeatures, () => weatherForecastInitialState),
);
