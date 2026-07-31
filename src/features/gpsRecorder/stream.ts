import type { Dispatch } from 'redux';
import {
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
 * alone, so a resync does not drop and re-establish it.
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

  if (source) {
    // A sync that ran while the stream was attached has already moved the
    // connection to `connecting`/`syncing`, and `onopen` won't fire again for a
    // socket that never closed — so the live state is restored from here.
    dispatch(
      gpsRecorderSetConnection(
        source.readyState === EventSource.OPEN ? 'live' : 'reconnecting',
      ),
    );

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

        scheduleRevive(dispatch);
      }
    }
  };
}

export function closeRecorderStream(): void {
  generation++;

  cancelRevive();

  reviveAttempt = 0;

  source?.close();

  source = null;
}

export function isRecorderStreamOpen(): boolean {
  return source !== null;
}

/**
 * Says what the stream is doing, for a caller that has just finished something
 * else and must not leave the connection reading as busy. A failed catch-up says
 * nothing about the stream, and `syncing` left behind would spin forever — and
 * keep the transport disabled with it.
 */
export function reportRecorderStreamState(dispatch: Dispatch): void {
  dispatch(
    gpsRecorderSetConnection(
      source === null
        ? 'idle'
        : source.readyState === EventSource.OPEN
          ? 'live'
          : 'reconnecting',
    ),
  );
}
