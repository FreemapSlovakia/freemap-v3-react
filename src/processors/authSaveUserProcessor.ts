import storage from 'fm3/storage';
import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { IUser } from 'fm3/types/common';

let prevUser: IUser | null = null;

export const authSaveUserProcessor: IProcessor = {
  actionCreator: '*',
  handle: async ({ getState }) => {
    const { user } = getState().auth;
    if (user !== prevUser) {
      prevUser = user;
      if (user) {
        storage.setItem('user', JSON.stringify(user));
      } else {
        storage.removeItem('user');
      }
    }
  },
};
