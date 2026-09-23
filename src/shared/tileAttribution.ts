import type { LeafletEventHandlerFnMap, TileEvent } from 'leaflet';
import { useSyncExternalStore } from 'react';
import {
  type AttributionDef,
  FM_ATTR,
  OSM_DATA_ATTR,
  RENDERER_COUNTRIES,
} from './mapDefinitions.js';
import { type LicenseDict, loadTileLicenses } from './tileLicenses.js';

/** The `Server-Timing` metric the renderer names its dataset codes in. */
const METRIC = 'attr';

/** Tiles whose codes are remembered; a dropped one reads back as unknown. */
const MAX_REMEMBERED = 2048;

const codesByUrl = new Map<string, string[]>();

/** The tiles currently painted, by the element drawing them. */
const painted = new Map<
  Element,
  { url: string; type: string; container: Element | null }
>();

const listeners = new Set<() => void>();

/**
 * Per layer type, the codes of every tile it currently paints — or `null` while
 * any of them is unaccounted for, which is every layer the renderer doesn't
 * serve.
 */
export type TileAttribution = Record<string, string[] | null>;

const EMPTY: TileAttribution = {};

let snapshot: TileAttribution = EMPTY;

/**
 * Whether a tile is on screen at all. Measured rather than computed from its
 * coordinates, which would have to mirror every `tileSize`/`zoomOffset` the
 * hi-DPI and feature-scale paths set.
 */
function onScreen(
  tile: Element,
  container: Element,
  rects: Map<Element, DOMRect>,
): boolean {
  let view = rects.get(container);

  if (!view) {
    view = container.getBoundingClientRect();

    rects.set(container, view);
  }

  const rect = tile.getBoundingClientRect();

  return (
    rect.right > view.left &&
    rect.left < view.right &&
    rect.bottom > view.top &&
    rect.top < view.bottom
  );
}

function compute(): TileAttribution {
  const byType = new Map<string, Set<string> | null>();

  const rects = new Map<Element, DOMRect>();

  for (const [tile, { url, type, container }] of painted) {
    // react-leaflet unbinds the handlers before it removes the layer, so a
    // layer switched off announces none of its removals. Leaflet takes a tile
    // out of the DOM before it says so, which outlives that.
    if (!tile.isConnected) {
      painted.delete(tile);

      continue;
    }

    // Leaflet keeps whole rings of tiles past the viewport after a pan
    // (`keepBuffer`). Skipped rather than dropped: a pan can bring one back
    // with no event of its own to put it there again.
    if (container && !onScreen(tile, container, rects)) {
      continue;
    }

    if (byType.get(type) === null) {
      continue;
    }

    const codes = codesByUrl.get(url);

    if (!codes) {
      byType.set(type, null);

      continue;
    }

    const set = byType.get(type) ?? new Set<string>();

    for (const code of codes) {
      set.add(code);
    }

    byType.set(type, set);
  }

  const next: TileAttribution = {};

  for (const [type, set] of byType) {
    next[type] = set && [...set].sort();
  }

  return next;
}

function same(a: TileAttribution, b: TileAttribution): boolean {
  const keys = Object.keys(a);

  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => {
      const x = a[key];

      const y = b[key];

      return x == null || y == null
        ? x === y
        : x.length === y.length && x.every((code, i) => code === y[i]);
    })
  );
}

let scheduled = false;

function schedule(): void {
  if (scheduled) {
    return;
  }

  scheduled = true;

  queueMicrotask(() => {
    scheduled = false;

    const next = compute();

    if (!same(snapshot, next)) {
      snapshot = next;

      for (const listener of listeners) {
        listener();
      }
    }
  });
}

function remember(url: string, codes: string[]): void {
  codesByUrl.delete(url);

  codesByUrl.set(url, codes);

  if (codesByUrl.size > MAX_REMEMBERED) {
    const oldest = codesByUrl.keys().next();

    if (!oldest.done) {
      codesByUrl.delete(oldest.value);
    }
  }
}

let observing = false;

