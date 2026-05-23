/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const SHARE_CACHE = 'pending-shares';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== 'POST' ||
    url.origin !== location.origin ||
    url.pathname !== '/upload'
  ) {
    return;
  }

  event.respondWith(handleShareUpload(event.request));
});

async function handleShareUpload(request: Request): Promise<Response> {
  try {
    const data = await request.formData();

    const files = data
      .getAll('file')
      .filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      const text = [data.get('text'), data.get('url'), data.get('title')]
        .filter((v): v is string => typeof v === 'string')
        .join(' ');

      const geo = text ? extractGeoFromText(text) : null;

      if (geo) {
        return Response.redirect(`/?geo=${encodeURIComponent(geo)}`, 303);
      }

      if (text.trim()) {
        return Response.redirect(`/?q=${encodeURIComponent(text.trim())}`, 303);
      }

      return Response.redirect('/', 303);
    }

    const shareId = Date.now().toString(36);

    const cache = await caches.open(SHARE_CACHE);

    await Promise.all(
      files.map((file, i) =>
        cache.put(
          `/__share/${shareId}/${i}`,
          new Response(file, {
            headers: {
              'content-type': file.type || 'application/octet-stream',
              'x-file-name': encodeURIComponent(file.name),
              'x-file-last-modified': String(file.lastModified),
            },
          }),
        ),
      ),
    );

    return Response.redirect(`/?shared=${shareId}`, 303);
  } catch (e) {
    return new Response(`Share failed: ${(e as Error).message}`, {
      status: 500,
    });
  }
}

function extractGeoFromText(text: string): string | null {
  const geo = /geo:-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?(?:[?;,(][^\s]*)?/i.exec(
    text,
  );

  return geo ? geo[0] : null;
}
