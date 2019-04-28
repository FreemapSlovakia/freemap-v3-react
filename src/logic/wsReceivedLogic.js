import { createLogic } from 'redux-logic';
import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.WS_RECEIVED,
  process({ action }, dispatch, done) {
    console.log('AAAAAAAAA', action.payload);
    done();
  },
});
