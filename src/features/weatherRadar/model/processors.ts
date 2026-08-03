import { httpRequest } from '@app/httpRequest.js';
import type {
  Processor,
  ProcessorHandler,
} from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import {
  LIBREWXR_URL,
  RADAR_LAYER,
  toFrames,
  WeatherMapsSchema,
} from '../api.js';
import {
  weatherRadarClear,
  weatherRadarRefresh,
  weatherRadarSetFrames,
} from './actions.js';

/**
 * How often the frame list is re-read. A new composite lands every ten minutes,
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
 * Polls the frame list for as long as the layer is on. The layer can already be
 * on at startup — from the URL hash or the saved layer set — and no state
 * change announces that, hence the initial run rather than a
 * `stateChangePredicate`.
 */
let initial = true;

export const weatherRadarLayerProcessor: Processor = {
  handle({ getState, prevState, dispatch }) {
    const active = radarActive(getState());

    if (!initial && active === radarActive(prevState)) {
      return;
    }

    initial = false;

    stopPolling();

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
  const res = await httpRequest({
    getState,
    url: `${LIBREWXR_URL}/public/weather-maps.json`,
    expectedStatus: 200,
    // Only the layer going away invalidates this fetch — not the unrelated map
    // edits the default cancellation trips on.
    cancelActions: [],
    stateChangePredicate: radarActive,
  });

  const { generated, radar } = WeatherMapsSchema.parse(await res.json());

  dispatch(
    weatherRadarSetFrames({
      frames: toFrames(radar),
      colorSchemes: radar.colorSchemes,
      generated,
    }),
  );
};

export const weatherRadarRefreshProcessor: Processor = {
  actionCreator: weatherRadarRefresh,
  id: 'weatherRadar.refresh',
  errorKey: 'general.loadError',
  handle(params) {
    const isFirst = params.getState().weatherRadar.generated === null;

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
