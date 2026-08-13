import { isToolOpen } from '@app/store/selectors.js';
import type { MyStore } from '@app/store/store.js';
import storage from 'local-storage-fallback';
import {
  createRecorderConnectionCore,
  type RecorderConnectionCore,
  type SyncOutcome,
  type SyncStart,
} from './connectionCore.js';
import {
  gpsRecorderAddPoints,
  gpsRecorderPushedStatus,
  gpsRecorderSetConnection,
  gpsRecorderSync,
} from './model/actions.js';
import { startRecorderSpan, watchRecorderFrame } from './perfProbe.js';
import {
  decodePoints,
  parseFrameJson,
  parseStatusFrame,
  RECORDER_ORIGIN,
  type RecorderPoint,
  type RecorderStatus,
  streamPayloadToRows,
} from './protocol.js';
import { gpsRecorderPlatformSupported } from './support.js';

/**
 * The live view of the recorder: the `/stream` connection, the sync that feeds
 * it, and the retries when either goes.
 *
 * **One owner, reconciling a desired state.** Everything that could change the
 * answer — the page coming and going, the tool opening, a stream that broke, a
 * sync that failed — goes through the decision core in `connectionCore.ts`,
 * which compares what should be connected against what is and fixes the
 * difference. This file is only the shell: the real `EventSource`, storage,
 * store and point batching, injected into the core so its rules stay testable
 * without a phone.
 *
 * **Hidden means disconnected.** A page that is hidden may be frozen the next
 * moment, and an `EventSource` frozen with it comes back reporting `OPEN` while
 * nothing arrives on it — loopback delivers no reset for the browser to notice,
 * so it believes in the socket for tens of seconds, then replays every fix above
 * its last event id in one burst. Rather than keep such a stream and distrust
 * it, going away closes it and the run in flight with it. Nothing is lost: the
 * recorder owns the track, and coming back catches up over `/track?since=`.
 */

/**
 * The follow flag's key. In storage rather than in the store, because the
 * question outlives the page — a recording carries on in the phone's own app
 * while the browser is closed, and on the next load nothing else knows there is
 * anything to fetch. Deliberately not in `persistence.ts`: that subset is
 * re-serialized on every action, and this changes when a recording starts or
 * ends.
 */
const KEY = 'fm.gpsRecorder.follow';

/** The store, held so every transition can publish what it changed. */
let store: MyStore | null = null;

/** The decision core; created at attach on a supported platform. */
let core: RecorderConnectionCore | null = null;

/**
 * Column order for the bare rows the stream sends, owned by the stream that
 * decodes them: a `status` frame arrives before any point on every connection,
 * so the order is always known by the first row, and no sync can install a
 * stale one over the live stream's own.
 */
let fields: readonly string[] = [];

/**
 * Fills the column order in from a status a sync read, for as long as no stream
 * has named one. The stream stays the owner — this never overwrites an order a
 * live stream installed — but a first connect frame this app cannot read would
 * otherwise leave every row undecodable with nothing arriving to repair it.
 */
export function seedRecorderFields(next: readonly string[]): void {
  if (fields.length === 0) {
    fields = next;
  }
}

/**
 * See the core's `runSync`: coalesces concurrent asks onto one run, restarts
 * for the caller a running sync cannot answer, and binds each run's `settle`
 * to itself so an abandoned run cannot drive the connection.
 */
export function runRecorderSync(
  opts: { quiet: boolean; restart?: boolean },
  start: SyncStart,
): Promise<SyncOutcome | null> {
  return core ? core.runSync(opts, start) : Promise.resolve(null);
}

export function reconcileRecorderConnection(): void {
  core?.reconcile();
}

/**
 * Set from the recorder's own answer — recording, or holding points — by
 * `applyStatus`, and cleared when a recorder nobody is looking at stops
 * answering for good.
 */
export function setRecorderFollowed(value: boolean): void {
  core?.setFollowed(value);
}

export function whileCatchingUp<T>(fetch: () => Promise<T>): Promise<T> {
  return core ? core.whileCatchingUp(fetch) : fetch();
}

/**
 * Points arrive an event at a time, and each dispatch costs a pass over the whole
 * track: the merge, the segment split, the polyline Leaflet reprojects and the
 * statistics fold. One a second is nothing. A burst of them — a recorder that had
 * been buffering, or a phone whose screen has just come back on — is the same work
 * repeated per fix, which is the stall the user sees as a frozen map. Whatever
 * arrives together is therefore dispatched together.
 */
const BATCH_MS = 250;

let batch: RecorderPoint[] = [];

let batchTimer: ReturnType<typeof setTimeout> | null = null;

