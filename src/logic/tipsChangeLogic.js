import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';

export default createLogic({
  type: [at.TIPS_NEXT, at.TIPS_PREVIOUS],
  process({ getState }, dispatch, done) {
    localStorage.setItem('tip', getState().tips.tip);
    done();
  },
});
