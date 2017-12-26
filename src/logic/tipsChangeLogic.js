import { createLogic } from 'redux-logic';

export default createLogic({
  type: ['TIPS_NEXT', 'TIPS_PREVIOUS'],
  process({ getState }, dispatch, done) {
    localStorage.setItem('tip', getState().tips.tip);
    done();
  },
});
