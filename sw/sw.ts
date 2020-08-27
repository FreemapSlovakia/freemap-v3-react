// import { skipWaiting } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

// export default null;

declare var self: ServiceWorkerGlobalScope;

// clientsClaim();
// skipWaiting();

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // skipWaiting(); // not working

    self.skipWaiting().catch((err) => {
      console.log('Error skipWaiting', err);
    });
  }
});

registerRoute('/index.html', new NetworkFirst());

if (process.env.DEPLOYMENT && process.env.DEPLOYMENT !== 'dev') {
  // The precache routes for workbox-webpack-plugin
  precacheAndRoute(self.__WB_MANIFEST, {
    ignoreURLParametersMatching: [/.*/], // TODO try to use urlManipulation instead
  });
}

registerRoute(
  '/',
  async ({ event }) => {
    if (event instanceof FetchEvent) {
      const data = await event.request.formData();

      const client = await self.clients.get(
        event.resultingClientId || event.clientId,
      );

      client?.postMessage({
        freemap: { action: 'shareFile', payload: data.getAll('file') },
      });
    }

    return Response.redirect('/');
  },
  'POST',
);
