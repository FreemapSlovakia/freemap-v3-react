import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import { createLogger } from 'redux-logger';

import * as at from 'fm3/actionTypes';
import { sendError } from 'fm3/globalErrorHandler';
import websocketMiddleware from 'fm3/websocketMiddleware';

export default function createReduxStore() {
  const reducersCtx = require.context('fm3/reducers', false, /Reducer\.js$/);
  const reducers = Object.fromEntries(reducersCtx.keys().map(k => [k.replace(/^\.\/(.*)Reducer\.js/, '$1'), reducersCtx(k).default]));

  const logicsCtx = require.context('fm3/logic', false, /Logic\.js$/);
  const logics = logicsCtx.keys().map(k => logicsCtx(k).default);

  const logicMiddleware = createLogicMiddleware(logics);

  const errorHandlingMiddleware = () => next => (action) => {
    try {
      if (action.type === at.UNHANDLED_LOGIC_ERROR) {
        sendError({ kind: 'unhandledLogic', error: action.payload });
        return null;
      }

      return next(action);
    } catch (error) {
      sendError({ kind: 'reducer', error, action });
      return null;
    }
  };

  const middlewares = [errorHandlingMiddleware, websocketMiddleware, logicMiddleware];

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(createLogger());
  }

  middlewares.push(errorHandlingMiddleware);

  const store = createStore(combineReducers(reducers), applyMiddleware(...middlewares));

  logicMiddleware.addDeps({ storeDispatch: store.dispatch }); // see https://github.com/jeffbski/redux-logic/issues/63

  return store;
}
