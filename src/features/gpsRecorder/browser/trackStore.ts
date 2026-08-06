import { clear, createStore, entries, get, set, setMany } from 'idb-keyval';
import z from 'zod';
import type { RecorderPoint } from '../protocol.js';
import { type RecorderConfig, RecorderConfigSchema } from '../protocol.js';

/**
 * Where a browser-side recording lives.
 *
 * With the Android recorder the app owns the track and this page is a viewer, so
 * nothing here has to survive anything. Recording in the browser inverts that:
 * this *is* the only copy, and a tab that is reloaded, crashed or evicted
 * mid-ride has to find its ride again — so every fix goes to disk as it arrives
 * rather than at the end.
 *
 * Two databases rather than two stores in one, because `idb-keyval`'s
 * `createStore` opens each database at version 1 and creates exactly the store
 * it was given: a second call naming the same database would find it already at
 * that version, skip the upgrade, and fail on a store that was never created.
 */
const pointStore = createStore('fm-gpsRecorder-points', 'points');

const metaStore = createStore('fm-gpsRecorder-meta', 'kv');

const META_KEY = 'meta';

const MetaSchema = z.object({
  /**
   * The next `seq` to hand out. Never restarts, not even after a delete — a
   * cursor held by anything must never be served different points under ids it
   * already believes it has, which is exactly why `generation` exists.
   */
  nextSeq: z.number().int().nonnegative(),
  /** The segment ordinal in force; bumped on each start and after a starved watch. */
  seg: z.number().int().nonnegative(),
  /** How many times the track has been thrown away. */
  generation: z.number().int().nonnegative(),
  /**
   * Whether a recording is running. Persisted so a reloaded tab resumes the ride
   * it was in the middle of instead of quietly abandoning it.
   */
  recording: z.boolean(),
  /** The sampling config the running recording was started with. */
  config: RecorderConfigSchema,
});

export type BrowserRecorderMeta = z.infer<typeof MetaSchema>;

const PointSchema = z.object({
  seq: z.number(),
  ts: z.number(),
  lat: z.number(),
  lon: z.number(),
  alt: z.number().nullable(),
  altMsl: z.number().nullable(),
  acc: z.number().nullable(),
  spd: z.number().nullable(),
  brg: z.number().nullable(),
  sat: z.number().nullable(),
  seg: z.number(),
});

export function initialBrowserMeta(
  config: RecorderConfig,
): BrowserRecorderMeta {
  return { nextSeq: 1, seg: 0, generation: 0, recording: false, config };
}

/**
 * The whole stored track, ordered by `seq`.
 *
 * Validated per point and per record, so one unreadable entry — written by an
 * older build, or half-written by a tab that died mid-flush — costs that fix
 * rather than the ride.
 */
export async function loadBrowserTrack(
  fallbackConfig: RecorderConfig,
): Promise<{ meta: BrowserRecorderMeta; points: RecorderPoint[] }> {
  const [rawMeta, rawPoints] = await Promise.all([
    get(META_KEY, metaStore),
    entries(pointStore),
  ]);

  const parsedMeta = MetaSchema.safeParse(rawMeta);

  const points: RecorderPoint[] = [];

  for (const [, value] of rawPoints) {
    const parsed = PointSchema.safeParse(value);

    if (parsed.success) {
      points.push(parsed.data);
    }
  }

  points.sort((a, b) => a.seq - b.seq);

  const last = points.at(-1);

  const base = parsedMeta.success
    ? parsedMeta.data
    : // A meta that would not read back leaves the points unlabelled, so
      // everything it carried starts over — except the seq floor below, which is
      // what keeps an id from being handed out twice.
      { ...initialBrowserMeta(fallbackConfig), seg: last?.seg ?? 0 };

  // Applied whether or not the meta parsed, because the meta being *stale* is
  // the ordinary case: `appendBrowserPoints` writes the points first, so a tab
  // that died between the two writes leaves fixes on disk above the `nextSeq`
  // that was recorded for them. Trusting that `nextSeq` would reissue live ids —
  // overwriting the stored points, and having `mergePoints` drop the new fixes
  // as ones it already holds.
  const meta = {
    ...base,
    nextSeq: Math.max(base.nextSeq, (last?.seq ?? 0) + 1),
  };

  return { meta, points };
}

export async function saveBrowserMeta(
  meta: BrowserRecorderMeta,
): Promise<void> {
  await set(META_KEY, meta, metaStore);
}

/**
 * Appends fixes and records the meta they advanced, in that order: a crash
 * between the two leaves points above `nextSeq`, which {@link loadBrowserTrack}
 * recovers from, while the other order would hand out an id twice.
 *
 * The meta is written **even when the points could not be**, and the asymmetry
 * is the whole reason: a `nextSeq` ahead of what is stored only leaves gaps,
 * while a `recording: true` that never got written outlives the recording it
 * describes and has the next load resume a ride that was stopped. Both failures
 * still reach the caller.
 */
export async function appendBrowserPoints(
  points: readonly RecorderPoint[],
  meta: BrowserRecorderMeta,
): Promise<void> {
  let pointsError: unknown;

  if (points.length > 0) {
    try {
      await setMany(
        points.map((point) => [point.seq, point] as [number, RecorderPoint]),
        pointStore,
      );
    } catch (err) {
      pointsError = err;
    }
  }

  await saveBrowserMeta(meta);

  if (pointsError !== undefined) {
    throw pointsError;
  }
}

/** Discards every stored fix. The meta is the caller's to advance and save. */
export async function clearBrowserPoints(): Promise<void> {
  await clear(pointStore);
}
