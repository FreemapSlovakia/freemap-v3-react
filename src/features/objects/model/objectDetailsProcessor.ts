import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { ElevationReading } from '@features/elevationChart/components/ElevationValue.js';
import {
  resultCoords,
  resultExtentM,
} from '@features/search/model/resultUtils.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import {
  creditedAttributions,
  fetchElevations,
  newElevationCredits,
} from '@shared/elevation.js';
import { isAbortError } from '@shared/isAbortError.js';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import { setDetailsShown } from './actions.js';
import { wantedKey, wantedTarget } from './selectors.js';

const TOAST_ID = 'mapDetails.tags';

/**
 * How far an object may reach — its bbox diagonal — and still have one
 * elevation. A street, a railway route or a whole forest has none, so past this
 * the readout would name an arbitrary point rather than the object.
 */
const MAX_ELEVATION_EXTENT_M = 200;

/**
 * Keeps the details toast a view of the selection, instead of something each
 * place that selects a feature has to push. It therefore follows the selection
 * the way a selection toolbar does, and the toast's × dismisses it for as long
 * as that feature stays selected (through `onClose`).
 */
export const objectDetailsProcessor: Processor = {
  // Edge-triggered: only a changed subject opens the toast. Re-opening it
  // merely because it is gone would make its × a no-op, and re-adding an
  // unchanged one would throw it back to the top of the toast column.
  stateChangePredicate: wantedKey,
  handle: async ({ getState, dispatch }) => {
    const state = getState();

    const target = wantedTarget(state);

    if (!target) {
      if (state.toasts.toasts[TOAST_ID]) {
        dispatch(toastsRemove(TOAST_ID));
      }

      return;
    }

    const show = (elevation: ElevationReading) =>
      dispatch(
        toastsAdd({
          id: TOAST_ID,
          messageKey: 'detail',
          messageLoader: loadObjectsMessages,
          messageParams: { result: target.result, elevation },
          onClose: setDetailsShown(false),
          style: 'info',
        }),
      );

    // Only once the subject is known to have changed — walking the geometry of
    // every selected feature on every dispatched action would be work for
    // nothing.
    const coords = resultCoords(target.result);

    const readElevation =
      coords !== null &&
      (resultExtentM(target.result) ?? Infinity) <= MAX_ELEVATION_EXTENT_M;

    // The details show at once; the elevation reads separately and lands in the
    // same toast, so a slow API doesn't hold the tags back.
    show({
      elevation: undefined,
      loading: readElevation,
      sources: [],
      attributions: [],
    });

    if (!readElevation) {
      return;
    }

    const credits = newElevationCredits();

    let elevation: number | null | undefined;

    let error: unknown;

    try {
      [elevation] = await fetchElevations(
        [[coords.lat, coords.lon]],
        getState,
        // Invalidated by the subject changing, not by the actions that can
        // change it: a reload restores the same pin twice (the URL's element
        // load and the map document), and the second one announces a subject
        // identical to the first. Cancelling on the action would abort the read
        // while this handler, edge-triggered on that same subject, starts
        // nothing in its place — leaving the spinner up for good.
        { stateChangePredicate: wantedKey },
        credits,
      );
    } catch (err) {
      // An abort means something newer is already on its way (or the features
      // were cleared) — leave the toast to whatever caused it.
      if (isAbortError(err)) {
        return;
      }

      // The details themselves stand without it, so the failure is answered in
      // the elevation's own line instead of toasting an error over them.
      error = err;
    }

    // The subject can have moved on — or the toast be dismissed — while the read
    // was in flight; re-adding it then would describe something else, or bring
    // back what the user just closed.
    if (
      wantedKey(getState()) !== target.key ||
      !getState().toasts.toasts[TOAST_ID]
    ) {
      return;
    }

    show({
      elevation,
      loading: false,
      error,
      sources: [...credits.sources],
      attributions: creditedAttributions(credits),
    });
  },
};
