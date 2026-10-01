import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import type { ElevationReading } from '@features/elevationChart/components/ElevationValue.js';
import {
  type SearchResult,
  searchSelectResult,
} from '@features/search/model/actions.js';
import {
  resultCoords,
  resultExtentM,
} from '@features/search/model/resultUtils.js';
import {
  activeSearchResultKeptSelector,
  activeSearchResultSelector,
} from '@features/search/model/selectors.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import {
  creditedAttributions,
  fetchElevations,
  newElevationCredits,
} from '@shared/elevation.js';
import { isAbortError } from '@shared/isAbortError.js';
import {
  featureIdsEqual,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import { objectsSetDetailsOverride } from './actions.js';
import { objectToSearchResult } from './objectToSearchResult.js';

const TOAST_ID = 'mapDetails.tags';

/**
 * How far an object may reach — its bbox diagonal — and still have one
 * elevation. A street, a railway route or a whole forest has none, so past this
 * the readout would name an arbitrary point rather than the object.
 */
const MAX_ELEVATION_EXTENT_M = 200;

type DetailsTarget = {
  /**
   * Identifies the subject across re-runs. A key rather than the result's
   * identity: an objects refresh (every pan and zoom re-runs the search)
   * rebuilds the whole list, so identity would report a new subject —  and a
   * re-added toast — for an object the user is still looking at.
   */
  key: string;
  result: SearchResult;
};

/** What the details toast is about, or `null` if the selection has no details. */
export function detailsTarget(state: RootState): DetailsTarget | null {
  const { selection } = state.main;

  if (selection?.type === 'search') {
    const result = activeSearchResultSelector(state);

    // The `incomplete` flag is part of the key, so the toast follows one and the
    // same result through its upgrade to the fully loaded element. An element
    // whose fetch is in flight has nothing to describe yet.
    return result && !result.loading
      ? {
          key: `search:${stringifyFeatureId(result.id)}:${result.incomplete ? 'incomplete' : 'complete'}`,
          result,
        }
      : null;
  }

  if (selection?.type === 'objects') {
    const object = state.objects.objects.find((o) =>
      featureIdsEqual(o.id, selection.id),
    );

    return object
      ? {
          key: `objects:${stringifyFeatureId(object.id)}`,
          result: objectToSearchResult(object),
        }
      : null;
  }

  return null;
}

/**
 * The subject the toast should be showing, `null` for none.
 *
 * {@link defaultShowsDetails} decides, and {@link objectsSetDetailsOverride}
 * has the last word for as long as the feature stays selected.
 */
export function wantedTarget(state: RootState): DetailsTarget | null {
  const target = detailsTarget(state);

  if (!target) {
    return null;
  }

  return (state.objects.detailsOverride ?? defaultShowsDetails(state))
    ? target
    : null;
}

/**
 * Whether the selected feature answers with its details unasked. Everything
 * does but one case: a hit from searching by name that is only being looked
 * at. Picking that is navigation — the map goes there, and the details would
 * be talking over it — while an object, a map-details hit, an element asked
 * for by id and a lookup that is kept are each a question about a feature.
 */
export function defaultShowsDetails(state: RootState): boolean {
  if (state.main.selection?.type !== 'search') {
    return true;
  }

  return (
    activeSearchResultSelector(state)?.source !== 'nominatim-forward' ||
    activeSearchResultKeptSelector(state)
  );
}

/**
 * Drops a dismissal when the selection moves on. It belongs to the spell of
 * having that feature selected, not to the feature: closing one object's
 * details and clicking back to it later asks the question again. Keyed on the
 * selection rather than on the subject, so the incomplete → loaded upgrade of
 * one search result — which changes the subject's key — keeps it.
 */
export const detailsOverrideResetProcessor: Processor = {
  // On the act of selecting, not on the selection changing: clicking the
  // feature that is already selected dispatches the same payload and changes
  // no state, and that is how the details are asked for again after the ×.
  actionCreator: [selectFeature, searchSelectResult],
  // `osmLoadProcessor` re-dispatches the result behind a selection when its
  // element lands, selecting nothing; wiping the override there would take
  // away the toast the user had just asked for.
  actionPredicate: (action) =>
    !searchSelectResult.match(action) || action.payload?.select !== false,
  handle: ({ getState, dispatch }) => {
    if (getState().objects.detailsOverride !== null) {
      dispatch(objectsSetDetailsOverride(null));
    }
  },
};

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
  stateChangePredicate: (state) => wantedTarget(state)?.key,
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
          // Only while this feature stays selected: selecting anything, the
          // same feature included, puts the default back.
          onClose: objectsSetDetailsOverride(false),
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
        { stateChangePredicate: (state) => wantedTarget(state)?.key },
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
      wantedTarget(getState())?.key !== target.key ||
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
