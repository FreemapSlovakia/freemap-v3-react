import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import { eventsDelete, eventsLoadList } from '../actions.js';
import { selectedEventId } from '../selectors.js';

export const eventsDeleteProcessor: Processor<typeof eventsDelete> = {
  actionCreator: eventsDelete,
  async handle({ getState, dispatch, action, toastError }) {
    try {
      await httpRequest({
        getState,
        method: 'DELETE',
        url: `/events/${encodeURIComponent(action.payload)}`,
        expectedStatus: 204,
      });

      if (selectedEventId(getState()) === action.payload) {
        dispatch(selectFeature(null));
      }

      dispatch(eventsLoadList());
    } catch (err) {
      await toastError(err, loadEventsMessages, 'deleteError');
    }
  },
};
