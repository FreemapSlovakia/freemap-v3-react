import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapsLoadList } from '@features/myMaps/model/actions.js';
import { loadEventsMessages } from '../../translations/loadEventsMessages.js';
import { eventsLoadList, eventsSave } from '../actions.js';

export const eventsSaveProcessor: Processor<typeof eventsSave> = {
  actionCreator: eventsSave,
  async handle({ getState, dispatch, action, toastError }) {
    const { mapId, ...body } = action.payload;

    try {
      await httpRequest({
        getState,
        method: 'PUT',
        url: `/events/${encodeURIComponent(mapId)}`,
        expectedStatus: 200,
        data: body,
      });

      dispatch(mapsLoadList());

      dispatch(eventsLoadList());
    } catch (err) {
      await toastError(err, loadEventsMessages, 'saveError');
    }
  },
};
