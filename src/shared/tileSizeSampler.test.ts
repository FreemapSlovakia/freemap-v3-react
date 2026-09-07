import { afterEach, describe, expect, it, vi } from 'vitest';
import { countTilesInBbox } from './tileEnumeration.js';
import { fallbackTilesSize, sampleTilesSize } from './tileSizeSampler.js';

const BBOX: [number, number, number, number] = [19.0, 48.7, 19.4, 48.9];

const URL_TEMPLATE = 'https://example.com/{z}/{x}/{y}';

/** Serves every tile with a size taken from `sizeByZoom`. */
function stubTiles(sizeByZoom: (zoom: number) => number | undefined) {
  const requested: string[] = [];

  vi.stubGlobal('fetch', (url: string) => {
    requested.push(url);

    const zoom = Number(new globalThis.URL(url).pathname.split('/')[1]);

    const size = sizeByZoom(zoom);

    return Promise.resolve(
      size === undefined
        ? new Response(null, { status: 404 })
        : new Response(new Uint8Array(size)),
    );
  });

  return requested;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sampleTilesSize', () => {
  it('extrapolates the measured per-zoom sizes over the tile counts', async () => {
    stubTiles((zoom) => (zoom === 10 ? 40_000 : 20_000));

    const estimate = await sampleTilesSize({
      urlTemplate: URL_TEMPLATE,
      bbox: BBOX,
      minZoom: 10,
      maxZoom: 11,
    });

    expect(estimate?.bytesPerZoom).toEqual(
      new Map([
        [10, 40_000],
        [11, 20_000],
      ]),
    );

    expect(estimate?.totalBytes).toBe(
      countTilesInBbox(BBOX, 10, 10) * 40_000 +
        countTilesInBbox(BBOX, 11, 11) * 20_000,
    );
  });

  it('samples the scale that will really be downloaded', async () => {
    const requested = stubTiles(() => 100_000);

    await sampleTilesSize({
      urlTemplate: URL_TEMPLATE,
      bbox: BBOX,
      minZoom: 12,
      maxZoom: 12,
      scale: 3,
    });

    expect(requested.length).toBeGreaterThan(0);

    expect(requested.every((url) => url.endsWith('@3x'))).toBe(true);
  });

  it('interpolates the zooms it did not sample', async () => {
    // only 8, 12 and 16 are sampled out of 8…16
    stubTiles((zoom) => (zoom === 8 ? 10_000 : zoom === 12 ? 50_000 : 30_000));

    const estimate = await sampleTilesSize({
      urlTemplate: URL_TEMPLATE,
      bbox: BBOX,
      minZoom: 8,
      maxZoom: 16,
    });

    expect([...(estimate?.bytesPerZoom.keys() ?? [])].sort((a, b) => a - b)) //
      .toEqual([8, 12, 16]);

    let expected = 0;

    for (let zoom = 8; zoom <= 16; zoom++) {
      const size =
        zoom <= 12
          ? 10_000 + ((zoom - 8) / 4) * 40_000
          : 50_000 - ((zoom - 12) / 4) * 20_000;

      expected += countTilesInBbox(BBOX, zoom, zoom) * size;
    }

    expect(estimate?.totalBytes).toBeCloseTo(expected, 3);
  });

  it('gives up when no tile can be fetched', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));

    await expect(
      sampleTilesSize({
        urlTemplate: URL_TEMPLATE,
        bbox: BBOX,
        minZoom: 10,
        maxZoom: 12,
      }),
    ).resolves.toBeUndefined();
  });
});

describe('fallbackTilesSize', () => {
  it('scales the flat per-tile constant with the hi-DPI factor', () => {
    expect(fallbackTilesSize(10, 2)).toBe(fallbackTilesSize(10) * 4);
  });
});
