/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { get, set } from 'idb-keyval';
import { CacheMode, SwCacheAction } from '../types/common.js';

const resources = self.__WB_MANIFEST;

const FALLBACK_CACHE_NAME = 'offline-html';

const OFFLINE_CACHE_NAME = 'offline';

const FALLBACK_HTML_URL = '/offline.html';

const FALLBACK_LOGO_URL = '/freemap-logo.jpg';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(FALLBACK_CACHE_NAME)
      .then((cache) => cache.addAll([FALLBACK_HTML_URL, FALLBACK_LOGO_URL])),
  );

  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const cacheMode = (await get('cacheMode')) as undefined | CacheMode;

      if (!cacheMode || cacheMode === 'networkOnly') {
        return (await serveFromNetwork(event)) ?? Response.error();
      } else if (cacheMode === 'networkFirst') {
        return (
          (await serveFromNetwork(event)) ??
          (await serveFromCache(event)) ??
          Response.error()
        );
      } else if (cacheMode === 'cacheFirst') {
        return (
          (await serveFromCache(event)) ??
          (await serveFromNetwork(event)) ??
          Response.error()
        );
      } else if (cacheMode === 'cacheOnly') {
        return (await serveFromCache(event)) ?? Response.error();
      } else if (cacheMode) {
        if (
          event.request.method !== 'GET' ||
          !/^https?:/.test(event.request.url)
        ) {
          Response.error();
        }

        const cache = await caches.open(OFFLINE_CACHE_NAME);

        const ok = await serveFromCache(event);

        if (ok) {
          return ok;
        }

        const response = await fetch(event.request);

        cache.put(event.request, response.clone()); // todo handle async error

        return response;
      }

      return Response.error();
    })(),
  );
});

async function serveFromCache(event: FetchEvent) {
  const cache = await caches.open(OFFLINE_CACHE_NAME);

  const url = new URL(event.request.url);

  return cache.match(url.pathname === '/' ? 'index.html' : event.request);
}

async function serveFromNetwork(event: FetchEvent) {
  const { request } = event;

  try {
    const [response, cachingActive] = await Promise.all([
      fetch(request),
      get('cachingActive'),
    ]);

    if (
      cachingActive &&
      response.ok &&
      request.method === 'GET' &&
      /^https?:/.test(request.url)
    ) {
      const clonedResponse = response.clone();

      (async () => {
        const cache = await caches.open(OFFLINE_CACHE_NAME);

        await cache.put(request, clonedResponse);
      })(); // todo handle async error
    }

    return response;
  } catch {
    const cache = await caches.open(FALLBACK_CACHE_NAME);

    const url = new URL(request.url);

    const path =
      url.pathname === '/'
        ? FALLBACK_HTML_URL
        : url?.pathname === FALLBACK_LOGO_URL
          ? FALLBACK_LOGO_URL
          : undefined;

    return path && (await cache.match(path));
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all([
        self.clients.claim(), // TODO maybe try to eliminate this

        // remove old caches
        ...cacheNames.map((cacheName) =>
          cacheName !== FALLBACK_CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME
            ? caches.delete(cacheName)
            : undefined,
        ),
      ]);
    })(),
  );
});

async function cacheLocal() {
  const cache = await caches.open(OFFLINE_CACHE_NAME);

  await cache.addAll(resources.map((resource) => resource.url));
}

async function handleCacheAction(action: SwCacheAction) {
  switch (action.type) {
    case 'clearCache':
      await caches.delete(OFFLINE_CACHE_NAME);

      if (await get('cachingActive')) {
        await cacheLocal();
      }

      break;

    case 'setCachingActive':
      if (action.payload) {
        await cacheLocal();

        // TODO notify clients that static resources has been cached
      }

      await set('cachingActive', action.payload);

      break;

    case 'setCacheMode':
      await set('cacheMode', action.payload);

      break;

    default:
      break;
  }
}

self.addEventListener('message', (e) => {
  if (Array.isArray(e.data)) {
    e.waitUntil(Promise.all(e.data.map((a) => handleCacheAction(a))));
  } else if (typeof e.data === 'object' && e.data) {
    e.waitUntil(handleCacheAction(e.data));
  }
});

export default null;
