import { tipsPreventNextTime } from 'fm3/actions/tipsActions';
import { httpRequest } from 'fm3/authAxios';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const tipsPreventProcessor: Processor<typeof tipsPreventNextTime> = {
  actionCreator: tipsPreventNextTime,
  errorKey: 'settings.savingError',
  handle: async ({ action, getState }) => {
    if (action.payload.save && getState().auth.user) {
      await httpRequest({
        getState,
        method: 'PATCH',
        url: '/auth/settings',
        expectedStatus: 204,
        data: {
          preventTips: action.payload.value,
        },
      });
    }
  },
};
