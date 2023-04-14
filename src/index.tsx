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
import { createRoot } from 'react-dom/client';
import { IconContext } from 'react-icons/lib';
import { Provider } from 'react-redux';
import { setDefaultGetErrorObject } from 'typescript-is';
import { authInit } from './actions/authActions';
import { l10nSetChosenLanguage } from './actions/l10nActions';
import { toastsAdd } from './actions/toastsActions';
import { MessagesProvider } from './components/TranslationProvider';

if (process.env['GA_MEASUREMENT_ID']) {
  window.gtag('config', process.env['GA_MEASUREMENT_ID']);
}

setDefaultGetErrorObject(() => null);

// filter out old browsers
[].flatMap(() => null);

if (
  window.location.search === '?reset-local-storage' ||
  window.location.hash === '#reset-local-storage'
) {
  storage.clear();
}

// workaround to fix blurring menus on hidpi desktop chrome
if (
  window.devicePixelRatio > 1 &&
  navigator.userAgent.includes('Chrome/') &&
  !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
    navigator.userAgent,
  )
) {
  document.documentElement.style.setProperty(
    '--scroller-mix-blend-mode',
    'none',
  );
}

document.body.classList.add(window.fmEmbedded ? 'embedded' : 'full');

const store = createReduxStore();

setErrorHandlerStore(store);

store.dispatch(
  l10nSetChosenLanguage({
    language: store.getState().l10n.chosenLanguage,
    noSave: true,
  }),
);

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

if (!window.fmEmbedded && !window.isRobot && cookieConsentResult === null) {
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

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('root element not found');
}

createRoot(rootElement).render(
  <Provider store={store}>
    <IconContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
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
);

if ('serviceWorker' in navigator) {
  // navigator.serviceWorker.register(new URL('./sw/sw', import.meta.url));
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

attachKeyboardHandler(store);
