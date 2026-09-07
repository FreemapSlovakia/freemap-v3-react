import { createAction } from '@reduxjs/toolkit';
import type { ToposcopeState } from './reducer.js';

/** Hands the map over to a click that says where the centre goes. */
export const toposcopeSetPickingCenter = createAction<boolean>(
  'TOPOSCOPE_SET_PICKING_CENTER',
);

/** One of the four texts along the outer circle, SE / SW / NW / NE. */
export const toposcopeSetInscription = createAction<{
  index: number;
  value: string;
}>('TOPOSCOPE_SET_INSCRIPTION');

/** How the dial is drawn, and what the URL restores it from. */
export const toposcopeSet =
  createAction<Partial<Omit<ToposcopeState, 'pickingCenter'>>>('TOPOSCOPE_SET');
