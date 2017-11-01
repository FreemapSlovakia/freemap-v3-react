import { createLogic } from 'redux-logic';

export const tipsPreventLogic = createLogic({
  type: 'TIPS_PREVENT_NEXT_TIME',
  process({ getState }, dispatch, done) {
    localStorage.setItem('preventTips', getState().tips.preventNextTime);
    done();
  },
});

export const tipsChangeLogic = createLogic({
  type: ['TIPS_NEXT', 'TIPS_PREVIOUS'],
  process({ getState }, dispatch, done) {
    localStorage.setItem('tip', getState().tips.tip);
    done();
  },
});

export default [
  tipsPreventLogic,
  tipsChangeLogic,
];
