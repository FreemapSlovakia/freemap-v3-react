import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.AUTH_SET_USER,
  process({ getState }, dispatch, done) {
    const { auth: { user } } = getState();
    if (user) {
      window.ga('send', 'event', 'Auth', 'setUserId', user.id);
    }
    done();
  },
});
