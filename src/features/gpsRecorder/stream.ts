import type { Dispatch } from 'redux';
import {
  type GpsRecorderConnection,
  gpsRecorderAddPoints,
  gpsRecorderPushedStatus,
  gpsRecorderSetConnection,
  gpsRecorderSync,
} from './model/actions.js';
import {
  decodePoints,
  RECORDER_ORIGIN,
  type RecorderPoint,
  RecorderStatusSchema,
  streamPayloadToRows,
} from './protocol.js';

let source: EventSource | null = null;

/**
 * Bumped whenever the stream is deliberately closed, so work that started before
 * that can tell it has been superseded. Without it, a sync whose fetches were
 * still in flight when the tool closed would open a stream nothing is left to
 * close — and `scheduleRevive` would keep it alive indefinitely.
 */
let generation = 0;

export function recorderStreamGeneration(): number {
  return generation;
}

/**
 * Column order for the bare rows the stream sends. Set before the stream is ever
 * opened — `/status` names it, and the status frame on connect names it again.
 */
let fields: readonly string[] = [];

/**
 * Set when the page goes away with a stream attached, and cleared only when that
 * stream goes — replaced on the way back in, or dropped by the browser giving up
 * on it.
 *
 * A page that was hidden — the phone's screen off, or another tab in front — comes
 * back to an `EventSource` the browser still reports as `OPEN` while nothing
 * arrives on it. Loopback delivers no reset for the browser to notice, so it goes
 * on believing in the socket for tens of seconds, and the reconnect it eventually
 * makes replays every fix above its last event id in one burst — a screenful of
 * dispatches that locks the page up for a moment. In between, the live view is
 * frozen while reading as `live`.
 *
 * None of that is worth waiting for, because the sync that runs on the way back in
 * has refetched the track over `/track?since=` anyway. So a stream that spanned a
 * hidden page is dropped and reopened rather than trusted: a fresh `EventSource`
 * carries no `Last-Event-ID`, so it replays nothing, and its own status frame
 * covers whatever arrived between the catch-up and the connect.
 */
let suspect = false;

/**
 * Marks the attached stream as not to be believed — see {@link suspect}. Called
 * when the page is hidden, which is the last thing that happens before it may be
 * frozen.
 */
export function suspectRecorderStream(): void {
  suspect = source !== null;
}

export function isRecorderStreamSuspect(): boolean {
  return suspect;
}

/**
 * Backoff for reviving a stream the browser gave up on. `EventSource` retries
 * by itself while it still believes in the connection, so this covers only the
 * `CLOSED` case — a recorder that went away, typically because Android killed
 * it or it was swiped off the task list. That comes back on its own often
 * enough to be worth waiting for, and rarely enough that hammering loopback
 * would be pointless.
 */
const REVIVE_DELAYS = [1000, 2000, 5000, 10_000, 30_000];

let reviveAttempt = 0;

let reviveTimer: ReturnType<typeof setTimeout> | null = null;

function cancelRevive(): void {
  if (reviveTimer !== null) {
    clearTimeout(reviveTimer);

    reviveTimer = null;
  }
}

/**
 * Re-runs the whole sync rather than just reopening the socket: whatever killed
 * the stream may equally have stopped the recording or cleared the track, and
 * the catch-up is what notices.
 */
