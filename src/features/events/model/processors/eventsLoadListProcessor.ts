import { httpRequest } from '@app/httpRequest.js';
import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  EventSchema,
  eventsLoadList,
  eventsSetFilter,
  eventsSetList,
} from '../actions.js';
import { filterToRequest } from '../filter.js';
import { eventsLayerOnSelector, selectedEventId } from '../selectors.js';
import { refreshSelectedEvent } from './eventSelectionProcessors.js';

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
        url: `/events?${objectToURLSearchParams(filterToRequest(state.events.filter))}`,
        expectedStatus: 200,
        cancelActions: triggers,
      });

      const list = z.array(EventSchema).parse(await res.json());

      dispatch(eventsSetList(list));

      // Its copy may be out of date too — the user's own participation after
      // logging in, say.
      const selectedId = selectedEventId(getState());

      const selected = list.find((e) => e.id === selectedId);

      if (
        selected &&
        JSON.stringify(selected) !== JSON.stringify(getState().events.selected)
      ) {
        refreshSelectedEvent(dispatch, getState, selected);
      }
    } catch (err) {
      await toastError(err, loadEventsMessages, 'fetchListError');
    }
  },
};
