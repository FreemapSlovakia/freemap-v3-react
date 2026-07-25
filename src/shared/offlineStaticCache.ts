import { del, get, set } from 'idb-keyval';

const STATIC_CACHE_NAME = 'offline-static';

const STATIC_MANIFEST_KEY = 'staticAssetsManifest';

const CACHE_VERSION_KEY = 'staticCacheVersion';

// Bump to force a one-time rebuild of every existing offline-static cache on the
// next online load — e.g. after fixing a bug that could have left mixed-build
// (inconsistent) caches in the wild. Not a per-load safety net: it's a single
// idb read that only heals when the stored version differs, then never again.
const CACHE_VERSION = 1;

// Caching at most this many assets in parallel avoids a fetch storm of the whole
// (~800-entry) manifest at once, which would saturate the connection and cause
// avoidable add failures on constrained links.
const ADD_CONCURRENCY = 8;

// A dropped JS/CSS chunk makes the lazy-loaded feature that imports it fail
// offline, so the code assets are cached with retries and gate the commit; other
// assets (images, fonts, prerender-only HTML) are best-effort. Bounded rounds
// keep a transient failure on a flaky link from permanently dropping a chunk.
const CACHE_RETRY_ROUNDS = 3;

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

/**
 * The load-bearing code assets: every JS/CSS chunk plus the app shell. All of
 * these must be cached for the app to fully work offline — the shell to boot,
 * and each chunk so its lazily-loaded feature is reachable.
 */
function criticalUrls(manifest: Record<string, string>): string[] {
  const urls = new Set(
    Object.values(manifest).filter((url) => /\.(?:js|css)$/.test(url)),
  );

  const shell = manifest['index.html'];

  if (typeof shell === 'string') {
    urls.add(shell);
  }

  return [...urls];
}

/** Returns the subset of URLs not present in the cache. */
async function missingUrls(cache: Cache, urls: string[]): Promise<string[]> {
  const results = await Promise.all(
    urls.map(async (url) => ((await cache.match(url)) ? null : url)),
  );

  return results.filter((url): url is string => url !== null);
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

/**
 * Ensures every URL is cached, re-fetching only the still-missing ones for a few
 * rounds so a transient failure doesn't permanently drop an asset. Fetches only
 * what's absent, so calling it with the full code set is cheap once cached.
 * Returns the URLs still missing after the last round.
 */
async function ensureCached(cache: Cache, urls: string[]): Promise<string[]> {
  let missing = await missingUrls(cache, urls);

  for (
    let round = 0;
    round < CACHE_RETRY_ROUNDS && missing.length > 0;
    round++
  ) {
    await cacheUrlsTolerant(cache, missing);

    missing = await missingUrls(cache, missing);
  }

  return missing;
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
  // Bypass the HTTP cache: the manifest is served without Cache-Control, so a
  // heuristically-cached stale copy would make us precache a previous build's
  // chunks while the served shell references the current ones — a mixed-build
  // cache whose lazy features fail offline.
  const res = await fetch('./assets-manifest.json', { cache: 'no-store' });

  return res.json();
}

/**
 * The stable-named entries (index.html and friends map to themselves), whose
 * content changes across a redeploy without their URL changing.
 */
function stableAssetUrls(manifest: Record<string, string>): string[] {
  return Object.entries(manifest)
    .filter(([key, value]) => key === value)
    .map(([, value]) => value);
}

/**
 * Re-fetches the given URLs bypassing the HTTP cache and stores them, so a
 * stable-named entry (index.html) reflects the current build rather than a
 * heuristically-cached stale copy. Tolerates per-URL failures.
 */
async function refreshUrls(cache: Cache, urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, { cache: 'reload' });

        if (res.ok) {
          await cache.put(url, res);
        }
      } catch {
        // best-effort; the existing cached copy stays in place
      }
    }),
  );
}

