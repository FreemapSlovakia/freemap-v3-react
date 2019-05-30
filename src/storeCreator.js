import { createStore, applyMiddleware, combineReducers } from 'redux';
import logicMiddleware from 'fm3/middlewares/30_logicMiddleware';

export default function createReduxStore() {
  const reducersCtx = require.context('fm3/reducers', false, /Reducer\.[tj]s$/);
  const reducers = [];
  reducersCtx.keys().forEach(k => {
    reducers[k.replace(/^\.\/(.*)Reducer\.[tj]s/, '$1')] = reducersCtx(
      k,
    ).default;
  });

  const middlewaresCtx = require.context(
    'fm3/middlewares',
    false,
    /Middleware\.[tj]s$/,
  );
  const middlewares = []
    .concat(
      ...middlewaresCtx
        .keys()
        .sort()
        .map(k => middlewaresCtx(k).default),
    )
    .filter(m => m);

  const store = createStore(
    combineReducers(reducers),
    applyMiddleware(...middlewares),
  );

  logicMiddleware.addDeps({ storeDispatch: store.dispatch }); // see https://github.com/jeffbski/redux-logic/issues/63

  return store;
}