function scheduleRevive(dispatch: Dispatch): void {
  if (reviveTimer !== null) {
    return;
  }

  const delay = REVIVE_DELAYS[reviveAttempt] ?? REVIVE_DELAYS.at(-1)!;

  reviveAttempt++;

  reviveTimer = setTimeout(() => {
    reviveTimer = null;

    dispatch(gpsRecorderSync());
  }, delay);
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
 * Attaches the live view. Idempotent — a stream that is already open is left
 * alone, so a resync does not drop and re-establish it. The exception is a
 * {@link suspect} one, which is what a stream that spanned a hidden page is: once
 * the page is visible again it is replaced, because "already open" is precisely
 * what such a stream lies about.
 *
 * `EventSource` cannot pass `targetAddressSpace`, so this only works once the
 * Local Network Access permission has been granted by an earlier gestured
 * fetch. That is why the start flow calls `/status` first.
 */
export function openRecorderStream(
  dispatch: Dispatch,
  pointFields: readonly string[],
  /** The generation the caller started under; a stale one opens nothing. */
  since = generation,
): void {
  if (since !== generation) {
    return;
  }

  // Kept current even for an already-open stream: a resync may have read a newer
  // column order than the one this stream opened with.
  fields = pointFields;

  cancelRevive();

  const hidden = document.visibilityState !== 'visible';

  // A stream that spanned a hidden page is replaced rather than reused, whatever
  // the browser claims its readyState is — see `suspect`. Only once the page is
  // back, though: a replacement opened while still hidden is born suspect itself,
  // and the status frame it opens with comes straight back here asking for
  // another one.
  if (source && suspect && !hidden) {
    source.close();

    source = null;
  }

  // A stream opened while the page is already hidden — a sync that was still in
  // flight when the page went away — has spanned exactly what makes one suspect,
  // so it is born that way and gets replaced on the way back in like any other.
  suspect = hidden;

  if (source) {
    // A sync that ran while the stream was attached has already moved the
    // connection to `connecting`/`syncing`, and `onopen` won't fire again for a
    // socket that never closed — so the live state is restored from here.
    dispatch(gpsRecorderSetConnection(streamState()));

    return;
  }

  const es = new EventSource(`${RECORDER_ORIGIN}/stream`);

  source = es;

  es.onopen = () => {
    reviveAttempt = 0;

    dispatch(gpsRecorderSetConnection('live'));
  };

  es.onmessage = (event) => {
    const points = parsePoints(event.data);

    if (points) {
      dispatch(gpsRecorderAddPoints(points));
    }
  };

  // Arrives before any point on every connection, and names the columns as well
  // as the state — so a stream that outlives a `/status` read still decodes the
  // rows that follow it.
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

    dispatch(gpsRecorderPushedStatus(result.data));
  });

  es.onerror = () => {
    dispatch(gpsRecorderSetConnection('reconnecting'));

    // While the browser is still retrying (including the Last-Event-ID replay)
    // the stream is only reported as interrupted — reconnecting is its job, not
    // ours. Once it has given up, the handle goes and the sync is retried on a
    // widening backoff, so the live view comes back without being asked.
    if (es.readyState === EventSource.CLOSED) {
      es.close();

      if (source === es) {
        source = null;

        // Nothing is held any more, so there is nothing left to distrust: the
        // revive below is what opens the next stream, and it opens a fresh one
        // either way.
        suspect = false;

        scheduleRevive(dispatch);
      }
    }
  };
}

export function closeRecorderStream(): void {
  generation++;

  cancelRevive();

  reviveAttempt = 0;

  suspect = false;

  source?.close();

  source = null;
}

/**
 * Whether the live view can be relied on to keep arriving. A suspect stream
 * counts as no stream: it is about to be replaced, and until it is, nothing is
 * coming through it.
 */
export function isRecorderStreamUsable(): boolean {
  return source !== null && !suspect;
}

/** What the attached stream, if any, is currently doing. */
function streamState(): GpsRecorderConnection {
  return source === null
    ? 'idle'
    : suspect || source.readyState !== EventSource.OPEN
      ? 'reconnecting'
      : 'live';
}

/**
 * Says what the stream is doing, for a caller that has just finished something
 * else and must not leave the connection reading as busy. A failed catch-up says
 * nothing about the stream, and `syncing` left behind would spin forever — and
 * keep the transport disabled with it.
 */
export function reportRecorderStreamState(dispatch: Dispatch): void {
  dispatch(gpsRecorderSetConnection(streamState()));
}
