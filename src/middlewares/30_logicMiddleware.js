import { createLogicMiddleware } from 'redux-logic';

const logicsCtx = require.context('fm3/logic', false, /Logic\.[tj]s$/);
const logics = logicsCtx
  .keys()
  .sort()
  .map(k => logicsCtx(k).default)
  .flat(Number.MAX_VALUE)
  .filter(m => m);

export default createLogicMiddleware(logics);
