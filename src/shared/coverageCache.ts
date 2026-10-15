/**
 * The last coverage fetched per URL, for offline: without it the aerial map
 * could not tell its orthophoto's ground from Esri's. Kept across service
 * worker updates.
 */
export const COVERAGE_CACHE_NAME = 'tile-coverage';

export async function storeCoverage(
  url: string,
  data: ArrayBuffer,
): Promise<void> {
  try {
    const cache = await caches.open(COVERAGE_CACHE_NAME);

    await cache.put(url, new Response(data));
  } catch {
    // Cache Storage unavailable; offline the coverage is then unknown
  }
}

export async function storedCoverage(
  url: string,
): Promise<ArrayBuffer | undefined> {
  try {
    const stored = await caches.match(url, { cacheName: COVERAGE_CACHE_NAME });

    return await stored?.arrayBuffer();
  } catch {
    return undefined;
  }
}
