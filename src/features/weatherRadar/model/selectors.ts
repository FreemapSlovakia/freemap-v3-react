import type { RootState } from '@app/store/store.js';
import { isPremium } from '@features/premium/premium.js';
import { createSelector } from 'reselect';
import type { RadarFrame } from '../api.js';

/**
 * How far back the timeline reaches, by entitlement. The feed may hold less —
 * these are ceilings, not promises — and premium picks up any extra the server
 * starts publishing without a change here.
 */
const PREMIUM_HISTORY_MS = 6 * 3_600_000;

const FREE_HISTORY_MS = 2 * 3_600_000;

export const radarPremiumSelector = (state: RootState) =>
  isPremium(state.auth.user);

/**
 * Every frame the timeline puts on the track — including the ones this user
 * may not open. Showing them greyed is the whole point: a track that simply
 * stopped early would say nothing about what premium buys.
 *
 * Trimmed only by the six-hour ceiling, and by a premium user's own choice to
 * hide the forecast. The window is measured from the newest measured frame
 * rather than from the wall clock, so this stays a pure function of the state —
 * anchoring on `Date.now()` would make the memoization a lie, since nothing
 * would invalidate it as time passed.
 */
export const radarFramesSelector = createSelector(
  (state: RootState) => state.weatherRadar.frames,
  (state: RootState) => state.weatherRadarSettings.showNowcast,
  radarPremiumSelector,
  (frames, showNowcast, premium) => {
    // Only a premium user can turn the forecast off; for everyone else it is
    // on the track as something to be offered, not something they chose.
    const kept =
      premium && !showNowcast ? frames.filter((f) => !f.forecast) : frames;

    const newest = frames.findLast((f) => !f.forecast)?.time;

    if (newest === undefined) {
      return kept;
    }

    const oldest = newest - PREMIUM_HISTORY_MS / 1000;

    return kept.filter((frame) => frame.forecast || frame.time >= oldest);
    // NOTE: forecast frames are never trimmed by the history ceiling; a window
    // measured backwards has nothing to say about the future.
  },
);

/**
 * The stretch of the track this user may actually open, as indices into
 * `radarFramesSelector`. Everything outside it is on the track but locked:
 * older than the free window at one end, the forecast at the other.
 */
export const radarAllowedSelector = createSelector(
  radarFramesSelector,
  radarPremiumSelector,
  (frames, premium) => {
    if (premium || frames.length === 0) {
      return { from: 0, to: Math.max(frames.length - 1, 0) };
    }

    const to = frames.findLastIndex((f) => !f.forecast);

    const newest = frames[to]?.time;

    // No measured frames at all — the radar feed failed while the forecast
    // answered. Everything on the track is premium, so none of it opens;
    // falling through to "the whole track" would hand it over free.
    if (to < 0 || newest === undefined) {
      return { from: 0, to: -1 };
    }

    const cutoff = newest - FREE_HISTORY_MS / 1000;

    const from = frames.findIndex((f) => !f.forecast && f.time >= cutoff);

    return { from: Math.max(from, 0), to };
  },
);

/**
 * Index of the frame on screen. A frame the user picked wins; otherwise the
 * newest measured one, which is the "now" a radar is normally read at.
 */
export const radarIndexSelector = createSelector(
  radarFramesSelector,
  (state: RootState) => state.weatherRadar.selectedTime,
  radarAllowedSelector,
  (frames, selectedTime, { from, to }) => {
    const picked =
      selectedTime === null
        ? -1
        : frames.findIndex((frame) => frame.time === selectedTime);

    const index =
      picked > -1
        ? picked
        : // The newest measured frame is the "now" a radar is read at.
          (() => {
            const measured = frames.findLastIndex((frame) => !frame.forecast);

            return measured > -1 ? measured : frames.length - 1;
          })();

    // A selection can fall outside the allowed stretch — premium expiring
    // mid-session, or a pin the entitlement no longer covers. An empty stretch
    // means nothing on the track may be opened at all (the radar feed failed
    // while the forecast answered, so every frame is premium): -1, so no frame
    // is drawn and none is fetched. Leaving the index alone would paint one of
    // those forecast frames for a user who has not paid for it.
    return to < from ? -1 : Math.min(Math.max(index, from), to);
  },
);

export const radarFrameSelector = createSelector(
  radarFramesSelector,
  radarIndexSelector,
  (frames, index): RadarFrame | undefined => frames[index],
);
