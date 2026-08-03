import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import type { RadarFrame } from '../api.js';
import { weatherRadarSetFrames, weatherRadarSetTime } from './actions.js';
import { weatherRadarInitialState, weatherRadarReducer } from './reducer.js';
import { radarFrameSelector, radarIndexSelector } from './selectors.js';
import { weatherRadarSettingsInitialState } from './settingsReducer.js';

const frame = (time: number, forecast = false): RadarFrame => ({
  time,
  path: `/v2/radar/${time}`,
  forecast,
});

/** Three observed frames followed by two nowcasts. */
const FRAMES = [
  frame(100),
  frame(200),
  frame(300),
  frame(400, true),
  frame(500, true),
];

function stateOf(
  frames: RadarFrame[],
  selectedTime: number | null,
  showNowcast = true,
): RootState {
  return {
    weatherRadar: {
      ...weatherRadarInitialState,
      frames,
      selectedTime,
    },
    weatherRadarSettings: { ...weatherRadarSettingsInitialState, showNowcast },
  } as unknown as RootState;
}

describe('radarIndexSelector', () => {
  it('follows the newest observed frame when nothing is picked', () => {
    expect(radarIndexSelector(stateOf(FRAMES, null))).toBe(2);

    expect(radarFrameSelector(stateOf(FRAMES, null))?.time).toBe(300);
  });

  it('shows the picked frame, forecast included', () => {
    expect(radarIndexSelector(stateOf(FRAMES, 500))).toBe(4);
  });

  it('falls back to the newest observed frame when the pick is filtered out', () => {
    expect(radarIndexSelector(stateOf(FRAMES, 500, false))).toBe(2);
  });

  it('shows the last frame when every frame is a forecast', () => {
    const forecasts = [frame(400, true), frame(500, true)];

    expect(radarIndexSelector(stateOf(forecasts, null))).toBe(1);
  });

  it('answers with no frame for an empty list', () => {
    expect(radarFrameSelector(stateOf([], null))).toBeUndefined();
  });
});

describe('weatherRadarReducer', () => {
  it('keeps a pick the new frame list still holds', () => {
    const picked = weatherRadarReducer(
      weatherRadarInitialState,
      weatherRadarSetTime(200),
    );

    const refreshed = weatherRadarReducer(
      picked,
      weatherRadarSetFrames({
        frames: FRAMES,
        colorSchemes: [],
        generated: 1,
      }),
    );

    expect(refreshed.selectedTime).toBe(200);
  });

  it('goes back to following the newest frame when the pick ages out', () => {
    const picked = weatherRadarReducer(
      weatherRadarInitialState,
      weatherRadarSetTime(100),
    );

    const refreshed = weatherRadarReducer(
      picked,
      weatherRadarSetFrames({
        frames: FRAMES.slice(1),
        colorSchemes: [],
        generated: 1,
      }),
    );

    expect(refreshed.selectedTime).toBeNull();
  });
});
