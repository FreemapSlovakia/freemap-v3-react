import storage from 'local-storage-fallback';
import { createRoot } from 'react-dom/client';
import { IconContext } from 'react-icons/lib';
import { Provider } from 'react-redux';
import { authInit } from './actions/authActions.js';
import { l10nSetChosenLanguage } from './actions/l10nActions.js';
import {
  applyCookieConsent,
  enableUpdatingUrl,
  setEmbedFeatures,
} from './actions/mainActions.js';
import { toastsAdd } from './actions/toastsActions.js';
import { ErrorCatcher } from './components/ErrorCatcher.js';
import { Main } from './components/Main.js';
import { MessagesProvider } from './components/TranslationProvider.js';
import './fbLoader.js';
import { attachGarminLoginMessageHandler } from './garminLoginMessageHandler.js';
import { setStore as setErrorHandlerStore } from './globalErrorHandler.js';
import { attachKeyboardHandler } from './keyboardHandler.js';
import { handleLocationChange } from './locationChangeHandler.js';
import { attachOsmLoginMessageHandler } from './osmLoginMessageHandler.js';
import { createReduxStore } from './store.js';
import './styles/index.scss';

if (
  window.location.search === '?reset-local-storage' ||
  window.location.hash === '#reset-local-storage'
) {
  storage.clear();
}

// workaround to fix blurring menus on hidpi desktop chrome
if (
  window.devicePixelRatio > 1 &&
  window.navigator.userAgent.includes('Chrome/') &&
  !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
    window.navigator.userAgent,
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

window.addEventListener('popstate', () => {
  handleLocationChange(store);
});

handleLocationChange(store);

attachOsmLoginMessageHandler(store);

attachGarminLoginMessageHandler(store);

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

if (cookieConsentResult) {
  window._paq.push(['setCookieConsentGiven']);
}

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('root element not found');
}

createRoot(rootElement).render(
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
);

window.navigator.serviceWorker?.register('/sw.js').catch((e) => {
  console.warn('Error registering service worker:', e);
});

// share target SW
window.navigator.serviceWorker
  ?.register('/upload-sw.js', { scope: '/upload' })
  .catch((e) => {
    console.warn('Error registering service worker:', e);
  });

window.addEventListener('message', ({ data }: MessageEvent) => {
  if (data && typeof data === 'object' && typeof data.freemap === 'object') {
    if (data.freemap.action === 'setEmbedFeatures') {
      store.dispatch(setEmbedFeatures(data.freemap.payload));
    }
  }
});

attachKeyboardHandler(store);
