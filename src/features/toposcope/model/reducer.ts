import { clearMapFeatures } from '@app/store/actions.js';
import { mapsLoaded } from '@features/myMaps/model/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import {
  toposcopeSet,
  toposcopeSetInscription,
  toposcopeSetPickingCenter,
} from './actions.js';

/**
 * Everything the dial carries that its points don't. Which point it stands on
 * is not here — that is the first drawn point marked as the centre, see
 * `toposcopeCenterSelector`.
 *
 * None of this is a standing preference, so none of it is persisted: it belongs
 * to the dial being drawn, travels in the `toposcope=` URL param, and a copied
 * link reproduces what the sender was looking at rather than mixing in whatever
 * the reader last set.
 */
export interface ToposcopeState {
  /** The map is waiting for a click to say where the centre goes. Not in the URL. */
  pickingCenter: boolean;
  /**
   * Texts curved along the outer circle, one per quadrant starting between S
   * and E and running clockwise. `{attribution}` expands to the map data
   * credit, `{credit}` to this portal's own.
   */
  inscriptions: string[];
  /** Radius of the circle holding the centre's label, in the dial's 200-unit span. */
  innerCircleRadius: number;
  /**
   * Radius of the ring the rays stop at, in the same units. Pulled in further
   * when the text needs a wider band than it leaves — see `ToposcopeSvg`.
   */
  outerCircleRadius: number;
  /**
   * How large the text and lines are drawn, as a percentage. The dial's circles
   * always fill the panel, but what is written on them keeps its size, so
   * enlarging the panel gives the labels more room rather than magnifying them.
   */
  scale: number;
  /** Turns the rays of the dial's western half around, so no label reads upside down. */
  preventUpturnedText: boolean;
  /** The two lines written along each ray. See `fillRayTemplate`. */
  line1: string;
  line2: string;
}

export const toposcopeInitialState: ToposcopeState = {
  pickingCenter: false,
  // The map credit sits in the S–W quadrant, where the original Toposcope Maker
  // put it, and the portal's own faces it across the dial — an exported dial
  // says where it came from without the user adding anything. Both are single
  // tokens, so either can be cleared with one keystroke.
  inscriptions: ['', '{attribution}', '', '{credit}'],
  innerCircleRadius: 25,
  outerCircleRadius: 90,
  scale: 100,
  preventUpturnedText: true,
  line1: '{label}',
  line2: '[{elevation} · ]{distance}',
};

export const toposcopeReducer = createReducer(
  toposcopeInitialState,
  (builder) =>
    builder
      .addCase(clearMapFeatures, () => toposcopeInitialState)
      // A loaded map brings its own drawn points, and the dial is not part of
      // what is stored with it.
      .addCase(mapsLoaded, () => toposcopeInitialState)
      .addCase(toposcopeSetPickingCenter, (state, { payload }) => {
        state.pickingCenter = payload;
      })
      .addCase(toposcopeSetInscription, (state, { payload }) => {
        state.inscriptions[payload.index] = payload.value;
      })
      .addCase(toposcopeSet, (state, { payload }) => ({
        ...state,
        ...payload,
      })),
);
