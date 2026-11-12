import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import type { Dispatch } from 'redux';
import { createSelector } from 'reselect';
import z from 'zod';
import { loadTrackingMessages } from '../../translations/loadTrackingMessages.js';
import { trackingActions } from '../actions.js';
import { type TrackedDevice, TrackPointSchema } from '../types.js';

const KeySchema = z.union([
  z.object({ token: z.string() }),
  z.object({ deviceId: z.number() }),
]);

type Key = z.infer<typeof KeySchema>;

const PointsSchema = z.object({ points: z.array(TrackPointSchema) });

const UnavailableSchema = z.object({ status: z.number() });

// The server pings every 30 s; a stream silent for longer is dead.
const WATCHDOG_MS = 75_000;

const RETRY_MS = 10_000;

const MAX_RETRY_MS = 300_000;

interface Stream {
  url: string;
  /** Tracked-device token by `streamKey`. */
  tokens: Map<string, string>;
}

const streamKey = (key: Key) =>
  'token' in key ? `t:${key.token}` : `d:${key.deviceId}`;

const streamSelector = createSelector(
  [
    (state: RootState) => state.tracking.trackedDevices,
    (state: RootState) => state.auth.user?.authToken,
  ],
  toStream,
);

let stream: Stream | undefined;

let source: EventSource | undefined;

let lastEventId = '';

let retryMs = RETRY_MS;

/** Tokens whose refusal was toasted for the current stream. */
let reported = new Set<string>();

let timer: number | undefined;

function close() {
  source?.close();

  source = undefined;

  window.clearTimeout(timer);
}

function open(dispatch: Dispatch) {
  if (!stream) {
    return;
  }

  const { tokens } = stream;

  const es = new EventSource(
    lastEventId
      ? `${stream.url}&since=${encodeURIComponent(lastEventId)}`
      : stream.url,
  );

  source = es;

  const reopenIn = (ms: number) => {
    window.clearTimeout(timer);

    timer = window.setTimeout(() => {
      close();

      open(dispatch);
    }, ms);
  };

  reopenIn(WATCHDOG_MS);

  /** Whether the event is from the current stream; marks it alive if so. */
  const alive = (e: MessageEvent) => {
    if (es !== source) {
      return false;
    }

    reopenIn(WATCHDOG_MS);

    if (e.lastEventId) {
      lastEventId = e.lastEventId;
    }

    return true;
  };

  const on = <T>(
    type: string,
    schema: z.ZodType<T>,
    handle: (data: T, token: string) => void,
  ) => {
    es.addEventListener(type, (e) => {
      if (!alive(e)) {
        return;
      }

      let json: unknown;

      try {
        json = JSON.parse(e.data);
      } catch {
        return;
      }

      const key = KeySchema.safeParse(json);

      const parsed = schema.safeParse(json);

      const token = key.success ? tokens.get(streamKey(key.data)) : undefined;

      if (token !== undefined && parsed.success) {
        handle(parsed.data, token);
      }
    });
  };

  // Also carries the first event id, once every device is caught up.
  es.addEventListener('ping', alive);

  es.addEventListener('open', () => {
    retryMs = RETRY_MS;
  });

  on('history', PointsSchema, ({ points }, token) => {
    dispatch(trackingActions.trackHistory({ token, trackPoints: points }));
  });

  on('points', PointsSchema, ({ points }, token) => {
    dispatch(trackingActions.trackPoints({ token, trackPoints: points }));
  });

  on('point', TrackPointSchema, (point, token) => {
    dispatch(trackingActions.trackPoints({ token, trackPoints: [point] }));
  });

  on('unavailable', UnavailableSchema, ({ status }, token) => {
    dispatch(trackingActions.dropTrack(token));

    // Every reconnect repeats it.
    if (reported.has(token)) {
      return;
    }

    reported.add(token);

    dispatch(
      toastsAdd({
        id: `tracking.subscribeError.${token}`,
        messageKey: status === 404 ? 'subscribeNotFound' : 'subscribeError',
        messageLoader: loadTrackingMessages,
        messageParams: { id: token },
        style: status === 404 ? 'warning' : 'danger',
      }),
    );
  });

  // EventSource retries network errors itself; a refused or failed response closes it for good.
  es.addEventListener('error', () => {
    if (es === source && es.readyState === EventSource.CLOSED) {
      reopenIn(retryMs);

      retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    }
  });
}

/** Keeps one live-tracking stream open for all tracked devices. */
export const trackingStreamProcessor: Processor = {
  stateChangePredicate: (state) => streamSelector(state)?.url,
  async handle({ getState, dispatch }) {
    close();

    stream = streamSelector(getState());

    lastEventId = '';

    retryMs = RETRY_MS;

    reported = new Set();

    open(dispatch);
  },
};

function toStream(
  trackedDevices: TrackedDevice[],
  authToken: string | undefined,
): Stream | undefined {
  if (trackedDevices.length === 0) {
    return undefined;
  }

  const tokens = new Map<string, string>();

  const devices = trackedDevices.map((td) => {
    const { maxAge, maxCount, fromTime } = td;

    const key: Key = /^\d+$/.test(td.token)
      ? { deviceId: Number.parseInt(td.token, 10) }
      : { token: td.token };

    tokens.set(streamKey(key), td.token);

    return { ...key, maxAge, maxCount, fromTime };
  });

  const url = new URL(`${process.env['API_URL']}/tracking/stream`);

  url.searchParams.set('devices', JSON.stringify(devices));

  if (authToken) {
    url.searchParams.set('authToken', authToken);
  }

  return { url: url.toString(), tokens };
}
