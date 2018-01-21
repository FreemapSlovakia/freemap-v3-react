import { createStore, applyMiddleware } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import { createLogger } from 'redux-logger';

import reducer from 'fm3/reducers';
import logics from 'fm3/logic';

import * as at from 'fm3/actionTypes';
import { sendError } from 'fm3/globalErrorHandler';

export default function createReduxStore() {
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

  const middlewares = [errorHandlingMiddleware, logicMiddleware];

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(createLogger());
  }

  middlewares.push(errorHandlingMiddleware);

  const store = createStore(reducer, applyMiddleware(...middlewares));

  logicMiddleware.addDeps({ storeDispatch: store.dispatch }); // see https://github.com/jeffbski/redux-logic/issues/63

  return store;
}
