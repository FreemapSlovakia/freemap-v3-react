import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapsLoadList } from '@features/myMaps/model/actions.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import { eventsDelete, eventsLoadList } from '../actions.js';

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

      dispatch(mapsLoadList());

      dispatch(eventsLoadList());
    } catch (err) {
      await toastError(err, loadEventsMessages, 'deleteError');
    }
  },
};
