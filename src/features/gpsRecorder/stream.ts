import type { Dispatch } from 'redux';
import {
  gpsRecorderAddPoints,
  gpsRecorderSetConnection,
  gpsRecorderSync,
} from './model/actions.js';
import {
  RECORDER_ORIGIN,
  type RecorderPoint,
  RecorderStreamPayloadSchema,
} from './protocol.js';

let source: EventSource | null = null;

let dispatchRef: Dispatch | null = null;

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

  return Array.isArray(result.data) ? result.data : [result.data];
}

/**
 * A backgrounded page is frozen, so fixes recorded meanwhile never reach the
 * stream. Coming back to the foreground therefore has to re-run the
 * `/track?since=` catch-up before the stream can be trusted again.
 */
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    dispatchRef?.(gpsRecorderSync());
  }
}

/**
 * Attaches the live view. Idempotent — a stream that is already open is left
 * alone, so a resume does not drop and re-establish it.
 *
 * `EventSource` cannot pass `targetAddressSpace`, so this only works once the
 * Local Network Access permission has been granted by an earlier gestured
 * fetch. That is why the start flow calls `/status` first.
 */
export function openRecorderStream(dispatch: Dispatch): void {
  dispatchRef = dispatch;

  if (source) {
    return;
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  const es = new EventSource(`${RECORDER_ORIGIN}/stream`);

  source = es;

  es.onopen = () => {
    dispatch(gpsRecorderSetConnection('live'));
  };

  es.onmessage = (event) => {
    const points = parsePoints(event.data);

    if (points) {
      dispatch(gpsRecorderAddPoints(points));
    }
  };

  es.onerror = () => {
    // While the browser is still retrying (including the Last-Event-ID replay)
    // the stream is only reported as interrupted — reconnecting is its job, not
    // ours. A stream it has given up on is dropped, so a later resume can
    // attach a fresh one instead of finding this dead handle in place.
    if (es.readyState === EventSource.CLOSED) {
      if (source === es) {
        closeRecorderStream();
      }

      dispatch(gpsRecorderSetConnection('idle'));
    } else {
      dispatch(gpsRecorderSetConnection('reconnecting'));
    }
  };
}

export function closeRecorderStream(): void {
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  source?.close();

  source = null;

  dispatchRef = null;
}

export function isRecorderStreamOpen(): boolean {
  return source !== null;
}
