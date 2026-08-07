import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import {
  featureIdsEqual,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { point } from '@turf/helpers';
import { loadObjectsMessages } from '../translations/loadObjectsMessages.js';
import { objectsSetShowDetails } from './actions.js';

const TOAST_ID = 'mapDetails.tags';

type DetailsTarget = {
  /**
   * Identifies the subject across re-runs. A key rather than the result's
   * identity: an objects refresh (every pan and zoom re-queries Overpass)
   * rebuilds the whole list, so identity would report a new subject —  and a
   * re-added toast — for an object the user is still looking at.
   */
  key: string;
  result: SearchResult;
};

/** What the details toast is about, or `null` if the selection has no details. */
function detailsTarget(state: RootState): DetailsTarget | null {
  const { selection } = state.main;

  if (selection?.type === 'search') {
    const result = state.search.selectedResult;

    // Every `searchSelectResult` bumps the sequence, so the toast follows the
    // incomplete → fully-loaded upgrade of one and the same result.
    return result
      ? { key: `search:${state.search.searchResultSeq}`, result }
      : null;
  }

  if (selection?.type === 'objects') {
    const object = state.objects.objects.find((o) =>
      featureIdsEqual(o.id, selection.id),
    );

    return object
      ? {
          key: `objects:${stringifyFeatureId(object.id)}`,
          result: {
            source: 'osm',
            id: object.id,
            geojson: point([object.coords.lon, object.coords.lat], object.tags),
          },
        }
      : null;
  }

  return null;
}

/** The subject the toast should be showing, `null` for none. */
export function wantedTarget(state: RootState): DetailsTarget | null {
  return state.objectsSettings.showDetails ? detailsTarget(state) : null;
}

/**
 * Keeps the details toast a view of the selection and the `showDetails`
 * preference, instead of something each place that selects a feature has to
 * push. It therefore follows the selection the way a selection toolbar does,
 * and the toast's × turns the preference off (through `onClose`) rather than
 * dropping a panel nothing can bring back.
 */
export const objectDetailsProcessor: Processor = {
  handle: async ({ getState, prevState, dispatch }) => {
    const state = getState();

    const target = wantedTarget(state);

    // Edge-triggered: only a changed subject opens the toast. Re-opening it
    // merely because it is gone would make its × a no-op, and re-adding an
    // unchanged one would throw it back to the top of the toast column.
    if (target?.key === wantedTarget(prevState)?.key) {
      return;
    }

    if (!target) {
      if (state.toasts.toasts[TOAST_ID]) {
        dispatch(toastsRemove(TOAST_ID));
      }

      return;
    }

    dispatch(
      toastsAdd({
        id: TOAST_ID,
        messageKey: 'detail',
        messageLoader: loadObjectsMessages,
        messageParams: { result: target.result },
        // An embed has no selection toolbar, so nothing there could switch the
        // preference back on — its × dismisses the toast and no more.
        onClose: window.fmEmbedded ? undefined : objectsSetShowDetails(false),
        style: 'info',
      }),
    );
  },
};
