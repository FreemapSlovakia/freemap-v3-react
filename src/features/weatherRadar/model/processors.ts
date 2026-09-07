import { httpRequest } from '@app/httpRequest.js';
import type {
  Processor,
  ProcessorHandler,
} from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { isAbortError } from '@shared/isAbortError.js';
import {
  type FeedInfo,
  type FeedStatus,
  FeedStatusSchema,
  RADAR_FEEDS,
  RADAR_LAYER,
  type RadarFeed,
  toFeedInfo,
  toFrames,
  WEATHER_RADAR_URL,
} from '../api.js';
import {
  weatherRadarClear,
  weatherRadarRefresh,
  weatherRadarSetFrames,
} from './actions.js';

/**
 * How often the frame lists are re-read. A composite lands every ten minutes,
 * so this catches one within a fraction of its life, and the proxy answers it
 * from cache for all but one client anyway.
 */
const REFRESH_MS = 120_000;

const radarActive = (state: RootState) =>
  state.map.layers.includes(RADAR_LAYER);

let timer: number | undefined;

let onVisibilityChange: (() => void) | undefined;

function stopPolling() {
  if (timer !== undefined) {
    window.clearInterval(timer);

    timer = undefined;
  }

  if (onVisibilityChange) {
    document.removeEventListener('visibilitychange', onVisibilityChange);

    onVisibilityChange = undefined;
  }
}

/**
 * Polls the frame lists for as long as the layer is on. The layer can already
 * be on at startup — from the URL hash or the saved layer set — and no state
 * change announces that, hence the initial run rather than a
 * `stateChangePredicate`.
 */
let initial = true;

/** Whether the frame lists have been asked for since the layer came on. */
let attempted = false;

export const weatherRadarLayerProcessor: Processor = {
  handle({ getState, prevState, dispatch }) {
    const active = radarActive(getState());

    if (!initial && active === radarActive(prevState)) {
      return;
    }

    initial = false;

    stopPolling();

    attempted = false;

    if (!active) {
      dispatch(weatherRadarClear());

      return;
    }

    timer = window.setInterval(
      () => dispatch(weatherRadarRefresh()),
      REFRESH_MS,
    );

    // A backgrounded tab has its timers throttled, so a phone coming back to
    // the map would otherwise animate a frame list minutes out of date.
    onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        dispatch(weatherRadarRefresh());
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    dispatch(weatherRadarRefresh());
  },
};

const fetchFrames: ProcessorHandler = async ({ getState, dispatch }) => {
  // The two feeds are independent services: asked for together, and a failure
  // of one left to the other rather than losing both. The forecast in
  // particular is the more fragile of them and the less essential.
  const statuses = await Promise.all(
    RADAR_FEEDS.map(async (feed) => {
      const res = await httpRequest({
        getState,
        url: `${WEATHER_RADAR_URL}/${feed}/status`,
        expectedStatus: 200,
        // The upstream authenticates by Referer, and the app is served with
        // `Referrer-Policy: no-referrer` — so without this the request carries
        // none and comes back 401. Per-request policy overrides the document's.
        referrerPolicy: 'strict-origin-when-cross-origin',
        // Only the layer going away invalidates this — not the unrelated map
        // edits the default cancellation trips on.
        cancelActions: [],
        stateChangePredicate: radarActive,
      });

      return FeedStatusSchema.parse(await res.json());
    }).map((promise) =>
      promise.catch((err) => {
        // A deliberate cancellation — the layer going away — must keep
        // propagating: the middleware knows to treat it as benign, whereas
        // swallowing it here turns switching the layer off into a red toast
        // and a Sentry report.
        if (isAbortError(err)) {
          throw err;
        }

        return undefined;
      }),
    ),
  );

  const byFeed = Object.fromEntries(
    RADAR_FEEDS.map((feed, i) => [feed, statuses[i]]),
  ) as Partial<Record<RadarFeed, FeedStatus>>;

  if (!byFeed.radar && !byFeed.forecast) {
    throw new Error('no weather radar feed answered');
  }

  const feeds: Partial<Record<RadarFeed, FeedInfo>> = {};

  for (const feed of RADAR_FEEDS) {
    const status = byFeed[feed];

    if (status) {
      feeds[feed] = toFeedInfo(status);
    }
  }

  dispatch(
    weatherRadarSetFrames({
      frames: toFrames(byFeed.radar, byFeed.forecast),
      feeds,
    }),
  );
};

export const weatherRadarRefreshProcessor: Processor = {
  actionCreator: weatherRadarRefresh,
  id: 'weatherRadar.refresh',
  errorKey: 'general.loadError',
  handle(params) {
    // The first *attempt* since the layer came on, not the first success: a
    // feed that keeps failing — a domain the upstream doesn't allow, say —
    // would otherwise await every poll, raising the progress spinner and an
    // error toast every couple of minutes for as long as the layer is up.
    const isFirst = !attempted;

    attempted = true;

    const promise = fetchFrames(params);

    if (isFirst) {
      return promise;
    }

    // A periodic refresh is not something the user asked for: awaiting it here
    // would raise the progress spinner every couple of minutes, and a failed
    // one leaves the frames already on screen usable — so it stays quiet and
    // the next tick retries.
    promise?.catch((err) => console.error(err));

    return undefined;
  },
};
