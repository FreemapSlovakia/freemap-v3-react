import type { Dispatch } from 'redux';
import {
  gpsRecorderAddPoints,
  gpsRecorderSetConnection,
  gpsRecorderSync,
} from './model/actions.js';
import {
  DEFAULT_POINT_FIELDS,
  decodePoints,
  RECORDER_ORIGIN,
  type RecorderPoint,
  RecorderStreamPayloadSchema,
  streamPayloadToRows,
} from './protocol.js';

let source: EventSource | null = null;

/** Column order for the bare rows the stream sends; see `DEFAULT_POINT_FIELDS`. */
let fields: readonly string[] = DEFAULT_POINT_FIELDS;

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

  const result = RecorderStreamPayloadSchema.safeParse(json);

  if (!result.success) {
    return null;
  }

  return decodePoints(fields, streamPayloadToRows(result.data));
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
  pointFields?: readonly string[],
): void {
  // Kept current even for an already-open stream: the column order comes from
  // the last `/track` page, and a resync may have read a newer one.
  if (pointFields) {
    fields = pointFields;
  }

  cancelRevive();

  if (source) {
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
  cancelRevive();

  reviveAttempt = 0;

  source?.close();

  source = null;
}

export function isRecorderStreamOpen(): boolean {
  return source !== null;
}
