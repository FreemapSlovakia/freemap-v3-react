import { skipWaiting, clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
// import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// export default null;

declare var self: ServiceWorkerGlobalScope;

clientsClaim();

skipWaiting();

// The precache routes for workbox-webpack-plugin
precacheAndRoute(self.__WB_MANIFEST, {
  ignoreURLParametersMatching: [/.*/], // TODO try to use urlManipulation instead
});

registerRoute(
  '/',
  async ({ event }) => {
    if (event instanceof FetchEvent) {
      const data = await event.request.formData();

      const client: Client = await self.clients.get(
        event.resultingClientId || event.clientId,
      );

      client.postMessage({
        freemap: { action: 'shareFile', payload: data.getAll('file') },
      });
    }

    return Response.redirect('/');
  },
  'POST',
);
