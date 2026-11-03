import { httpRequest } from '@app/httpRequest.js';
import { init } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
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
import { eventsLayerOnSelector } from '../selectors.js';

const triggers = [
  init,
  eventsLoadList,
  eventsSetFilter,
  mapRefocus,
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
  handle: async ({ getState, dispatch, action, toastError }) => {
    const state = getState();

    if (!layerOn(state)) {
      if (state.events.list.length) {
        dispatch(eventsSetList([]));
      }

      return;
    }

    const { filter } = state.events;

    // A plain map pan only changes the result set when the filter is bound to
    // the viewport; otherwise leave the current list as-is.
    if (mapRefocus.match(action) && !filter.inMapArea) {
      return;
    }

    const params = filterToRequest(filter);

    if (filter.inMapArea) {
      // Leaflet's toBBoxString yields "minLon,minLat,maxLon,maxLat".
      params['bbox'] = (await mapPromise).getBounds().toBBoxString();
    }

    try {
      const res = await httpRequest({
        getState,
        url: '/events?' + objectToURLSearchParams(params),
        expectedStatus: 200,
        // A pan cancels the request only when the viewport is part of the
        // query — the run it triggers otherwise returns above, so cancelling on
        // it would abort a request nothing replaces and leave the list empty.
        cancelActions: filter.inMapArea
          ? triggers
          : triggers.filter((trigger) => trigger !== mapRefocus),
      });

      dispatch(eventsSetList(z.array(EventSchema).parse(await res.json())));
    } catch (err) {
      await toastError(err, loadEventsMessages, 'fetchListError');
    }
  },
};
