import { createLogicMiddleware } from 'redux-logic';

const logicsCtx = require.context('fm3/logic', false, /Logic\.[tj]s$/);
const logics = []
  .concat(
    ...logicsCtx
      .keys()
      .sort()
      .map(k => logicsCtx(k).default),
  )
  .filter(m => m);

export const logicMiddleware = createLogicMiddleware(logics);
