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
  const listed = weatherRadarReducer(
    weatherRadarInitialState,
    weatherRadarSetFrames({ frames: FRAMES, colorSchemes: [], generated: 1 }),
  );

  const refreshWith = (state: typeof listed, frames: RadarFrame[]) =>
    weatherRadarReducer(
      state,
      weatherRadarSetFrames({ frames, colorSchemes: [], generated: 2 }),
    );

  it('reads the newest observed frame as live rather than pinning to it', () => {
    // 300 is newest observed: picking it must follow new frames, not freeze.
    expect(
      weatherRadarReducer(listed, weatherRadarSetTime(300)).selectedTime,
    ).toBeNull();

    expect(
      weatherRadarReducer(listed, weatherRadarSetTime(200)).selectedTime,
    ).toBe(200);
  });

  it('stays on an older frame as the window advances', () => {
    const pinned = weatherRadarReducer(listed, weatherRadarSetTime(200));

    expect(refreshWith(pinned, FRAMES).selectedTime).toBe(200);
  });

  it('shifts to the new oldest when the pinned frame ages off', () => {
    const pinned = weatherRadarReducer(listed, weatherRadarSetTime(100));

    // 100 has aged out; the old end is now 200 — not a jump forward to live.
    expect(refreshWith(pinned, FRAMES.slice(1)).selectedTime).toBe(200);
  });

  it('moves a vanished forecast pick to the nearest surviving frame', () => {
    const pinned = weatherRadarReducer(listed, weatherRadarSetTime(500));

    // The nowcast was republished on shifted timestamps.
    expect(
      refreshWith(pinned, [...FRAMES.slice(0, 3), frame(450, true)])
        .selectedTime,
    ).toBe(450);
  });

  it('goes live when the nearest surviving frame is the newest observed', () => {
    const pinned = weatherRadarReducer(listed, weatherRadarSetTime(400));

    expect(refreshWith(pinned, FRAMES.slice(0, 3)).selectedTime).toBeNull();
  });
});
