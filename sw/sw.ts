// Credits: https://github.com/oliviertassinari/serviceworker-webpack-plugin

export default null;
declare var self: ServiceWorkerGlobalScope;
declare var serviceWorkerOption: any;

const DEBUG = false;

// When the user navigates to your site,
// the browser tries to redownload the script file that defined the service
// worker in the background.
// If there is even a byte's difference in the service worker file compared
// to what it currently has, it considers it 'new'.
const { assets } = serviceWorkerOption;

const cacheName = process.env.NODE_ENV && new Date().toISOString();

let assetsToCache = [...assets, './'];

assetsToCache = assetsToCache.map(path => {
  return new URL(path, self.location.href).toString();
});

// When the service worker is first added to a computer.
self.addEventListener('install', event => {
  // Perform install steps.
  if (DEBUG) {
    console.log('[SW] Install event');
  }

  if (cacheName) {
    // Add core website files to cache during serviceworker installation.
    event.waitUntil(
      self.caches
        .open(cacheName)
        .then(cache => {
          return cache.addAll(assetsToCache);
        })
        .then(() => {
          if (DEBUG) {
            console.log('Cached assets: main', assetsToCache);
          }
        })
        .catch(error => {
          console.error(error);
          throw error;
        }),
    );
  }
});

// After the install event.
self.addEventListener('activate', event => {
  if (DEBUG) {
    console.log('[SW] Activate event');
  }

  if (cacheName) {
    // Clean the caches
    event.waitUntil(
      self.caches.keys().then(cacheNames =>
        Promise.all(
          cacheNames.map(cn =>
            // Delete the caches that are not the current one.
            cn.indexOf(cacheName) === 0 ? null : self.caches.delete(cn),
          ),
        ),
      ),
    );
  }
});

self.addEventListener('message', event => {
  switch (event.data.action) {
    case 'skipWaiting':
      if (self.skipWaiting) {
        self.skipWaiting();
        self.clients.claim();
      }
      break;
    default:
      break;
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;

  const requestUrl = new URL(request.url);

  // Ignore difference origin.
  if (requestUrl.origin !== location.origin) {
    if (DEBUG) {
      console.log(`[SW] Ignore difference origin ${requestUrl.origin}`);
    }
    return;
  }

  if (requestUrl.pathname === '/' && event.request.method === 'POST') {
    handleFileShare(event);
    return;
  }

  if (!cacheName) {
    return;
  }

  // Ignore not GET request.
  if (request.method !== 'GET') {
    if (DEBUG) {
      console.log(`[SW] Ignore non GET request ${request.method}`);
    }
    return;
  }

  const resource = self.caches.match(request).then(response => {
    if (response) {
      if (DEBUG) {
        console.log(`[SW] fetch URL ${requestUrl.href} from cache`);
      }

      return response;
    }

    // Load and cache known assets.
    return fetch(request)
      .then(responseNetwork => {
        if (!responseNetwork || !responseNetwork.ok) {
          if (DEBUG) {
            console.log(
              `[SW] URL [${requestUrl.toString()}] wrong responseNetwork: ${
                responseNetwork.status
              } ${responseNetwork.type}`,
            );
          }

          return responseNetwork;
        }

        if (DEBUG) {
          console.log(`[SW] URL ${requestUrl.href} fetched`);
        }

        const responseCache = responseNetwork.clone();

        self.caches
          .open(cacheName)
          .then(cache => cache.put(request, responseCache))
          .then(() => {
            if (DEBUG) {
              console.log(`[SW] Cache asset: ${requestUrl.href}`);
            }
          });

        return responseNetwork;
      })
      .catch(() => {
        // User is landing on our page.
        if (event.request.mode === 'navigate') {
          return self.caches.match('./');
        }

        return null;
      });
  });

  event.respondWith(resource as Promise<Response>);
});

function handleFileShare(event: FetchEvent) {
  event.respondWith(Response.redirect('/'));

  event.waitUntil(
    (async () => {
      const data = await event.request.formData();
      const client: Client = await self.clients.get(
        event.resultingClientId || event.clientId,
      );
      client.postMessage({
        freemap: { action: 'shareFile', payload: data.getAll('file') },
      });
    })(),
  );
}
