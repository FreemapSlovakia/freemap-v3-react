import { httpRequest } from '@app/httpRequest.js';
import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  EventSchema,
  EventSummarySchema,
  eventsLoadList,
  eventsSetFilter,
  eventsSetList,
  eventsSetSelected,
} from '../actions.js';
import { filterToRequest } from '../filter.js';
import { eventsLayerOnSelector, selectedEventId } from '../selectors.js';

const triggers = [
  init,
  eventsLoadList,
  eventsSetFilter,
  authSetUser,
  authLogout,
];

const layerOn = eventsLayerOnSelector;

// Harvests post new events nightly: a tab coming back with a list this old,
// or one that never loaded, loads it again.
const STALE_MS = 15 * 60_000;

/** When the list last loaded; 0 when it didn't. */
let loadedAt = 0;

/** Loads running: a reload would only cancel and repeat one. */
let loading = 0;

let watching = false;

function reloadWhenBack(
  getState: () => RootState,
  dispatch: (action: ReturnType<typeof eventsLoadList>) => void,
) {
  if (watching) {
    return;
  }

  watching = true;

  document.addEventListener('visibilitychange', () => {
    if (
      document.visibilityState === 'visible' &&
      !loading &&
      layerOn(getState()) &&
      Date.now() - loadedAt > STALE_MS
    ) {
      dispatch(eventsLoadList());
    }
  });
}

/**
 * However the layer came on or off — a toggle, a link, a loaded map — the list
 * follows: loaded, or emptied.
 */
export const eventsLayerOnProcessor: Processor = {
  stateChangePredicate: layerOn,
  handle({ dispatch }) {
    dispatch(eventsLoadList());
  },
};

export const eventsLoadListProcessor: Processor = {
  actionCreator: triggers,
  handle: async ({ getState, dispatch, toastError }) => {
    const state = getState();

    if (!layerOn(state)) {
      if (state.events.list.length) {
        dispatch(eventsSetList([]));
      }

      return;
    }

    reloadWhenBack(getState, dispatch);

    loadedAt = 0;

    loading++;

    try {
      const res = await httpRequest({
        getState,
        url: `/events?${objectToURLSearchParams({ ...filterToRequest(state.events.filter), summary: '1' })}`,
        expectedStatus: 200,
        cancelActions: triggers,
      });

      dispatch(
        eventsSetList(z.array(EventSummarySchema).parse(await res.json())),
      );

      loadedAt = Date.now();
    } catch (err) {
      await toastError(err, loadEventsMessages, 'fetchListError');

      return;
    } finally {
      loading--;
    }

    // The selected one may be out of date too — the user's own participation
    // after logging in, say; the list has only its summary.
    const selectedId = selectedEventId(getState());

    if (selectedId === null || !getState().events.selected) {
      return;
    }

    try {
      const res = await httpRequest({
        getState,
        url: `/events/${encodeURIComponent(selectedId)}`,
        expectedStatus: 200,
        cancelActions: triggers,
      });

      const selected = EventSchema.parse(await res.json());

      if (
        selectedEventId(getState()) === selected.id &&
        JSON.stringify(selected) !== JSON.stringify(getState().events.selected)
      ) {
        dispatch(eventsSetSelected(selected));
      }
    } catch (err) {
      // The details shown stay; the list is what this run was for.
      console.warn('Selected event not refreshed', err);
    }
  },
};
