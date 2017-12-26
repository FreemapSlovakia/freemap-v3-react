import { createLogic } from 'redux-logic';

let prevUser = null;

export default createLogic({
  type: '*',
  process({ getState }, dispatch, done) {
    const { user } = getState().auth;
    if (user !== prevUser) {
      prevUser = user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
    done();
  },
});