function observe(): void {
  if (observing || typeof PerformanceObserver === 'undefined') {
    return;
  }

  observing = true;

  // Fetched as soon as a tile is drawn rather than when something asks for the
  // credit: a session that never opened the panel would otherwise persist no
  // dictionary, and have none to fall back on next time it is offline.
  void loadTileLicenses();

  try {
    new PerformanceObserver((list) => {
      let changed = false;

      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        if (entry.initiatorType !== 'img') {
          continue;
        }

        // The metric's presence is what says the codes are known: an empty
        // `desc` is a tile that credits nothing, no metric at all is a tile
        // rendered before the renderer carried attribution.
        const metric = entry.serverTiming?.find(({ name }) => name === METRIC);

        if (metric) {
          // spaced, a comma being what separates one metric from the next
          remember(entry.name, metric.description.split(/\s+/).filter(Boolean));

          changed = true;
        }
      }

      if (changed) {
        schedule();
      }
      // `buffered` so tiles that loaded before the first layer mounted count too
    }).observe({ type: 'resource', buffered: true });
  } catch {
    observing = false;

    return;
  }

  // entries are read as they arrive, so the buffer only has to not grow
  addEventListener('resourcetimingbufferfull', () => {
    performance.clearResourceTimings();
  });
}

// At module scope, not in `observe()`: the worker posts a tile's codes when its
// response resolves, which is before the image loads and so before any
// `tileload` could install this. Undefined inside the worker, where this same
// module is pulled in by the browse cache.
navigator.serviceWorker?.addEventListener('message', ({ data }) => {
  if (
    data?.type === TILE_ATTRIBUTION_MESSAGE &&
    typeof data.url === 'string' &&
    typeof data.codes === 'string'
  ) {
    remember(data.url, splitAttributionHeader(data.codes));

    schedule();
  }
});

// Registering by `addEventListener` leaves the container's message queue
// disabled — only assigning `onmessage` starts it implicitly — so without this
// the worker posts into a queue nothing is taken off.
navigator.serviceWorker?.startMessages();

/**
 * Tiles whose image failed. Leaflet swaps in `errorTileUrl`, which then loads
 * like any other tile and announces itself as one — and that URL carries no
 * codes, so it would blank the whole layer's credit.
 */
const errored = new WeakSet<Element>();

const handlers = new Map<string, LeafletEventHandlerFnMap>();

/**
 * Leaflet handlers keeping a layer's painted tiles counted. Cached per layer
 * type because react-leaflet rebinds whenever the object's identity changes.
 */
export function tileAttributionHandlers(
  type: string,
): LeafletEventHandlerFnMap {
  let cached = handlers.get(type);

  if (!cached) {
    cached = {
      tileload(event) {
        const { tile } = event as TileEvent;

        // a premium placeholder is a `div`, and paints nothing to credit
        if (errored.has(tile) || !(tile instanceof HTMLImageElement)) {
          return;
        }

        // taken now: Leaflet blanks `src` before it announces the removal
        const url = tile.currentSrc || tile.src;

        if (url) {
          observe();

          painted.set(tile, {
            url,
            type,
            container: tile.closest('.leaflet-container'),
          });

          schedule();
        }
      },

      // Tiles that arrived after the view stopped moving, so after the last
      // `moveend` this layer was measured on.
      load() {
        schedule();
      },

      // Announced before the placeholder's own load, so the entry is gone and
      // the element marked by the time that arrives.
      tileerror(event) {
        const { tile } = event as TileEvent;

        errored.add(tile);

        if (painted.delete(tile)) {
          schedule();
        }
      },

      tileunload(event) {
        if (painted.delete((event as TileEvent).tile)) {
          schedule();
        }
      },
    };

    handlers.set(type, cached);
  }

  return cached;
}

/**
 * Recomputes which painted tiles are on screen, for the map to call as it
 * settles: panning back over tiles Leaflet kept loads nothing, so no tile event
 * marks the view that no longer shows them.
 */
export const scheduleTileAttribution = schedule;

