///<reference types="webpack-env" />

import storage from 'local-storage-fallback';
import { DefaultRootState } from 'react-redux';
import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { is } from 'typescript-is';
import { RootAction } from './actions';
import { GalleryColorizeBy } from './actions/galleryActions';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import { createProcessorMiddleware } from './middlewares/processorMiddleware';
import { statePersistingMiddleware } from './middlewares/statePersistingMiddleware';
import { createTrackingMiddleware } from './middlewares/trackingMiddleware';
import { createWebsocketMiddleware } from './middlewares/webSocketMiddleware';
import { processors } from './processors';
import { CR, rootReducer } from './reducers';
import { authInitialState, AuthState } from './reducers/authReducer';
import { galleryInitialState } from './reducers/galleryReducer';
import { l10nInitialState, L10nState } from './reducers/l10nReducer';
import { mainInitialState, MainState } from './reducers/mainReducer';
import { mapInitialState, MapState } from './reducers/mapReducer';
import {
  routePlannerInitialState,
  RoutePlannerState,
} from './reducers/routePlannerReducer';
import {
  trackViewerInitialState,
  TrackViewerState,
} from './reducers/trackViewerReducer';

const processorMiddleware = createProcessorMiddleware();

processorMiddleware.processors.push(...processors);

export type MyStore = Store<DefaultRootState, RootAction>;

export function createReduxStore(): MyStore {
  let persisted: Partial<Record<keyof DefaultRootState, unknown>> = {};

  try {
    persisted = JSON.parse(storage.getItem('store') ?? '{}');
  } catch {
    // nothing
  }

  const initial: Partial<DefaultRootState> = {};

  if (is<Partial<MapState>>(persisted.map)) {
    initial.map = { ...mapInitialState, ...persisted.map };
  }

  if (is<Partial<L10nState>>(persisted.l10n)) {
    initial.l10n = { ...l10nInitialState, ...persisted.l10n };
  }

  if (is<Partial<AuthState>>(persisted.auth)) {
    initial.auth = { ...authInitialState, ...persisted.auth };
  }

  if (is<Partial<MainState>>(persisted.main)) {
    initial.main = { ...mainInitialState, ...persisted.main };
  }

  if (is<Partial<RoutePlannerState>>(persisted.routePlanner)) {
    initial.routePlanner = {
      ...routePlannerInitialState,
      ...persisted.routePlanner,
    };
  }

  if (is<Partial<TrackViewerState>>(persisted.trackViewer)) {
    initial.trackViewer = {
      ...trackViewerInitialState,
      ...persisted.trackViewer,
    };
  }

  if (is<{ colorizeBy: GalleryColorizeBy | null }>(persisted.gallery)) {
    initial.gallery = {
      ...galleryInitialState,
      ...persisted.gallery,
    };
  }

  const store = createStore(
    rootReducer as CR,
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
      store.replaceReducer(rootReducer as CR),
    );

    module.hot.accept('./processors.ts', () => {
      processorMiddleware.processors.length = 0;

      processorMiddleware.processors.push(...processors);
    });
  }

  return store;
}