function queuePoints(points: RecorderPoint[]): void {
  batch.push(...points);

  if (batchTimer === null) {
    batchTimer = setTimeout(() => {
      batchTimer = null;

      const flushed = batch;

      batch = [];

      // The merge and every subscriber that runs inside the dispatch; the frame
      // probe then covers what it scheduled — the React render, and the polyline
      // Leaflet reprojects and redraws.
      const dispatched = startRecorderSpan('points-dispatch');

      store?.dispatch(gpsRecorderAddPoints(flushed));

      dispatched(flushed.length);

      watchRecorderFrame('points-frame', flushed.length);
    }, BATCH_MS);
  }
}

/**
 * Drops what has not been dispatched yet. Nothing is lost: the points were never
 * merged, so the cursor does not claim them and the next sync fetches them again.
 *
 * Exported for the one case where it is not merely an optimisation: a track that
 * has just been discarded. The queue belongs to the track that is going, and
 * flushing it afterwards would put deleted fixes back on the map.
 */
export function discardQueuedRecorderPoints(): void {
  if (batchTimer !== null) {
    clearTimeout(batchTimer);

    batchTimer = null;
  }

  batch = [];
}

/**
 * Whether a status frame says anything the status already held here does not.
 *
 * Everything is compared but the two the stream delivers by itself: `count` and
 * `lastSeq` move on with every fix, and a doorbell rung for those would re-read
 * `/status` — and abandon whatever catch-up is downloading — for news already on
 * its way over the stream. Compared as text rather than field by field, because
 * a field forgotten here swallows a doorbell, while a field order that differs
 * only rings one that had nothing to say.
 */
function saysSomethingNew(status: RecorderStatus): boolean {
  const held = store?.getState().gpsRecorder.status;

  if (!held) {
    return true;
  }

  const strip = ({ count, lastSeq, ...rest }: RecorderStatus) => rest;

  return JSON.stringify(strip(held)) !== JSON.stringify(strip(status));
}

function parsePoints(data: string): RecorderPoint[] | null {
  const json = parseFrameJson(data);

  // A row, or a batch of them; anything else is not a point event.
  if (!Array.isArray(json)) {
    return null;
  }

  return decodePoints(fields, streamPayloadToRows(json));
}

/**
 * Installed at boot, beside the app's other attach helpers.
 *
 * The connection is deliberately not the toolbar's: a recording carries on
 * whichever toolbar the user has open, and on the phone even while the browser
 * is closed, so neither closing the tool nor a reload says anything about
 * whether there is still something to follow.
 */
export function attachRecorderConnection(newStore: MyStore): void {
  store = newStore;

  if (!gpsRecorderPlatformSupported) {
    return;
  }

  core = createRecorderConnectionCore({
    isVisible: () => document.visibilityState === 'visible',

    isToolOpen: () =>
      store !== null && isToolOpen(store.getState(), 'gps-recorder'),

    readFollowed: () => storage.getItem(KEY) === 'true',

    writeFollowed: (value) => {
      if (value) {
        storage.setItem(KEY, 'true');
      } else {
        storage.removeItem(KEY);
      }
    },

    openStream: (callbacks) => {
      // `EventSource` cannot pass `targetAddressSpace`, so this only works once
      // the Local Network Access permission has been granted by an earlier
      // gestured fetch. That is why the start flow calls `/status` first.
      const es = new EventSource(`${RECORDER_ORIGIN}/stream`);

      es.onopen = callbacks.onOpen;

      es.onerror = callbacks.onError;

      es.onmessage = (event) => {
        const points = parsePoints(event.data);

        if (points) {
          queuePoints(points);
        }
      };

      // Arrives before any point on every connection, and names the state as
      // well as the columns.
      es.addEventListener('status', (event) => {
        // A frame this app cannot read is still the recorder composing and
        // delivering one, so it counts as proof the stream works whatever is
        // made of it below.
        callbacks.onStatusFrame();

        const status = parseStatusFrame(event.data);

        if (status) {
          fields = status.fields;
        }

        // One rule for every frame, the connect one included: ring only for a
        // frame that says something this page does not already know. Ringing
        // re-reads `/status` and restarts whatever run is in flight, so a frame
        // with nothing to say costs a round trip and can abandon a catch-up
        // that would then start over from the beginning — while the connect
        // frame does have something to say whenever the sync that attached this
        // stream spent seconds catching up and the ride ended meanwhile.
        if (status && !saysSomethingNew(status)) {
          return;
        }

        store?.dispatch(gpsRecorderPushedStatus());
      });

      return { close: () => es.close() };
    },

    dispatchSync: (quiet) => {
      store?.dispatch(gpsRecorderSync({ quiet }));
    },

    publish: (state) => {
      store?.dispatch(gpsRecorderSetConnection(state));
    },

    onTeardown: discardQueuedRecorderPoints,
  });

  document.addEventListener('visibilitychange', reconcileRecorderConnection);

  reconcileRecorderConnection();
}
