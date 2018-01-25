import { createLogic } from 'redux-logic';

import * as at from 'fm3/actionTypes';

export default createLogic({
  type: at.SET_TOOL,
  process({ getState }, dispatch, done) {
    const { main: { tool } } = getState();
    if (tool) {
      window.ga('send', 'event', 'Tool', 'setTool', tool);
    }
    done();
  },
});
