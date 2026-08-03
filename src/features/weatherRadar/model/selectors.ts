import type { RootState } from '@app/store/store.js';
import { createSelector } from 'reselect';
import type { RadarFrame } from '../api.js';

/** The frames the timeline offers, honouring the nowcast preference. */
export const radarFramesSelector = createSelector(
  (state: RootState) => state.weatherRadar.frames,
  (state: RootState) => state.weatherRadarSettings.showNowcast,
  (frames, showNowcast) =>
    showNowcast ? frames : frames.filter((frame) => !frame.forecast),
);

/**
 * Index of the frame on screen. A frame the user picked wins; otherwise the
 * newest observed one, which is the "now" a radar is normally read at.
 */
export const radarIndexSelector = createSelector(
  radarFramesSelector,
  (state: RootState) => state.weatherRadar.selectedTime,
  (frames, selectedTime) => {
    const picked =
      selectedTime === null
        ? -1
        : frames.findIndex((frame) => frame.time === selectedTime);

    if (picked > -1) {
      return picked;
    }

    const lastObserved = frames.findLastIndex((frame) => !frame.forecast);

    return lastObserved > -1 ? lastObserved : frames.length - 1;
  },
);

export const radarFrameSelector = createSelector(
  radarFramesSelector,
  radarIndexSelector,
  (frames, index): RadarFrame | undefined => frames[index],
);
