import { createStore, applyMiddleware } from 'redux';
import { createLogicMiddleware } from 'redux-logic';
import { createLogger } from 'redux-logger';

import reducer from 'fm3/reducers';
import logics from 'fm3/logic';

import * as at from 'fm3/actionTypes';

export default function createReduxStore() {
  const logicMiddleware = createLogicMiddleware(logics);

  const errorHandlingMiddleware = () => next => (action) => {
    try {
      if (action.type === at.UNHANDLED_LOGIC_ERROR) {
        throw new Error('Logic error');
      }

      return next(action);
    } catch (error) {
      error.action = action;
      setTimeout(() => { // to prevent redux-logic to catch it
        throw error;
      });
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
