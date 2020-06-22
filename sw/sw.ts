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
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAGOOOOOOO2 {');

    // skipWaiting(); // not working

    self.skipWaiting().then(
      () => {
        console.log('AAAAAAAAAAAAAAAAAAAAAAAA SUCCES');
      },
      (err) => {
        console.log('AAAAAAAAAAAAAAAAAAAAAAAA FAIL', err);
      },
    );

    console.log('AAAAAAAAAAAAAAAAAAAAAAAAGOOOOOOO2 }');
  }
});

registerRoute('/index.html', new NetworkFirst());

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
