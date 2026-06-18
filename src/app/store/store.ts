///<reference types="webpack-env" />

import { createTrackingMiddleware } from '@features/tracking/model/trackingMiddleware.js';
import { createWebsocketMiddleware } from '@features/websocket/model/webSocketMiddleware.js';
import { combineReducers, configureStore, isPlain } from '@reduxjs/toolkit';
import { errorHandlingMiddleware } from '../store/middleware/errorHandlingMiddleware.js';
import { perfWatchdogMiddleware } from '../store/middleware/perfWatchdog.js';
import { createProcessorMiddleware } from '../store/middleware/processorMiddleware.js';
import { statePersistingMiddleware } from '../store/middleware/statePersistingMiddleware.js';
import { processors } from './processors.js';
import { getInitialState, reducers } from './rootReducer.js';

const processorMiddleware = createProcessorMiddleware();

processorMiddleware.processors.push(...processors);

const rootReducer = combineReducers(reducers);

export function createReduxStore() {
  const store = configureStore({
    devTools: true,
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          isSerializable: (value: unknown) =>
            value instanceof Date ||
            value instanceof File ||
            value instanceof Error ||
            isPlain(value),
          // A toast may carry a static per-feature message loader
          // (`Toast.messageLoader`) so its text can re-resolve on language
          // switch. Toasts are never persisted, so this function is safe here.
          ignoredActionPaths: ['payload.messageLoader'],
          ignoredPaths: [/^toasts\.toasts\.[^.]+\.messageLoader$/],
        },
      }).concat(
        perfWatchdogMiddleware,
        errorHandlingMiddleware,
        statePersistingMiddleware,
        createWebsocketMiddleware(),
        processorMiddleware,
        createTrackingMiddleware(),
      ),
    preloadedState: getInitialState(),
  });

  if (process.env['NODE_ENV'] !== 'production' && module.hot) {
    module.hot.accept('./reducer.js', () => store.replaceReducer(rootReducer));

    module.hot.accept('./processors.js', () => {
      processorMiddleware.processors.length = 0;

      processorMiddleware.processors.push(...processors);
    });
  }

  return store;
}

export type RootState = ReturnType<typeof rootReducer>;

export type MyStore = ReturnType<typeof createReduxStore>;
