import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { authLogout, authSetUser } from '@features/auth/model/actions.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  EventSchema,
  eventsLoadList,
  eventsSetFilter,
  eventsSetList,
} from '../actions.js';

const triggers = [
  eventsLoadList,
  eventsSetFilter,
  setActiveModal,
  authSetUser,
  authLogout,
];

export const eventsLoadListProcessor: Processor = {
  actionCreator: triggers,
  handle: async ({ getState, dispatch, toastError }) => {
    // The panel drives the list; the independent map layer (a later phase) will
    // extend this gate to also fetch when its overlay is active.
    if (getState().main.activeModal?.type !== 'events') {
      if (getState().events.list.length) {
        dispatch(eventsSetList([]));
      }

      return;
    }

    const { filter } = getState().events;

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
