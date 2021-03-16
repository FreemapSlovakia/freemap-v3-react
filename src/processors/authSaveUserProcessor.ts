import { Processor } from 'fm3/middlewares/processorMiddleware';
import { storage } from 'fm3/storage';
import { User } from 'fm3/types/common';

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
