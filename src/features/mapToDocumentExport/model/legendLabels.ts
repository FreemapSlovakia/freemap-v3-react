import {
  LegendCatalogueSchema,
  legendTagsName,
  strippedName,
} from '@features/legend/legendCatalogue.js';
import { loadLegendMessages } from '@features/legend/translations/useLegendMessages.js';
import { getOsmMapping } from '@osm/osmNameResolver.js';

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

/** The renderer's limits; over any of them it refuses the whole export. */
const MAX_LABEL_BYTES = 200;
const MAX_ITEMS = 4000;
const MAX_CATEGORIES = 64;

/** An item can stand for dozens of tag sets; the panel names the first few. */
const MAX_NAMES = 3;

/** So a renderer deploy's new items get labels within a long-lived session. */
const CACHE_TTL_MS = 3_600_000;

const cache = new Map<
  string,
  { at: number; labels: Promise<Record<string, string>> }
>();

const encoder = new TextEncoder();

const fits = (label: string) => encoder.encode(label).length <= MAX_LABEL_BYTES;

/** `label`, cut with an ellipsis to what the renderer accepts. */
export function truncatedLabel(label: string): string {
  if (fits(label)) {
    return label;
  }

  const chars = [...label];

  while (chars.length && !fits(`${chars.join('')}…`)) {
    chars.pop();
  }

  return `${chars.join('').trimEnd()}…`;
}

export type LegendLabels = {
  categories: Record<string, string>;
  items: Record<string, string>;
};

/**
 * Section headings and a label for every item of the outdoor map's legend, in
 * `lang`. The renderer lists only the items it drew, which the client cannot
 * know, so it gets them all.
 */
export async function legendLabels(
  lang: string,
  signal: AbortSignal,
): Promise<LegendLabels> {
  let entry = cache.get(lang);

  if (!entry || Date.now() - entry.at > CACHE_TTL_MS) {
    const created = { at: Date.now(), labels: loadItemLabels(lang) };

    created.labels.catch(() => {
      if (cache.get(lang) === created) {
        cache.delete(lang);
      }
    });

    cache.set(lang, created);

    entry = created;
  }

  const [items, messages] = await abortable(
    Promise.all([entry.labels, loadLegendMessages(lang)]),
    signal,
  );

  return {
    categories: Object.fromEntries(
      Object.entries(messages.default.outdoorMap)
        .slice(0, MAX_CATEGORIES)
        .map(([key, heading]) => [key, truncatedLabel(heading)]),
    ),
    items,
  };
}

/** Rejects on abort without cancelling `promise`, which the cache shares. */
function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();

  const { promise: aborted, reject } = Promise.withResolvers<never>();

  const onAbort = () => reject(signal.reason);

  signal.addEventListener('abort', onAbort, { once: true });

  return Promise.race([promise, aborted]).finally(() =>
    signal.removeEventListener('abort', onAbort),
  );
}

async function loadItemLabels(lang: string): Promise<Record<string, string>> {
  const [res, osmMapping] = await Promise.all([
    // bounded, so a hung request doesn't stay in the cache
    fetch(`${fmMapserverUrl}/legend`, { signal: AbortSignal.timeout(30_000) }),
    getOsmMapping(lang),
  ]);

  if (!res.ok) {
    throw new Error(`Unexpected HTTP response ${res.status}`);
  }

  const labels: Record<string, string> = {};

  const catalogue = LegendCatalogueSchema.parse(await res.json());

  for (const { id, tags } of catalogue.slice(0, MAX_ITEMS)) {
    const names = [
      ...new Set(tags.map((t) => strippedName(legendTagsName(t, osmMapping)))),
    ]
      .filter(Boolean)
      .slice(0, MAX_NAMES);

    while (names.length > 1 && !fits(names.join(', '))) {
      names.pop();
    }

    // Unnamed in this language, it is still drawn, so its tags stand in.
    const label = names.length
      ? names.join(', ')
      : Object.entries(tags[0] ?? {})
          .map(([k, v]) => `${k}=${v}`)
          .join(', ');

    if (label) {
      labels[id] = truncatedLabel(label);
    }
  }

  return labels;
}
