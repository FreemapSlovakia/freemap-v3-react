import { afterEach, beforeEach, expect, test, vi } from 'vitest';

// The module keeps the loaded catalog, so each test gets a fresh one, and the
// error classes of that same module graph.
let catalog: typeof import('./catalog.js');

let http: typeof import('@app/httpRequest.js');

beforeEach(async () => {
  vi.resetModules();

  vi.stubEnv('API_URL', 'https://api.example');

  catalog = await import('./catalog.js');

  http = await import('@app/httpRequest.js');
});

afterEach(() => {
  vi.unstubAllGlobals();

  vi.unstubAllEnvs();
});

const tileMap = (type: string) => ({
  type,
  layer: 'base',
  name: type,
  body: { url: 'https://t.example/{z}/{x}/{y}.png', attribution: [] },
});

const answer = (body: string, type = 'application/json', status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': type } });

test('ids are asked in batches the API takes, the answers joined', async () => {
  const fetch = vi.fn(async (request: Request) => {
    const types =
      new URL(request.url).searchParams.get('types')?.split(',') ?? [];

    return answer(JSON.stringify({ maps: types.map(tileMap) }));
  });

  vi.stubGlobal('fetch', fetch);

  const types = Array.from(
    { length: 250 },
    (_, i) => `A${String(i).padStart(4, '0')}`,
  );

  const maps = await catalog.loadCatalogMaps(types);

  expect(fetch).toHaveBeenCalledTimes(3);

  for (const [request] of fetch.mock.calls) {
    expect(
      new URL(request.url).searchParams.get('types')?.split(',').length,
    ).toBeLessThanOrEqual(100);
  }

  expect(maps.map((map) => map.type)).toEqual(types);
});

test('with the whole catalog loaded, only the ids it lacks are asked', async () => {
  const fetch = vi.fn(async (request: Request) => {
    const types = new URL(request.url).searchParams.get('types')?.split(',');

    return answer(JSON.stringify({ maps: (types ?? ['AAAA1']).map(tileMap) }));
  });

  vi.stubGlobal('fetch', fetch);

  await catalog.loadLibraryCatalog();

  const maps = await catalog.loadCatalogMaps(['AAAA1', 'NEW01']);

  expect(maps.map((map) => map.type)).toEqual(['AAAA1', 'NEW01']);

  expect(fetch).toHaveBeenCalledTimes(2);

  expect(new URL(fetch.mock.calls[1][0].url).searchParams.get('types')).toBe(
    'NEW01',
  );

  // All known: no request at all.
  await catalog.loadCatalogMaps(['AAAA1']);

  expect(fetch).toHaveBeenCalledTimes(2);
});

test("a map the app can't take is left out, the rest kept", async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      answer(
        JSON.stringify({
          maps: [
            tileMap('AAAA1'),
            tileMap('x'),
            { ...tileMap('AAAA2'), technology: 'wms' },
          ],
        }),
      ),
    ),
  );

  vi.spyOn(console, 'warn').mockImplementation(() => {});

  const maps = await catalog.loadCatalogMaps(['AAAA1', 'x', 'AAAA2']);

  expect(maps.map((map) => map.type)).toEqual(['AAAA1']);
});

test('a page that is not JSON is out of reach; malformed JSON is an error', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => answer('<html>Log in</html>', 'text/html')),
  );

  const portal = await catalog.loadCatalogMaps(['AAAA1']).catch((e) => e);

  expect(catalog.isUnreachable(portal)).toBe(true);

  vi.stubGlobal(
    'fetch',
    vi.fn(async () => answer('{"maps": [', 'application/json')),
  );

  const broken = await catalog.loadCatalogMaps(['AAAA1']).catch((e) => e);

  expect(catalog.isUnreachable(broken)).toBe(false);
});

test('isUnreachable: the network, gateways and proxies, not the API refusing', () => {
  expect(catalog.isUnreachable(new http.NetworkError(new TypeError()))).toBe(
    true,
  );

  for (const status of [404, 429, 502, 503, 504, 511]) {
    expect(catalog.isUnreachable(new http.HttpError(status, ''))).toBe(true);
  }

  for (const status of [400, 500]) {
    expect(catalog.isUnreachable(new http.HttpError(status, ''))).toBe(false);
  }

  expect(catalog.isUnreachable(new Error('x'))).toBe(false);
});
