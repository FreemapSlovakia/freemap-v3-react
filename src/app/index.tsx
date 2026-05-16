import { attachGarminLoginMessageHandler } from '@features/auth/garminLoginMessageHandler.js';
import { authInit } from '@features/auth/model/actions.js';
import { attachOsmLoginMessageHandler } from '@features/auth/osmLoginMessageHandler.js';
import {
  getCachedTileMaps,
  syncStaticCache,
} from '@features/cachedMaps/cache.js';
import { cachedMapsLoaded } from '@features/cachedMaps/model/actions.js';
import { applyCookieConsent } from '@features/cookieConsent/model/actions.js';
import { invokeGeoip } from '@features/geoip/model/actions.js';
import { l10nSetChosenLanguage } from '@features/l10n/model/actions.js';
import { attachMapStateHandler } from '@features/map/mapStateHandler.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import '@mantine/core/styles.css';
import storage from 'local-storage-fallback';
import { createRoot } from 'react-dom/client';
import { IconContext } from 'react-icons/lib';
import { Provider } from 'react-redux';
import { ErrorCatcher } from './components/ErrorCatcher.js';
import { Main } from './components/Main.js';
import { MantineThemeProvider } from './components/MantineThemeProvider.js';
import { MessagesProvider } from './components/TranslationProvider.js';
import { attachKeyboardHandler } from './keyboardHandler.js';
import { enableUpdatingUrl, setEmbedFeatures } from './store/actions.js';
import { setStore as setErrorHandlerStore } from './store/middleware/globalErrorHandler.js';
import { createReduxStore } from './store/store.js';
import './styles/index.scss';
import { handleLocationChange } from './url/locationChangeHandler.js';

window.localStorageFallback = storage;

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

store.dispatch(invokeGeoip());

store.dispatch(
  l10nSetChosenLanguage({
    language: store.getState().l10n.chosenLanguage,
    noSave: true,
  }),
);

store.dispatch(authInit());

getCachedTileMaps().then((maps) => {
  if (maps.length > 0) {
    store.dispatch(cachedMapsLoaded(maps));
  }
});

syncStaticCache().catch((err) => {
  console.warn('Static cache sync failed:', err);
});

window.addEventListener('popstate', () => {
  handleLocationChange(store);
});

handleLocationChange(store);

attachOsmLoginMessageHandler(store);

attachGarminLoginMessageHandler(store);

attachMapStateHandler(store);

store.dispatch(enableUpdatingUrl(true));

const cookieConsentResult = store.getState().cookieConsent.cookieConsentResult;

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
    <MantineThemeProvider>
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
    </MantineThemeProvider>
  </Provider>,
);

await window.navigator.serviceWorker
  ?.register('/sw.js')
  .catch((err) => console.error('Error registering service worker: ' + err));

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
