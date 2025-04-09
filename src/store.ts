///<reference types="webpack-env" />

import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import { createProcessorMiddleware } from './middlewares/processorMiddleware';
import { statePersistingMiddleware } from './middlewares/statePersistingMiddleware';
import { createTrackingMiddleware } from './middlewares/trackingMiddleware';
import { createWebsocketMiddleware } from './middlewares/webSocketMiddleware';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { processors } from './processors';
import { getInitialState, reducers } from './reducers';

const processorMiddleware = createProcessorMiddleware();

processorMiddleware.processors.push(...processors);

const rootReducer = combineReducers(reducers);

export function createReduxStore() {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        errorHandlingMiddleware,
        // process.env['NODE_ENV'] !== 'production' && loggerMiddleware,
        statePersistingMiddleware,
        createWebsocketMiddleware(),
        processorMiddleware,
        createTrackingMiddleware(),
      ),
    preloadedState: getInitialState(),
  });

  if (process.env['NODE_ENV'] !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer));

    module.hot.accept('./processors.ts', () => {
      processorMiddleware.processors.length = 0;

      processorMiddleware.processors.push(...processors);
    });
  }

  return store;
}

export type RootState = ReturnType<typeof rootReducer>;

export type MyStore = ReturnType<typeof createReduxStore>;
