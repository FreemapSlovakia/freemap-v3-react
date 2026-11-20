import { createAction } from '@reduxjs/toolkit';

/** Waits for a click on the map that says where the forecast is for. */
export const weatherForecastSetPicking = createAction<boolean>(
  'WEATHER_FORECAST_SET_PICKING',
);
