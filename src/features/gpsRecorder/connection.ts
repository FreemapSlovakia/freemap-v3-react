import { isToolOpen } from '@app/store/selectors.js';
import type { MyStore } from '@app/store/store.js';
import {
  createRecorderConnectionCore,
  type RecorderConnectionCore,
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
  RECORDER_ORIGIN,
  RecorderError,
  type RecorderPoint,
  RecorderStatusSchema,
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
 * The follow flag's key. In `localStorage` rather than in the store, because
 * the question outlives the page — a recording carries on in the phone's own
 * app while the browser is closed, and on the next load nothing else knows
 * there is anything to fetch. Deliberately not in `persistence.ts`: that subset
 * is re-serialized on every action, and this changes when a recording starts or
 * ends.
 */
const KEY = 'fm.gpsRecorder.follow';

/** The store, held so every transition can publish what it changed. */
let store: MyStore | null = null;

/** The decision core; created at attach on a supported platform. */
let core: RecorderConnectionCore | null = null;

/**
 * Column order for the bare rows the stream sends. Set before the stream is
 * ever opened — `/status` names it, and the status frame on connect names it
 * again.
 */
let fields: readonly string[] = [];

/**
 * How a sync ended, and the only thing its handler has to say. Success carries
 * the column order the stream needs to decode its bare rows; failure carries
 * what went wrong, since two causes are worth no retry at all.
 */
export type RecorderSyncOutcome =
  | { fields: readonly string[] }
  | { error: unknown };

/**
 * See the core's `runSync`: coalesces concurrent asks onto one run, restarts
 * for the caller a running sync cannot answer, and binds each run's `settle`
 * to itself so an abandoned run cannot drive the connection.
 */
export function runRecorderSync(
  opts: { quiet: boolean; restart?: boolean },
  start: (
    signal: AbortSignal,
    isQuiet: () => boolean,
    settle: (outcome: RecorderSyncOutcome) => void,
  ) => Promise<void>,
): Promise<void> {
  if (!core) {
    return Promise.resolve();
  }

  const wrapped: SyncStart = (signal, isQuiet, settle) =>
    start(signal, isQuiet, (outcome) => {
      if ('fields' in outcome) {
        // Kept current even for an already-open stream: a resync may have read
        // a newer column order than the one the stream opened with.
        fields = outcome.fields;

        settle({ ok: true });
      } else {
        settle({
          ok: false,
          hopeless:
            outcome.error instanceof RecorderError &&
            (outcome.error.failure === 'lna-denied' ||
              outcome.error.failure === 'outdated'),
        });
      }
    });

  return core.runSync(opts, wrapped);
}

export function reconcileRecorderConnection(): void {
  core?.reconcile();
}

/**
 * Set from the recorder's own answer — recording, or holding points — by
 * `applyStatus`, and cleared when a chain of failed syncs gives up on a
 * recorder nobody is looking at.
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

function parsePoints(data: string): RecorderPoint[] | null {
  let json: unknown;

  try {
    json = JSON.parse(data);
  } catch {
    return null;
  }

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

    readFollowed: () => {
      try {
        return localStorage.getItem(KEY) === 'true';
      } catch {
        return false;
      }
    },

    writeFollowed: (value) => {
      try {
        if (value) {
          localStorage.setItem(KEY, 'true');
        } else {
          localStorage.removeItem(KEY);
        }

        return true;
      } catch {
        // Storage denied (private mode, a blocked origin); the core retries on
        // the next set, and until one takes, following lasts only as long as
        // the page — which is no worse than not trying.
        return false;
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

      // Arrives before any point on every connection, and names the columns as
      // well as the state — so a stream that outlives a `/status` read still
      // decodes the rows that follow it. Also the core's proof that the stream
      // works end to end, and the trigger for the sync that reconciles what
      // the frame announced.
      es.addEventListener('status', (event) => {
        let json: unknown;

        try {
          json = JSON.parse(event.data);
        } catch {
          return;
        }

        const result = RecorderStatusSchema.safeParse(json);

        if (!result.success) {
          return;
        }

        fields = result.data.fields;

        callbacks.onStatusFrame();

        store?.dispatch(gpsRecorderPushedStatus(result.data));
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
