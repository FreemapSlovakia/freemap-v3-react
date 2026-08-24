import { createReducer } from '@reduxjs/toolkit';
import { viewshedSetSettings } from './actions.js';

/**
 * How far to look, as the stops the control offers. The service's own ceiling
 * is 300 km; the near end is where a viewshed stops saying anything a map
 * doesn't. Stops rather than a range, because the useful values span two orders
 * of magnitude and every one of these is a round number.
 */
export const VIEWSHED_RADIUS_STEPS_KM = [
  1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 75, 100, 150, 200, 250, 300,
];

/** Coarsest to finest; the order the menu offers them in. */
export const VIEWSHED_DETAIL_ORDER = [
  'superfast',
  'fast',
  'standard',
  'detailed',
  'finest',
] as const;

export type ViewshedDetail = (typeof VIEWSHED_DETAIL_ORDER)[number];

/**
 * What each tier asks for: the ground a pixel covers, and the most pixels it
 * will spend getting it. Either figure alone goes wrong — a bare resolution asks
 * for 100 Mpx at 300 km, a bare pixel count outruns the data at 5 km. See
 * `doc/viewshed.md` for where the numbers come from.
 */
export const VIEWSHED_DETAILS: Record<
  ViewshedDetail,
  { scale: number; maxPixels: number; expectedMs: number }
> = {
  superfast: { scale: 30, maxPixels: 4e6, expectedMs: 1500 },
  fast: { scale: 20, maxPixels: 9e6, expectedMs: 3000 },
  standard: { scale: 12, maxPixels: 16e6, expectedMs: 5000 },
  detailed: { scale: 8, maxPixels: 36e6, expectedMs: 10_000 },
  finest: { scale: 6, maxPixels: 64e6, expectedMs: 18_000 },
};

export interface ViewshedSettingsState {
  /** How far to look; see {@link VIEWSHED_RADIUS_STEPS_KM}. */
  radiusKm: number;
  /** How fine the raster is; see {@link VIEWSHED_DETAILS}. */
  detail: ViewshedDetail;
  /** Eye height above the ground, metres. */
  eye: number;
  /** Height of the thing looked at — a tower, a ridge, a person on a summit. */
  targetHeight: number;
  /** `#rrggbb` the visible ground is washed in. */
  color: string;
  /** Curve on the image's own alpha, `alpha ** (1/gamma)`; `1` is as measured. */
  gamma: number;
  /** Least alpha visible ground may take; `1` is a plain stencil. */
  alphaFloor: number;
}

/** Where the strength slider stops. Past this the picture is nearly a stencil. */
export const GAMMA_MAX = 6;

export const viewshedSettingsInitialState: ViewshedSettingsState = {
  radiusKm: 20,
  detail: 'standard',
  eye: 1.7,
  targetHeight: 0,
  // Nothing else on a map or an aerial is this red.
  color: '#ff0000',
  // Not the service's `1`: measured alpha lands at 0.05–0.15 over most of a wide
  // view, which is not an overlay anyone can read at a glance.
  gamma: 2,
  alphaFloor: 0,
};

export const viewshedSettingsReducer = createReducer(
  viewshedSettingsInitialState,
  (builder) =>
    builder.addCase(viewshedSetSettings, (state, { payload }) => ({
      ...state,
      ...payload,
    })),
);
