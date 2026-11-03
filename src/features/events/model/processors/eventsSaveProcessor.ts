import { httpRequest } from '@app/httpRequest.js';
import { selectFeature, setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import {
  MapMetaSchema,
  mapsLoadList,
  mapsSetMeta,
  mapsSetSavedFingerprint,
} from '@features/myMaps/model/actions.js';
import {
  fingerprintState,
  getMapDataFromState,
} from '@features/myMaps/model/mapDocument.js';
import { routePlannerSetSavedRoute } from '@features/routePlanner/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Dispatch } from 'redux';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  EVENTS_LAYER,
  EventSchema,
  eventsLoadList,
  eventsSave,
  eventsSaveDone,
  eventsSetList,
} from '../actions.js';
import { eventsLayerOnSelector, selectedEventId } from '../selectors.js';
import { showSelectedEvent } from './eventSelectionProcessors.js';

async function saveCover(
  getState: () => RootState,
  id: string,
  cover: File | null,
) {
  let body;

  if (cover) {
    body = new FormData();

    body.append('image', cover);
  }

  const res = await httpRequest({
    getState,
    method: cover ? 'PUT' : 'DELETE',
    url: `/events/${encodeURIComponent(id)}/cover`,
    expectedStatus: 200,
    body,
  });

  return EventSchema.parse(await res.json());
}

/** Saves what is on the map as a new map, which becomes the open one. */
async function createMap(
  getState: () => RootState,
  dispatch: Dispatch,
  name: string,
) {
  const data = getMapDataFromState(getState());

  const fingerprint = fingerprintState(getState());

  const res = await httpRequest({
    getState,
    method: 'POST',
    url: '/maps/',
    expectedStatus: 200,
    data: { name, data },
  });

  const meta = MapMetaSchema.parse(await res.json());

  trackMatomo(['trackEvent', 'MyMaps', 'create']);

  dispatch(mapsLoadList());

  dispatch(mapsSetMeta(meta));

  dispatch(mapsSetSavedFingerprint(fingerprint));

  dispatch(routePlannerSetSavedRoute(data.routePlanner?.result ?? null));

  return meta.id;
}

export const eventsSaveProcessor: Processor<typeof eventsSave> = {
  actionCreator: eventsSave,
  async handle({ getState, dispatch, action, toastError }) {
    const { id, body, cover, newMap } = action.payload;

    let ok = false;

    try {
      let { mapId } = body;

      // A failed event save leaves the map open and saved, which the form
      // then offers as the map to link, so a retry doesn't create it again.
      if (newMap !== undefined) {
        try {
          mapId = await createMap(getState, dispatch, newMap);
        } catch (err) {
          await toastError(err, loadEventsMessages, 'newMapError');

          return;
        }
      }

      const res = await httpRequest({
        getState,
        method: id ? 'PATCH' : 'POST',
        url: id ? `/events/${encodeURIComponent(id)}` : '/events',
        expectedStatus: 200,
        data: { ...body, mapId },
      });

      // Saved, whatever comes of reading the answer: a second Save from a form
      // still up would create the event twice.
      ok = true;

      dispatch(
        toastsAdd({
          style: 'success',
          timeout: 5000,
          messageKey: 'general.saved',
        }),
      );

      if (getState().main.activeModal?.type === 'event-form') {
        dispatch(setActiveModal(null));
      }

      let event = EventSchema.parse(await res.json());

      if (cover !== undefined) {
        try {
          event = await saveCover(getState, event.id, cover);
        } catch (err) {
          await toastError(err, loadEventsMessages, 'coverError');
        }
      }

      // In the list before it is selected, or the details would show the copy
      // the list still has from before the edit.
      const { list } = getState().events;

      dispatch(
        eventsSetList(
          list.some((e) => e.id === event.id)
            ? list.map((e) => (e.id === event.id ? event : e))
            : [...list, event],
        ),
      );

      // An edited event refreshes its details; a new one is selected, on the
      // layer that shows it — which a form opened from My maps may find off.
      if (selectedEventId(getState()) === event.id) {
        showSelectedEvent(dispatch, event);
      } else {
        if (!eventsLayerOnSelector(getState())) {
          dispatch(mapToggleLayer({ type: EVENTS_LAYER, enable: true }));
        }

        dispatch(selectFeature({ type: 'event', id: event.id }));
      }
    } catch (err) {
      if (ok) {
        console.error('Reading the saved event failed:', err);
      } else {
        await toastError(err, loadEventsMessages, 'saveError');
      }
    } finally {
      // After the cover too, or the reload could answer with the old one.
      if (ok) {
        dispatch(eventsLoadList());
      }

      dispatch(eventsSaveDone({ ok }));
    }
  },
};
