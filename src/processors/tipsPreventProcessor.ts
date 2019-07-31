import { tipsPreventNextTime } from 'fm3/actions/tipsActions';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import storage from 'fm3/storage';
import { httpRequest } from 'fm3/authAxios';
import { dispatchAxiosErrorAsToast } from './utils';

export const tipsPreventProcessor: IProcessor<typeof tipsPreventNextTime> = {
  actionCreator: tipsPreventNextTime,
  handle: async ({ dispatch, getState }) => {
    storage.setItem('preventTips', getState().tips.preventTips ? '1' : '');

    if (!getState().auth.user) {
      return;
    }

    try {
      await httpRequest({
        getState,
        dispatch,
        method: 'PATCH',
        url: `${process.env.API_URL}/auth/settings`,
        expectedStatus: 204,
      });
    } catch (err) {
      dispatchAxiosErrorAsToast(dispatch, 'settings.savingError', err);
    }
  },
};
