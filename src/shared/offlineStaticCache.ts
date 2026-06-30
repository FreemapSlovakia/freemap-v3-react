import { del, get, set } from 'idb-keyval';

const STATIC_CACHE_NAME = 'offline-static';

const STATIC_MANIFEST_KEY = 'staticAssetsManifest';

// Caching at most this many assets in parallel avoids a fetch storm of the whole
// (~800-entry) manifest at once, which would saturate the connection and cause
// avoidable add failures on constrained links.
const ADD_CONCURRENCY = 8;

// The SW serves the SPA shell from this cached entry; if it didn't cache, the
// shell is unusable offline, so we treat such a populate as failed.
const SHELL_ENTRY = 'index.html';

/**
 * Features that need the static app shell cached for offline use (offline tile
 * maps, offline My Maps, …) register a provider here, so the shell is kept alive
 * — and torn down — based on the union of all offline content. Returns an
 * unregister function.
 */
const offlineContentProviders = new Set<() => Promise<boolean>>();

export function registerOfflineContentProvider(
  hasContent: () => Promise<boolean>,
): () => void {
  offlineContentProviders.add(hasContent);

  return () => {
    offlineContentProviders.delete(hasContent);
  };
}

async function hasAnyOfflineContent(): Promise<boolean> {
  for (const hasContent of offlineContentProviders) {
    if (await hasContent()) {
      return true;
    }
  }

  return false;
}

/** Adds URLs to the cache with bounded concurrency, tolerating per-URL failures. */
async function cacheUrlsTolerant(cache: Cache, urls: string[]): Promise<void> {
  let i = 0;

  await Promise.all(
    Array.from({ length: Math.min(ADD_CONCURRENCY, urls.length) }, async () => {
      while (i < urls.length) {
        await cache.add(urls[i++]).catch(() => {});
      }
    }),
  );
}

/** Caches the static app shell if it isn't cached yet (idempotent). */
export async function ensureStaticAssetsCached(): Promise<void> {
  if (!(await isStaticCacheReady())) {
    try {
      await cacheStaticAssets();
    } catch (err) {
      // Leaves the cache not-ready so a later call retries; the offline content
      // the caller just stored is unaffected.
      console.warn('Static shell caching incomplete:', err);
    }
  }
}

/** Drops the static shell once no offline content remains. */
export async function maybeClearStaticCache(): Promise<void> {
  if (!(await hasAnyOfflineContent())) {
    await clearStaticCache();
  }
}

async function fetchManifest(): Promise<Record<string, string>> {
  const res = await fetch('./assets-manifest.json');

  return res.json();
}

export async function cacheStaticAssets(): Promise<void> {
  const cache = await caches.open(STATIC_CACHE_NAME);

  const manifest = await fetchManifest();

  // Add entries individually and tolerate failures: `cache.addAll` is atomic, so
  // a single unfetchable asset (a redirect, a prerender-only HTML) would abort
  // caching the entire app shell and leave offline mode broken.
  await cacheUrlsTolerant(cache, [...new Set(Object.values(manifest))]);

  // If the load-bearing shell entry didn't cache (e.g. the network was down for
  // the whole batch), treat the populate as failed — don't write the sentinel —
  // so isStaticCacheReady stays false and ensureStaticAssetsCached retries
  // instead of leaving an empty cache that reports "ready".
  if (!(await cache.match(SHELL_ENTRY))) {
    throw new Error('static shell caching failed: index.html not cached');
  }

  await set(STATIC_MANIFEST_KEY, manifest);
}

export async function isStaticCacheReady(): Promise<boolean> {
  // The manifest sentinel is written only after a populate completes, so it
  // distinguishes a ready cache from an empty one left behind by a failed
  // populate — which `caches.has` alone would wrongly report as ready.
  const [hasManifest, hasCache] = await Promise.all([
    get(STATIC_MANIFEST_KEY).then((m) => m !== undefined),
    caches.has(STATIC_CACHE_NAME),
  ]);

  return hasManifest && hasCache;
}

export async function clearStaticCache(): Promise<void> {
  await caches.delete(STATIC_CACHE_NAME);

  await del(STATIC_MANIFEST_KEY);
}

/**
 * Called on app startup.
 * - If no offline content exists → delete static cache.
 * - If offline content exists → diff manifest; prune stale + add new entries.
 */
export async function syncStaticCache(): Promise<void> {
  if (!(await hasAnyOfflineContent())) {
    await clearStaticCache();

    return;
  }

  if (!navigator.onLine) {
    return;
  }

  let newManifest: Record<string, string>;

  try {
    newManifest = await fetchManifest();
  } catch {
    return;
  }

  const oldManifest =
    (await get<Record<string, string>>(STATIC_MANIFEST_KEY)) ?? {};

  const newUrls = new Set(Object.values(newManifest));
  const oldUrls = new Set(Object.values(oldManifest));

  const sameSize = newUrls.size === oldUrls.size;
  const allMatch = sameSize && [...newUrls].every((u) => oldUrls.has(u));

  if (allMatch) {
    return;
  }

  const cache = await caches.open(STATIC_CACHE_NAME);

  // prune removed URLs
  await Promise.all(
    [...oldUrls].filter((u) => !newUrls.has(u)).map((u) => cache.delete(u)),
  );

  // add new URLs (ignore failures so one bad asset doesn't abort the whole sync)
  await cacheUrlsTolerant(
    cache,
    [...newUrls].filter((u) => !oldUrls.has(u)),
  );

  await set(STATIC_MANIFEST_KEY, newManifest);
}
