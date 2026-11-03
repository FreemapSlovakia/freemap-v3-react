import { httpRequest } from '@app/httpRequest.js';
import { selectFeature, setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
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

export const eventsSaveProcessor: Processor<typeof eventsSave> = {
  actionCreator: eventsSave,
  async handle({ getState, dispatch, action, toastError }) {
    const { id, body } = action.payload;

    let ok = false;

    try {
      const res = await httpRequest({
        getState,
        method: id ? 'PATCH' : 'POST',
        url: id ? `/events/${encodeURIComponent(id)}` : '/events',
        expectedStatus: 200,
        data: body,
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

      dispatch(eventsLoadList());

      const event = EventSchema.parse(await res.json());

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
      dispatch(eventsSaveDone({ ok }));
    }
  },
};
