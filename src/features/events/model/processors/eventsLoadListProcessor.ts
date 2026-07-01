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
      params['to'] = filter.to.toISOString();
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
        cancelActions: triggers,
      });

      dispatch(eventsSetList(z.array(EventSchema).parse(await res.json())));
    } catch (err) {
      await toastError(err, loadEventsMessages, 'fetchListError');
    }
  },
};