function subscribe(listener: () => void): () => void {
  observe();

  // A layer switched off announces no removals — react-leaflet unbinds the
  // handlers first — so its tiles are only pruned the next time this runs.
  schedule();

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useTileAttribution(): TileAttribution {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}

/** The header a tile names its datasets in, for a reader holding the response. */
export const ATTRIBUTION_HEADER = 'X-Attribution';

/**
 * What the service worker posts a tile's codes to the page under. A response it
 * answers with is timing-opaque whatever headers it carries, so the observer
 * never sees the metric for a tile it served.
 */
export const TILE_ATTRIBUTION_MESSAGE = 'fm-tile-attribution';

/**
 * The codes a tile response reports, or `null` if it reports none — present and
 * empty being a tile that credits nothing, which is an answer. Cross-origin the
 * header must be named in `Access-Control-Expose-Headers` to be readable at
 * all, a different gate from the `Timing-Allow-Origin` the observer goes
 * through, and missing it looks exactly like a tile reporting nothing.
 */
export function readTileCodes(headers: Headers): string[] | null {
  const header = headers.get(ATTRIBUTION_HEADER);

  return header === null ? null : splitAttributionHeader(header);
}

/**
 * Commas, which is how the header spells the list wherever it appears — a tile's
 * and an export's alike. The `Server-Timing` metric spaces them instead, a comma
 * there being what separates one metric from the next.
 */
export function splitAttributionHeader(header: string): string[] {
  return header.split(',').filter(Boolean);
}

/** The namespace each one-character code prefix is short for. */
const NAMESPACES: Record<string, string> = {
  s: 'shading',
  c: 'contours',
};

/** The code as `/licenses` keys it, or `null` if it isn't one at all. */
export function expandCode(code: string): string | null {
  if (code === 'o') {
    return 'osm';
  }

  const namespace = NAMESPACES[code[0] ?? ''];

  const key = code.slice(1);

  return namespace && key ? `${namespace}:${key}` : null;
}

/**
 * Codes the app renders in its own words. Only for the ones it says something
 * the renderer's string can't — a translated label, a link into the app — since
 * anywhere else a local copy would just be the dictionary going stale.
 */
const PRESENTED_LOCALLY: Record<string, AttributionDef> = {
  osm: OSM_DATA_ATTR,
};

/** Dataset keys the renderer names by a territory the coverage lists differently. */
const COUNTRY_ALIASES: Record<string, string> = { en: 'gb' };

/**
 * The country a dataset key belongs to, for narrowing the catalogue by what is
 * in view. A key can name a region (`de_by`), so only the part before the
 * underscore is read; a global source is left uncountried and therefore always
 * credited, which is the direction to fail in.
 */
function countryOf(code: string): string | undefined {
  const name = code.split(':')[1]?.split('_')[0];

  const key = name && (COUNTRY_ALIASES[name] ?? name);

  return key && RENDERER_COUNTRIES.has(key) ? key : undefined;
}

/**
 * Every dataset the renderer knows, for crediting a layer whose tiles didn't say
 * which of them they drew.
 */
export function licenseAttributions(licenses: LicenseDict): AttributionDef[] {
  return Object.entries(licenses)
    .filter(([code]) => !PRESENTED_LOCALLY[code])
    .flatMap(([code, entries]) =>
      entries.map(({ title, url }) => ({
        type: 'data' as const,
        name: title,
        url,
        country: countryOf(code),
      })),
    );
}

/**
 * The sources a tile's codes stand for, or `null` if any of them is unresolved:
 * the credit then has to widen back to the layer's whole list rather than
 * silently drop a source. The renderer is what says which sources those are —
 * `licenses` is its dictionary, and without it nothing resolves.
 */
export function resolveTileCodes(
  codes: string[] | null | undefined,
  licenses: LicenseDict | null | undefined,
): AttributionDef[] | null {
  if (!codes || !licenses) {
    return null;
  }

  // Neither has a code of its own: the renderer is ours to credit whatever a
  // tile drew, and the map is an OSM-derived work even where a tile — open sea,
  // an empty quarter — put none of it on screen.
  const resolved: AttributionDef[] = [FM_ATTR, OSM_DATA_ATTR];

  for (const code of codes) {
    const expanded = expandCode(code);

    if (!expanded) {
      return null;
    }

    const local = PRESENTED_LOCALLY[expanded];

    if (local) {
      // `osm` is seeded above, so its code adds nothing
      if (!resolved.includes(local)) {
        resolved.push(local);
      }

      continue;
    }

    const entries = licenses[expanded];

    if (!entries) {
      return null;
    }

    for (const { title, url } of entries) {
      resolved.push({ type: 'data', name: title, url });
    }
  }

  return resolved;
}
