import { attachAuthSync } from '@features/auth/authSync.js';
import { attachGarminLoginMessageHandler } from '@features/auth/garminLoginMessageHandler.js';
import { authInit } from '@features/auth/model/actions.js';
import { attachOAuthLoginMessageHandler } from '@features/auth/oauthLoginMessageHandler.js';
import {
  getCachedTileMaps,
  syncStaticCache,
} from '@features/cachedMaps/cache.js';
import { cachedMapsLoaded } from '@features/cachedMaps/model/actions.js';
import { invokeGeoip } from '@features/geoip/model/actions.js';
import { l10nSetChosenLanguage } from '@features/l10n/model/actions.js';
import { attachMapStateHandler } from '@features/map/mapStateHandler.js';
import { ConfirmProvider } from '@shared/components/ConfirmProvider.js';
import storage from 'local-storage-fallback';
import { createRoot } from 'react-dom/client';
import { IconContext } from 'react-icons/lib';
import { Provider } from 'react-redux';
import { ErrorCatcher } from './components/ErrorCatcher.js';
import { Main } from './components/Main.js';
import { attachKeyboardHandler } from './keyboardHandler.js';
import { init, setEmbedFeatures } from './store/actions.js';
import { setStore as setErrorHandlerStore } from './store/middleware/globalErrorHandler.js';
import { createReduxStore } from './store/store.js';
import './styles/index.scss';
import './styles/bootstrap-override.css';
import './styles/index.css';
import { createCookieConsentToastAction } from '@/features/cookieConsent/model/toastAction.js';
import { handleLocationChange } from './url/locationChangeHandler.js';
import { setUrlUpdatingEnabled } from './url/urlUpdating.js';

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

getCachedTileMaps()
  .then((maps) => {
    if (maps.length > 0) {
      store.dispatch(cachedMapsLoaded(maps));
    }
  })
  .catch((err) => {
    // IndexedDB can be unavailable or blocked (private mode / insecure
    // context); offline maps are simply unavailable then.
    console.warn('Reading cached tile maps failed:', err);
  });

syncStaticCache().catch((err) => {
  console.warn('Static cache sync failed:', err);
});

window.addEventListener('popstate', () => {
  handleLocationChange(store);
});

handleLocationChange(store);

attachOAuthLoginMessageHandler(store);

attachAuthSync(store);

attachGarminLoginMessageHandler(store);

attachMapStateHandler(store);

setUrlUpdatingEnabled(true);

store.dispatch(init());

const cookieConsentResult = store.getState().cookieConsent.cookieConsentResult;

if (!window.fmEmbedded && !window.isRobot && cookieConsentResult === null) {
  store.dispatch(createCookieConsentToastAction());
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
      <ConfirmProvider>
        <ErrorCatcher>
          <Main />
        </ErrorCatcher>
      </ConfirmProvider>
    </IconContext.Provider>
  </Provider>,
);

if (process.env['NODE_ENV'] === 'production') {
  await window.navigator.serviceWorker
    ?.register('/sw.js')
    .catch((err) => console.error('Error registering service worker: ' + err));

  // share target SW
  window.navigator.serviceWorker
    ?.register('/upload-sw.js', { scope: '/upload' })
    .catch((e) => {
      console.warn('Error registering service worker:', e);
    });
} else {
  // In development a leftover service worker (from a prod visit to the same
  // origin) intercepts HMR chunk requests and breaks hot reload, so unregister
  // any existing one. Caches (offline maps, static assets) are left intact.
  window.navigator.serviceWorker
    ?.getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    })
    .catch(() => {
      // ignore
    });
}

try {
  window.navigator.registerProtocolHandler?.('geo', '/?geo=%s');
} catch {
  // browsers can reject; ignore
}

window.addEventListener('message', ({ data }: MessageEvent) => {
  if (data && typeof data === 'object' && typeof data.freemap === 'object') {
    if (data.freemap.action === 'setEmbedFeatures') {
      store.dispatch(setEmbedFeatures(data.freemap.payload));
    }
  }
});

attachKeyboardHandler(store);
