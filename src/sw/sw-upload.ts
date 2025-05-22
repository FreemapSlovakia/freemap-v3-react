/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

function fetchEventHandler(event: FetchEvent) {
  event.respondWith(
    (async () => {
      const url = new URL(event.request.url);

      if (
        event.request.method === 'POST' &&
        url.origin === location.origin &&
        url.pathname === '/upload'
      ) {
        const data = await event.request.formData();

        const client = await self.clients.get(
          event.resultingClientId || event.clientId,
        );

        client?.postMessage({
          freemap: { action: 'shareFile', payload: data.getAll('file') },
        });

        return Response.redirect('/');
      }

      return Response.error();
    })(),
  );
}

self.addEventListener('fetch', fetchEventHandler);
