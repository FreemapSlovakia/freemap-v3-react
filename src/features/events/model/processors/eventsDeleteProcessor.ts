import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import { eventsDelete, eventsLoadList } from '../actions.js';

export const eventsDeleteProcessor: Processor<typeof eventsDelete> = {
  actionCreator: eventsDelete,
  async handle({ getState, dispatch, action, toastError }) {
    try {
      await httpRequest({
        getState,
        method: 'DELETE',
        url: `/events/${action.payload}`,
        expectedStatus: 204,
      });

      dispatch(eventsLoadList());
    } catch (err) {
      await toastError(err, loadEventsMessages, 'deleteError');
    }
  },
};
