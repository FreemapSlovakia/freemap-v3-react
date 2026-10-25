import { positionCount } from '@shared/geoutils.js';
import type { Feature } from 'geojson';
import { createStore, delMany, get, set, update } from 'idb-keyval';
import z from 'zod';
import { GeoJSONFeatureCollectionSchema } from 'zod-geojson';

/**
 * Snapshots of the loaded data, one per version a history entry has shown, so a
 * reload puts back what was on screen and Back/Forward step through the edits.
 * A history entry names its snapshot by key (`history.state.tr`).
 *
 * Its own database, so purging it never takes the my-maps working copy with it.
 */
const store = createStore('fm-trackViewer', 'kv');

/** Where the single record of the previous design lives; read for `tr: true`. */
const LEGACY_KEY = 'track';

const INDEX_KEY = 'index';

const SNAPSHOT_PREFIX = 's:';

// Oldest snapshots go first past either bound; the one just written never goes.
const MAX_SNAPSHOTS = 100;

const MAX_TOTAL_CHARS = 50_000_000;

/**
 * Past this many vertices one snapshot stands for every version: hashing and
 * copying all of it on every edit stalls the page and evicts the snapshots
 * other entries name. Its edits are then not history steps of their own.
 */
const LARGE_POSITIONS = 50_000;

const LATEST_PREFIX = 'latest';

/**
 * The key large data shares across its versions: this page's own, or that of
 * the large snapshot it put back, so a reload writes on instead of copying.
 */
let latestKey = `${LATEST_PREFIX}-${Math.random().toString(36).slice(2, 10)}`;

/** Has this page write its large data on under a large snapshot just put back. */
export function continueSnapshot(key: string): void {
  if (key.startsWith(LATEST_PREFIX)) {
    latestKey = key;
  }
}

/** Its JSON length, near enough: ~40 chars a vertex, ~15 more per channel. */
function estimatedSize(geojson: object): number {
  const { features } = geojson as { features?: Feature[] };

  let size = 0;

  for (const { geometry, properties } of features ?? []) {
    const channels = properties?.['coordinateProperties'];

    size +=
      positionCount(geometry) *
      (40 +
        15 *
          (channels && typeof channels === 'object'
            ? Object.keys(channels).length
            : 0));
  }

  return size;
}

function isLarge(geojson: object): boolean {
  const { features } = geojson as { features?: Feature[] };

  let count = 0;

  for (const { geometry } of features ?? []) {
    count += positionCount(geometry);

    if (count > LARGE_POSITIONS) {
      return true;
    }
  }

  return false;
}

const RecordSchema = z.object({
  /** When the snapshot was stored, for nothing but diagnosis. */
  savedAt: z.number(),
  geojson: GeoJSONFeatureCollectionSchema,
});

export type StoredTrack = z.infer<typeof RecordSchema>;

type IndexEntry = { key: string; size: number; savedAt: number };

const keyCache = new WeakMap<object, string>();

const textCache = new WeakMap<object, string>();

function serialized(geojson: object): string {
  let text = textCache.get(geojson);

  if (text === undefined) {
    text = JSON.stringify(geojson);

    textCache.set(geojson, text);
  }

  return text;
}

// cyrb53: a fast 53-bit string hash. Collisions only cost a wrong restore.
function hash53(text: string): string {
  let h1 = 0xdeadbeef;

  let h2 = 0x41c6ce57;

  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);

    h1 = Math.imul(h1 ^ ch, 2654435761);

    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);

  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);

  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);

  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/**
 * The key naming this version of the data, by content, so the same data always
 * names the same snapshot — or, for large data, the one key all its versions
 * share. Cached per object: the URL asks on every action.
 */
export function snapshotKey(geojson: object): string {
  let key = keyCache.get(geojson);

  if (key === undefined) {
    key = isLarge(geojson) ? latestKey : hash53(serialized(geojson));

    keyCache.set(geojson, key);
  }

  return key;
}

/**
 * Makes `geojson` answer to `key` — for data read back from a snapshot, whose
 * parse may not reproduce the stored text exactly, so the entry that asked for
 * it isn't taken for a new version.
 */
function adoptKey(geojson: object, key: string) {
  keyCache.set(geojson, key);
}

