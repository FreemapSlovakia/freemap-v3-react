import type { RootState } from '@app/store/store.js';
import { describe, expect, it } from 'vitest';
import { type RadarFrame, toFrames } from '../api.js';
import { weatherRadarSetFrames, weatherRadarSetTime } from './actions.js';
import { weatherRadarInitialState, weatherRadarReducer } from './reducer.js';
import {
  radarAllowedSelector,
  radarFrameSelector,
  radarFramesSelector,
  radarIndexSelector,
} from './selectors.js';
import { weatherRadarSettingsInitialState } from './settingsReducer.js';

const frame = (time: number, forecast = false): RadarFrame => ({
  time,
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
  premium = true,
): RootState {
  return {
    weatherRadar: {
      ...weatherRadarInitialState,
      frames,
      selectedTime,
    },
    weatherRadarSettings: { ...weatherRadarSettingsInitialState, showNowcast },
    auth: premium
      ? { user: { premiumExpiration: new Date('2099-01-01') } }
      : { user: null },
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
    weatherRadarSetFrames({ frames: FRAMES, feeds: {} }),
  );

  const refreshWith = (state: typeof listed, frames: RadarFrame[]) =>
    weatherRadarReducer(state, weatherRadarSetFrames({ frames, feeds: {} }));

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

describe('entitlement', () => {
  const HOUR = 3600;

  // Eight hours of measured frames at ten-minute steps, plus a forecast.
  const long = [
    ...Array.from({ length: 49 }, (_, i) => frame(i * 600)),
    frame(49 * 600, true),
  ];

  const spanHours = (frames: RadarFrame[]) => {
    const measured = frames.filter((f) => !f.forecast);

    return ((measured.at(-1)?.time ?? 0) - (measured[0]?.time ?? 0)) / HOUR;
  };

  it('puts six hours on the track and lets premium open all of it', () => {
    const state = stateOf(long, null);

    const frames = radarFramesSelector(state);

    expect(spanHours(frames)).toBe(6);

    expect(frames.some((f) => f.forecast)).toBe(true);

    expect(radarAllowedSelector(state)).toEqual({
      from: 0,
      to: frames.length - 1,
    });
  });

  it('shows a free user the same track but opens only two hours of it', () => {
    const state = stateOf(long, null, true, false);

    const frames = radarFramesSelector(state);

    // The locked frames stay on the track — that is what makes the offer.
    expect(spanHours(frames)).toBe(6);

    expect(frames.some((f) => f.forecast)).toBe(true);

    const { from, to } = radarAllowedSelector(state);

    expect(spanHours(frames.slice(from, to + 1))).toBe(2);

    // The forecast sits past the allowed end, locked.
    expect(frames[to]?.forecast).toBe(false);

    expect(to).toBeLessThan(frames.length - 1);
  });

  it('locks nothing when the feed is shorter than the free window', () => {
    const state = stateOf(
      FRAMES.filter((f) => !f.forecast),
      null,
      true,
      false,
    );

    const frames = radarFramesSelector(state);

    expect(radarAllowedSelector(state)).toEqual({
      from: 0,
      to: frames.length - 1,
    });
  });

  it('clamps a selection that falls outside what is allowed', () => {
    // The oldest frame *on the track* — present, and locked for a free user.
    const oldestShown = radarFramesSelector(
      stateOf(long, null, true, false),
    )[0];

    const state = stateOf(long, oldestShown?.time ?? null, true, false);

    const { from } = radarAllowedSelector(state);

    expect(from).toBeGreaterThan(0);

    expect(radarIndexSelector(state)).toBe(from);
  });
});

describe('feed edge cases', () => {
  it('locks the whole track when only the forecast answered', () => {
    // The radar feed failed; everything on the track is premium.
    const onlyForecast = [frame(100, true), frame(200, true)];

    const free = stateOf(onlyForecast, null, true, false);

    const { from, to } = radarAllowedSelector(free);

    expect(to).toBeLessThan(from);

    expect(radarAllowedSelector(stateOf(onlyForecast, null))).toEqual({
      from: 0,
      to: 1,
    });
  });
});

describe('toFrames', () => {
  const status = (times: number[]) => ({
    updatedAt: 'x',
    zoomLevels: [1] as [number, ...number[]],
    format: 'png',
    times,
  });

  it('drops forecast frames the measured feed has already overtaken', () => {
    // The forecast is a cycle stale: its first two moments are now measured.
    const frames = toFrames(
      status([100, 200, 300]),
      status([200, 300, 400, 500]),
    );

    expect(frames.map((f) => [f.time, f.forecast])).toEqual([
      [100, false],
      [200, false],
      [300, false],
      [400, true],
      [500, true],
    ]);
  });

  it('keeps every forecast frame when the feeds are in step', () => {
    expect(toFrames(status([100, 200]), status([300, 400]))).toHaveLength(4);
  });
});
