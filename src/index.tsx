// import { errorSetError } from 'fm3/actions/errorActions';
import {
  applyCookieConsent,
  enableUpdatingUrl,
  setEmbedFeatures,
} from 'fm3/actions/mainActions';
import { ErrorCatcher } from 'fm3/components/ErrorCatcher';
import { Main } from 'fm3/components/Main';
import 'fm3/fbLoader';
import { setStore as setErrorHandlerStore } from 'fm3/globalErrorHandler';
import { history } from 'fm3/historyHolder';
import { attachKeyboardHandler } from 'fm3/keyboardHandler';
import { handleLocationChange } from 'fm3/locationChangeHandler';
import { attachOsmLoginMessageHandler } from 'fm3/osmLoginMessageHandler';
import { createReduxStore } from 'fm3/storeCreator';
import 'fm3/styles/index.scss';
import 'fullscreen-api-polyfill';
import storage from 'local-storage-fallback';
import { render } from 'react-dom';
import { IconContext } from 'react-icons/lib';
import { Provider } from 'react-redux';
import { setDefaultGetErrorObject } from 'typescript-is';
import { authCheckLogin, authInit } from './actions/authActions';
import { l10nSetChosenLanguage } from './actions/l10nActions';
import { toastsAdd } from './actions/toastsActions';
import { MessagesProvider } from './components/TranslationProvider';

if (process.env['GA_MEASUREMENT_ID']) {
  window.gtag('config', process.env['GA_MEASUREMENT_ID']);
}

setDefaultGetErrorObject(() => null);

// filter out old browsers
[].flatMap(() => null);

if (window.location.search === '?reset-local-storage') {
  storage.clear();
}

document.body.classList.add(window.fmEmbedded ? 'embedded' : 'full');

const store = createReduxStore();

setErrorHandlerStore(store);

store.dispatch(l10nSetChosenLanguage(store.getState().l10n.chosenLanguage));

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

const cookieConsentResult = store.getState().main.cookieConsentResult;

if (window.fmEmbedded) {
  // nothing for ebed
} else if (cookieConsentResult !== null) {
  store.dispatch(applyCookieConsent());
} else {
  store.dispatch(
    toastsAdd({
      messageKey: 'main.cookieConsent',
      style: 'warning',
      actions: [
        {
          nameKey: 'general.ok',
          action: applyCookieConsent(),
          style: 'secondary',
        },
      ],
    }),
  );
}

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
