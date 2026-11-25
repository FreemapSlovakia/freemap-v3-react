import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { loadMyMapsMessages } from '../../translations/loadMyMapsMessages.js';
import { mapsLoadList, mapsSetTags } from '../actions.js';

export const mapsSetTagsProcessor: Processor<typeof mapsSetTags> = {
  actionCreator: mapsSetTags,
  handle: async ({ getState, dispatch, action: { payload }, toastError }) => {
    trackMatomo(['trackEvent', 'MyMaps', 'setTags']);

    try {
      await httpRequest({
        getState,
        method: 'PUT',
        url: `/maps/${payload.id}/tags`,
        expectedStatus: 204,
        data: payload.tags,
      });
    } catch (err) {
      await toastError(err, loadMyMapsMessages, 'saveError');

      return;
    }

    // Reloaded rather than patched: a list read started before the PUT landed
    // (by a rename saved alongside) is cancelled by this one.
    dispatch(mapsLoadList());
  },
};
