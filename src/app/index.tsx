import { attachAuthSync } from '@features/auth/authSync.js';
import { attachGarminLoginMessageHandler } from '@features/auth/garminLoginMessageHandler.js';
import { authInit } from '@features/auth/model/actions.js';
import { attachOAuthLoginMessageHandler } from '@features/auth/oauthLoginMessageHandler.js';
import { readBrowseCacheStats } from '@features/cachedMaps/browseCache.js';
import { getCachedTileMaps } from '@features/cachedMaps/cache.js';
import { cachedMapsLoaded } from '@features/cachedMaps/model/actions.js';
import { syncBrowseCache } from '@features/cachedMaps/model/browseCacheProcessor.js';
import { galleryClear } from '@features/gallery/model/actions.js';
import { invokeGeoip } from '@features/geoip/model/actions.js';
import { attachRecorderConnection } from '@features/gpsRecorder/connection.js';
import { l10nSetChosenLanguage } from '@features/l10n/model/actions.js';
import { attachMapStateHandler } from '@features/map/mapStateHandler.js';
import { attachWheelZoomCalibration } from '@features/map/wheelZoomCalibration.js';
import { mapsOfflineIdsLoaded } from '@features/myMaps/model/actions.js';
import { refreshOutbox } from '@features/myMaps/model/processors/mapsOutboxProcessor.js';
import { unsavedContentSelector } from '@features/myMaps/model/selectors.js';
import {
  getOfflineMapCount,
  getOfflineMapIds,
} from '@features/myMaps/offlineStore.js';
import { getPendingCount } from '@features/myMaps/outboxStore.js';
import { attachOutboxSync } from '@features/myMaps/outboxSync.js';
import { attachWebMcp } from '@features/webMcp/attachWebMcp.js';
import { ModalProvider } from '@shared/components/ModalProvider.js';
import { addLeaveReason, attachLeaveGuard } from '@shared/leaveGuard.js';
import { closeGuarded, confirmDiscard } from '@shared/modalCloseGuard.js';
import {
  registerOfflineContentProvider,
  syncStaticCache,
} from '@shared/offlineStaticCache.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import storage from 'local-storage-fallback';
import { createRoot } from 'react-dom/client';
import { IconContext } from 'react-icons/lib';
import { Provider } from 'react-redux';
import { ErrorCatcher } from './components/ErrorCatcher.js';
import { Main } from './components/Main.js';
import { attachKeyboardHandler } from './keyboardHandler.js';
import { init, setActiveModal, setEmbedFeatures } from './store/actions.js';
import { encodeActiveModal } from './store/activeModal.js';
import { setStore as setErrorHandlerStore } from './store/middleware/globalErrorHandler.js';
import { startPerfWatchdog } from './store/middleware/perfWatchdog.js';
import { createReduxStore } from './store/store.js';
import './styles/index.scss';
import './styles/bootstrap-override.css';
import './styles/index.css';
import { createCookieConsentToastAction } from '@features/cookieConsent/model/toastAction.js';
import { handleLocationChange } from './url/locationChangeHandler.js';
import { restoreStashedUrl } from './url/sessionStash.js';
import {
  awayFromShownEntry,
  holdShownEntry,
  noteShownEntry,
  restoreShownEntry,
} from './url/shownEntry.js';
import {
  isUrlUpdatingEnabled,
  setUrlUpdatingEnabled,
} from './url/urlUpdating.js';

window.localStorageFallback = storage;

if (
  window.location.search === '?reset-local-storage' ||
  window.location.hash === '#reset-local-storage'
) {
  storage.clear();
}

// Self-heal a stray double slash in the path (e.g. arriving via an external
// `https://host//#…` link). Left as-is, `location.pathname` is `//`, and the
// URL processor's `pathname + '#hash'` writes would parse as protocol-relative
// URLs and make pushState throw a SecurityError.
if (/\/{2,}/.test(window.location.pathname)) {
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname.replace(/\/{2,}/g, '/') +
      window.location.search +
      window.location.hash,
  );
}

// Before anything reads the URL: an installed app relaunched at its bare
// `start_url` continues from where the last session ended.
restoreStashedUrl();

document.body.classList.add(window.fmEmbedded ? 'embedded' : 'full');

const store = createReduxStore();

setErrorHandlerStore(store);

startPerfWatchdog();

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

// The service worker takes the browse-cache policy from IndexedDB, which only
// the processors write — so hand it the rehydrated settings once at startup, or
// storage cleared behind the app's back would leave it working from stale ones.
syncBrowseCache(store.getState).catch((err) => {
  console.warn('Publishing the browse-cache settings failed:', err);
});

// The static app shell is kept alive as long as any offline content exists.
// Register every content provider before syncing the static cache.
registerOfflineContentProvider(() =>
  getCachedTileMaps().then((maps) => maps.length > 0),
);

