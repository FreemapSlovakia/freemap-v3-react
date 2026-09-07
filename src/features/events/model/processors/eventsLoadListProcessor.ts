import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus, mapToggleLayer } from '@features/map/model/actions.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  EVENTS_LAYER,
  EventSchema,
  eventsLoadList,
  eventsSetFilter,
  eventsSetList,
} from '../actions.js';

const triggers = [
  eventsLoadList,
  eventsSetFilter,
  setActiveModal,
  mapToggleLayer,
  mapRefocus,
  authSetUser,
  authLogout,
];

export const eventsLoadListProcessor: Processor = {
  actionCreator: triggers,
  handle: async ({ getState, dispatch, action, toastError }) => {
    const state = getState();

    // The events are shown by the panel and/or the independent markers layer;
    // either keeps the list populated, so closing the panel leaves the layer's
    // last filter in place.
    const active =
      state.main.activeModal?.type === 'events' ||
      state.map.layers.includes(EVENTS_LAYER);

    if (!active) {
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

    const params: Record<string, string> = {};

    if (filter.from) {
      params['from'] = filter.from.toISOString();
    }

    if (filter.to) {
      // The picker yields UTC midnight, and the bound reads as inclusive of the
      // day it names — so it goes out as that day's last instant.
      params['to'] = new Date(
        filter.to.getTime() + 86_400_000 - 1,
      ).toISOString();
    }

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
