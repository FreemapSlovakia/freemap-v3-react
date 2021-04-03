import { Processor } from 'fm3/middlewares/processorMiddleware';
import { User } from 'fm3/types/common';
import storage from 'local-storage-fallback';

let prevUser: User | null = null;

export const authSaveUserProcessor: Processor = {
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
