import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import {
  EventSchema,
  eventsSetList,
  eventsSetParticipation,
  eventsSetSelected,
} from '../actions.js';
import { selectedEventId } from '../selectors.js';

export const eventsParticipationProcessor: Processor<
  typeof eventsSetParticipation
> = {
  actionCreator: eventsSetParticipation,
  async handle({ getState, dispatch, action, toastError }) {
    const { id, status } = action.payload;

    trackMatomo(['trackEvent', 'Events', 'participation', status ?? 'none']);

    try {
      const res = await httpRequest({
        getState,
        method: status ? 'PUT' : 'DELETE',
        url: `/events/${encodeURIComponent(id)}/participation`,
        expectedStatus: 200,
        data: status ? { status } : undefined,
        // A quicker second press wins, whichever answer would arrive last.
        cancelActions: [eventsSetParticipation],
      });

      const event = EventSchema.parse(await res.json());

      const { list } = getState().events;

      dispatch(eventsSetList(list.map((e) => (e.id === event.id ? event : e))));

      if (selectedEventId(getState()) === event.id) {
        dispatch(eventsSetSelected(event));
      }
    } catch (err) {
      await toastError(err, loadEventsMessages, 'participationError');
    }
  },
};
