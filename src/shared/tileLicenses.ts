import { useSyncExternalStore } from 'react';
import z from 'zod';

const LicenseSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
});

// Several per code: one dataset key can cover ground held under more than one
// licence — `shading:be` is Wallonia's and Flanders', each with its own terms.
export const LicenseDictSchema = z.record(z.string(), z.array(LicenseSchema));

/** What each dataset code stands for, as the server that drew it names it. */
export type LicenseDict = z.infer<typeof LicenseDictSchema>;

const RETRY_MS = 30_000;

/**
 * A server's code dictionary, fetched once per session. It is served with
 * `Cache-Control: no-cache`, so the browser revalidates it for us and a dataset
 * added since the last visit is never resolved from a stale copy.
 */
function licenseStore(url: string, storageKey: string) {
  /**
   * The last dictionary seen, so a map browsed offline still credits its
   * terrain. Every code would otherwise go unresolved exactly when nothing can
   * be asked.
   */
  function remembered(): LicenseDict | null {
    try {
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        return null;
      }

      const parsed = LicenseDictSchema.safeParse(JSON.parse(stored));

      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  let dict: LicenseDict | null = remembered();

  let loading: Promise<LicenseDict | null> | null = null;

  /** Not before this: a tile draw asks, so a failure must not ask once per tile. */
  let retryAt = 0;

  const listeners = new Set<() => void>();

  function load(): Promise<LicenseDict | null> {
    if (!loading && Date.now() < retryAt) {
      return Promise.resolve(dict);
    }

    loading ??= fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const parsed = LicenseDictSchema.safeParse(body);

        if (!parsed.success) {
          // A refusal or a malformed answer is no more final than a dropped
          // connection; both let a later call ask again, once the wait is up.
          loading = null;

          retryAt = Date.now() + RETRY_MS;

          return dict;
        }

        dict = parsed.data;

        try {
          localStorage.setItem(storageKey, JSON.stringify(dict));
        } catch {
          // private window, or no room; the fetch answers this session anyway
        }

        for (const listener of listeners) {
          listener();
        }

        return dict;
      })
      .catch(() => {
        // Not cached as the answer: a download started later in the session
        // would otherwise inherit one offline moment and store no dictionary.
        loading = null;

        retryAt = Date.now() + RETRY_MS;

        return dict;
      });

    return loading;
  }

  function subscribe(listener: () => void): () => void {
    void load();

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function useLicenses(): LicenseDict | null {
    return useSyncExternalStore(
      subscribe,
      () => dict,
      () => null,
    );
  }

  return { load, useLicenses };
}

const renderer = licenseStore(
  `${process.env['FM_MAPSERVER_URL']}/licenses`,
  'fm.tileLicenses',
);

const terrain = licenseStore(
  `${process.env['FM_TERRAIN_TILES_URL']}/licenses`,
  'fm.terrainLicenses',
);

/** The outdoor renderer's dictionary. */
export const loadTileLicenses = renderer.load;

export const useTileLicenses = renderer.useLicenses;

/** terrain-tiles' dictionary, for the shading layers. */
export const loadTerrainLicenses = terrain.load;

export const useTerrainLicenses = terrain.useLicenses;

/** Just the entries the given codes name, to travel with an offline map. */
export function licenseSubset(
  licenses: LicenseDict | null,
  codes: Iterable<string>,
): LicenseDict | undefined {
  if (!licenses) {
    return undefined;
  }

  const subset: LicenseDict = {};

  for (const code of codes) {
    const license = licenses[code];

    if (license) {
      subset[code] = license;
    }
  }

  return subset;
}
