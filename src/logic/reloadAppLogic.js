import { createLogic } from 'redux-logic';
import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.RELOAD_APP,
  process(_, __, done) {
    window.location.reload();
    done();
  },
});