registerOfflineContentProvider(() =>
  readBrowseCacheStats().then((stats) => stats.tiles > 0),
);

registerOfflineContentProvider(() => getOfflineMapCount().then((c) => c > 0));

// A queued save is work the user is waiting to have pushed, so the shell stays
// cached for as long as one exists — even with nothing else kept offline.
registerOfflineContentProvider(() => getPendingCount().then((c) => c > 0));

getOfflineMapIds()
  .then((ids) => {
    if (ids.length > 0) {
      store.dispatch(mapsOfflineIdsLoaded(ids));
    }
  })
  .catch((err) => {
    console.warn('Reading offline My Maps failed:', err);
  });

refreshOutbox(store.dispatch).catch((err) => {
  console.warn('Reading queued My Maps saves failed:', err);
});

syncStaticCache().catch((err) => {
  console.warn('Static cache sync failed:', err);
});

let askingOnPopstate = false;

window.addEventListener('popstate', () => {
  // A second Back while asking: the answer applies to wherever it ends up.
  if (askingOnPopstate) {
    return;
  }

  if (!closeGuarded() || !awayFromShownEntry()) {
    handleLocationChange(store);

    noteShownEntry();

    return;
  }

  askingOnPopstate = true;

  const wasUpdatingUrl = isUrlUpdatingEnabled();

  // Until answered, nothing may rewrite the entry the browser is on, nor take
  // it for the one shown.
  setUrlUpdatingEnabled(false);

  holdShownEntry(true);

  void confirmDiscard().then((answer) => {
    askingOnPopstate = false;

    holdShownEntry(false);

    if (answer === 'keep') {
      // A Forward while asking may have come back already.
      if (awayFromShownEntry()) {
        restoreShownEntry();
      }

      setUrlUpdatingEnabled(wasUpdatingUrl);
    } else {
      const { main, gallery } = store.getState();

      handleLocationChange(store);

      // What the URL doesn't take away stays through it; Yes was to close it.
      if (answer === 'discard') {
        const after = store.getState();

        // Unchanged as the URL encodes it, so a Back that moved to another view
        // of the same modal (another section, a list) is left there.
        if (
          main.activeModal &&
          encodeActiveModal(after.main.activeModal) ===
            encodeActiveModal(main.activeModal)
        ) {
          store.dispatch(setActiveModal(null));
        } else if (
          !main.activeModal &&
          gallery.activeImageId !== null &&
          after.gallery.activeImageId === gallery.activeImageId
        ) {
          store.dispatch(galleryClear());
        }
      }
    }

    noteShownEntry();
  });
});

handleLocationChange(store);

attachRecorderConnection(store);

attachOAuthLoginMessageHandler(store);

attachAuthSync(store);

attachGarminLoginMessageHandler(store);

attachMapStateHandler(store);

attachWheelZoomCalibration(store);

attachOutboxSync(store);

// An embed shows the host's map, which its visitor has nothing of their own in.
if (!window.fmEmbedded) {
  attachLeaveGuard();

  // Not `linkIncompleteSelector`: a queued save survives the page.
  addLeaveReason(() => unsavedContentSelector(store.getState()));
}

// An embedded map is a slice of someone else's page, and a crawler runs no agent.
if (!window.fmEmbedded && !window.isRobot) {
  attachWebMcp(store).catch((err) => {
    console.warn('Registering WebMCP tools failed:', err);
  });
}

setUrlUpdatingEnabled(true);

store.dispatch(init());

const cookieConsentResult = store.getState().cookieConsent.cookieConsentResult;

if (!window.fmEmbedded && !window.isRobot && cookieConsentResult === null) {
  store.dispatch(createCookieConsentToastAction());
}

if (cookieConsentResult) {
  trackMatomo(['setCookieConsentGiven']);
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
      <ModalProvider>
        <ErrorCatcher>
          <Main />
        </ErrorCatcher>
      </ModalProvider>
    </IconContext.Provider>
  </Provider>,
);

// Tells the startup check in index.ejs that `main` ran.
window.fmStarted = true;

// index.ejs's offer of the cached build, for a slow start
document.getElementById('fm-skip-network')?.remove();

if (process.env['NODE_ENV'] === 'production') {
  await window.navigator.serviceWorker
    ?.register('/sw.js')
    .catch((err) => console.error(`Error registering service worker: ${err}`));

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

// Firefox offers on every call, even after a decline (bug 1084425), so it gets
// one offer per browser; Chromium remembers a decline itself.
try {
  if (window.navigator.registerProtocolHandler) {
    if (!navigator.userAgent.includes('Firefox/')) {
      window.navigator.registerProtocolHandler('geo', '/?geo=%s');
    } else if (!localStorage.getItem('fm.geoHandlerOffered')) {
      localStorage.setItem('fm.geoHandlerOffered', '1');

      window.navigator.registerProtocolHandler('geo', '/?geo=%s');
    }
  }
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
