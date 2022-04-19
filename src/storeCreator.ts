///<reference types="webpack-env" />

import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { RootAction } from './actions';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import { createProcessorMiddleware } from './middlewares/processorMiddleware';
import { statePersistingMiddleware } from './middlewares/statePersistingMiddleware';
import { createTrackingMiddleware } from './middlewares/trackingMiddleware';
import { createWebsocketMiddleware } from './middlewares/webSocketMiddleware';
import { processors } from './processors';
import {
  CombinedReducers,
  getInitialState,
  rootReducer,
  RootState,
} from './reducers';

const processorMiddleware = createProcessorMiddleware();

processorMiddleware.processors.push(...processors);

export type MyStore = Store<RootState, RootAction>;

export function createReduxStore(): MyStore {
  const initial = getInitialState();

  const store = createStore(
    rootReducer as CombinedReducers,
    initial,
    composeWithDevTools(
      applyMiddleware(
        errorHandlingMiddleware,
        // process.env['NODE_ENV'] !== 'production' && loggerMiddleware,
        statePersistingMiddleware,
        createWebsocketMiddleware(),
        processorMiddleware,
        createTrackingMiddleware(),
      ),
    ),
  );

  if (process.env['NODE_ENV'] !== 'production' && module.hot) {
    module.hot.accept('./reducers.ts', () =>
      store.replaceReducer(rootReducer as CombinedReducers),
    );

    module.hot.accept('./processors.ts', () => {
      processorMiddleware.processors.length = 0;

      processorMiddleware.processors.push(...processors);
    });
  }

  return store;
}
