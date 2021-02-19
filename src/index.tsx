// import { errorSetError } from 'fm3/actions/errorActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import {
  enableUpdatingUrl,
  setAppState,
  setEmbedFeatures,
} from 'fm3/actions/mainActions';
import { ErrorCatcher } from 'fm3/components/ErrorCatcher';
import { Main } from 'fm3/components/Main';
import 'fm3/fbLoader';
import { setStore as setErrorHandlerStore } from 'fm3/globalErrorHandler';
import 'fm3/googleAnalytics';
import { history } from 'fm3/historyHolder';
import { attachKeyboardHandler } from 'fm3/keyboardHandler';
import { handleLocationChange } from 'fm3/locationChangeHandler';
import { attachOsmLoginMessageHandler } from 'fm3/osmLoginMessageHandler';
import { storage } from 'fm3/storage';
import { createReduxStore } from 'fm3/storeCreator';
import 'fm3/styles/index.scss';
import 'fullscreen-api-polyfill';
import { render } from 'react-dom';
import { IconContext } from 'react-icons/lib';
import { Provider } from 'react-redux';
import { assertType, setDefaultGetErrorObject } from 'typescript-is';
import { authCheckLogin, authInit } from './actions/authActions';
import { MessagesProvider } from './components/TranslationProvider';
import { AppState } from './types/common';

setDefaultGetErrorObject(() => null);

// filter out old browsers
[].flatMap(() => null);

if (window.location.search === '?reset-local-storage') {
  storage.clear();
}

document.body.classList.add(window.self === window.top ? 'full' : 'embedded');

const store = createReduxStore();

setErrorHandlerStore(store);

if (window.self === window.top) {
  loadAppState();
}

store.dispatch(authInit());

const { location } = history;

history.listen((update) => {
  handleLocationChange(store, update.location);
});

handleLocationChange(store, location);

attachOsmLoginMessageHandler(store);

store.dispatch(enableUpdatingUrl());

// see https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html#comment-4634921967
function setVh() {
  document.documentElement.style.setProperty('--vh', window.innerHeight + 'px');
}

window.addEventListener('resize', setVh);

setVh();

render(
  <Provider store={store}>
    <IconContext.Provider
      value={{
        style: { verticalAlign: 'middle', position: 'relative', top: '-1px' },
      }}
    >
      <MessagesProvider>
        <ErrorCatcher>
          <Main />
        </ErrorCatcher>
      </MessagesProvider>
    </IconContext.Provider>
  </Provider>,
  document.getElementById('app'),
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

function loadAppState() {
  let appState: AppState | undefined;

  const as = storage.getItem('appState');

  if (as) {
    try {
      appState = assertType<AppState>(JSON.parse(as));

      // let's reset map to outdoor
      if (!appState.version && appState.map) {
        appState.map.mapType = 'X';
      }
    } catch (e) {
      storage.removeItem('appState');
      throw e;
    }
  }

  if (appState) {
    store.dispatch(setAppState(appState));
  }

  store.dispatch(
    l10nSetChosenLanguage(
      appState?.language?.replace(/-.*/, '') ?? null, // fixing wrong saved language because of bug in older version
    ),
  );
}

window.addEventListener('message', (e: MessageEvent) => {
  const { data } = e;

  if (data && typeof data === 'object' && typeof data.freemap === 'object') {
    if (data.freemap.action === 'setEmbedFeatures') {
      store.dispatch(setEmbedFeatures(data.freemap.payload));
    }
  }
});

store.dispatch(authCheckLogin());

attachKeyboardHandler(store);
