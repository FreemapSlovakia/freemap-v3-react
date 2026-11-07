import { httpRequest } from '@app/httpRequest.js';
import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
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
    } catch (err) {
      await toastError(err, loadEventsMessages, 'fetchListError');

      return;
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