/**
 * Stores the data as a snapshot a history entry can name; the browser may still
 * evict it. Throws when it would not read back, as the read validates and
 * discards whatever fails.
 */
export async function storeSnapshot(geojson: object): Promise<string> {
  const key = snapshotKey(geojson);

  // Written even when this page wrote it before: another tab may have evicted
  // it since, and the write moves it to the newest end of the index.
  const record = { savedAt: Date.now(), geojson };

  const parsed = RecordSchema.safeParse(record);

  if (!parsed.success) {
    throw new Error(
      `the data would not read back: ${parsed.error.issues[0]?.message ?? 'invalid'}`,
    );
  }

  await set(SNAPSHOT_PREFIX + key, record, store);

  // Large data is not serialized only to be measured. Estimated rather than
  // fixed, so the bound evicts the records past pages left behind.
  const size = key.startsWith(LATEST_PREFIX)
    ? estimatedSize(geojson)
    : serialized(geojson).length;

  const evicted: string[] = [];

  await update<IndexEntry[]>(
    INDEX_KEY,
    (index = []) => {
      const kept = [
        ...index.filter((entry) => entry.key !== key),
        { key, size, savedAt: record.savedAt },
      ];

      let total = kept.reduce((sum, entry) => sum + entry.size, 0);

      while (
        kept.length > 1 &&
        (kept.length > MAX_SNAPSHOTS || total > MAX_TOTAL_CHARS)
      ) {
        const [oldest] = kept.splice(0, 1);

        total -= oldest!.size;

        evicted.push(oldest!.key);
      }

      return kept;
    },
    store,
  );

  if (evicted.length) {
    await delMany(
      evicted.map((k) => SNAPSHOT_PREFIX + k),
      store,
    );
  }

  return key;
}

/**
 * Asks the browser to keep this origin's storage rather than reclaim it under
 * pressure, and reports whether it will.
 *
 * Deliberately *not* on the ordinary path. Chrome decides silently, but Firefox
 * asks the user — and prompting for a permission because somebody opened a GPX
 * file would be asking about a hazard they don't have: the file is still on their
 * disk. Only {@link storeTrackDurably} requests it, for the one case where the
 * answer decides whether another copy gets deleted.
 */
async function requestPersistence(): Promise<boolean> {
  try {
    return (
      (await navigator.storage?.persisted()) ||
      (await navigator.storage?.persist()) ||
      false
    );
  } catch {
    // No Storage API, or a browser that refuses to answer; either way nothing
    // has been promised.
    return false;
  }
}

/**
 * What became of a store the caller is about to act on.
 *
 * - `durable` — written, and the browser has promised to keep it.
 * - `evictable` — written, but the browser may reclaim it under storage pressure.
 * - `unreadable` — not written: it would not have read back.
 */
export type StoreOutcome = 'durable' | 'evictable' | 'unreadable';

/**
 * Stores the data and says exactly how well, for the caller that is about to
 * delete another copy — the GPS recorder finishing a ride. Anything but `durable`
 * is its cue to leave the other copy where it is.
 */
export async function storeTrackDurably(
  geojson: object,
): Promise<StoreOutcome> {
  const persisted = await requestPersistence();

  try {
    await storeSnapshot(geojson);
  } catch (err) {
    console.warn('Refusing to store an unreadable track:', err);

    return 'unreadable';
  }

  return persisted ? 'durable' : 'evictable';
}

/**
 * The snapshot a history entry names, or undefined when there is none — evicted,
 * cleared with the site's data, or written by a build whose records no longer
 * validate. `true` is the flag of the previous single-record design.
 */
export async function getSnapshot(
  key: string | true,
): Promise<StoredTrack | undefined> {
  const raw = await get(
    key === true ? LEGACY_KEY : SNAPSHOT_PREFIX + key,
    store,
  );

  if (raw === undefined) {
    return undefined;
  }

  const parsed = RecordSchema.safeParse(raw);

  if (!parsed.success) {
    console.warn('Discarding unreadable stored track:', parsed.error);

    return undefined;
  }

  if (key !== true) {
    adoptKey(parsed.data.geojson, key);
  }

  return parsed.data;
}