export async function cacheStaticAssets(): Promise<void> {
  const cache = await caches.open(STATIC_CACHE_NAME);

  const manifest = await fetchManifest();

  const critical = criticalUrls(manifest);
  const criticalSet = new Set(critical);

  // Add the best-effort (non-code) assets individually and tolerate failures:
  // `cache.addAll` is atomic, so a single unfetchable asset (a redirect, a
  // prerender-only HTML) would abort caching the entire app shell.
  await cacheUrlsTolerant(
    cache,
    [...new Set(Object.values(manifest))].filter(
      (url) => !criticalSet.has(url),
    ),
  );

  // The code assets are load-bearing — a single dropped lazy chunk makes its
  // feature fail offline — so retry the ones that don't make it, and treat the
  // populate as failed (don't write the sentinel) if any are still missing, so
  // isStaticCacheReady stays false and ensureStaticAssetsCached retries instead
  // of leaving a half-populated cache that reports "ready".
  const missing = await ensureCached(cache, critical);

  if (missing.length > 0) {
    throw new Error(
      `static caching failed: ${missing.length} code assets not cached`,
    );
  }

  // Every code asset is cached — force the stable-named shell to the current
  // build so it doesn't reference chunks from a heuristically-cached older copy.
  await refreshUrls(cache, stableAssetUrls(manifest));

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
 * - If offline content exists → add/refresh the current assets, repair any gaps
 *   left by a previous incomplete populate, and prune superseded ones.
 */
export async function syncStaticCache(): Promise<void> {
  if (!(await hasAnyOfflineContent())) {
    await clearStaticCache();

    return;
  }

  if (!navigator.onLine) {
    return;
  }

  // One-time heal: a build before CACHE_VERSION could have left an inconsistent
  // mixed-build cache. Drop it once (only when we're online and can rebuild) so
  // the clean resync below repopulates it, and record the version so this never
  // runs again. Offline content (maps, tiles) lives in other stores and is
  // untouched.
  if ((await get<number>(CACHE_VERSION_KEY)) !== CACHE_VERSION) {
    await clearStaticCache();

    await set(CACHE_VERSION_KEY, CACHE_VERSION);
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

  // Unchanged manifest → the current snapshot is already complete (the sentinel
  // is only written after a verified-complete populate), so there's nothing to
  // do.
  if (allMatch) {
    return;
  }

  const cache = await caches.open(STATIC_CACHE_NAME);

  const critical = criticalUrls(newManifest);
  const criticalSet = new Set(critical);

  // Add newly-appearing best-effort (non-code) assets, leaving the old snapshot
  // otherwise untouched so a failed sync keeps the previous shell serviceable.
  await cacheUrlsTolerant(
    cache,
    [...newUrls].filter((u) => !oldUrls.has(u) && !criticalSet.has(u)),
  );

  // Fetch (and retry) every new code asset first, while the old shell still
  // points at the old chunks. The stable-named shell must not be advanced until
  // this succeeds — otherwise the served index.html would reference the new
  // main.* / chunks before they're cached, and going offline in that window
  // fails to start ("Problem starting application") or can't reach a lazy
  // feature (e.g. the route planner). On failure we leave the old snapshot fully
  // intact and retry next load.
  const missing = await ensureCached(cache, critical);

  if (missing.length > 0) {
    console.warn(
      `Static cache sync incomplete: ${missing.length} code assets missing; keeping previous snapshot`,
    );

    return;
  }

  // Every new chunk is cached — now advance the stable-named shell (index.html
  // etc.) to the new build it references. Bypass the HTTP cache so we don't
  // re-store a heuristically-cached stale copy.
  await refreshUrls(cache, stableAssetUrls(newManifest));

  // Fully cached and consistent — now safe to prune superseded URLs and commit.
  await Promise.all(
    [...oldUrls].filter((u) => !newUrls.has(u)).map((u) => cache.delete(u)),
  );

  await set(STATIC_MANIFEST_KEY, newManifest);
}
