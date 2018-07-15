import { createLogic } from 'redux-logic';
import storage from 'fm3/storage';

let prevUser = null;

export default createLogic({
  type: '*',
  process({ getState }, dispatch, done) {
    const { user } = getState().auth;
    if (user !== prevUser) {
      prevUser = user;
      if (user) {
        storage.setItem('user', JSON.stringify(user));
      } else {
        storage.removeItem('user');
      }
    }
    done();
  },
});
