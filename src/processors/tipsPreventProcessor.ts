import { tipsPreventNextTime } from 'fm3/actions/tipsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';
import { storage } from 'fm3/storage';

export const tipsPreventProcessor: Processor<typeof tipsPreventNextTime> = {
  actionCreator: tipsPreventNextTime,
  errorKey: 'settings.savingError',
  handle: async ({ getState }) => {
    storage.setItem('preventTips', getState().tips.preventTips ? '1' : '');

    if (getState().auth.user) {
      await httpRequest({
        getState,
        method: 'PATCH',
        url: '/auth/settings',
        expectedStatus: 204,
        data: {
          preventTips: getState().tips.preventTips,
        },
      });
    }
  },
};
