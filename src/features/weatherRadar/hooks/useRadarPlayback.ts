import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { weatherRadarSetTime } from '../model/actions.js';
import { radarFramesSelector, radarIndexSelector } from '../model/selectors.js';

/** How long one frame stays on screen. */
const STEP_MS = 450;

/** The pause on the newest frame, so the loop reads as an end and a restart. */
const HOLD_MS = 1400;

/** Advances the animation while it is playing, looping back to the oldest frame. */
export function useRadarPlayback(): void {
  const dispatch = useDispatch();

  const playing = useAppSelector((state) => state.weatherRadar.playing);

  const frames = useAppSelector(radarFramesSelector);

  const index = useAppSelector(radarIndexSelector);

  useEffect(() => {
    if (!playing || frames.length < 2) {
      return;
    }

    const last = index >= frames.length - 1;

    const timer = window.setTimeout(
      () => {
        const next = frames[last ? 0 : index + 1];

        if (next) {
          dispatch(weatherRadarSetTime(next.time));
        }
      },
      last ? HOLD_MS : STEP_MS,
    );

    return () => window.clearTimeout(timer);
  }, [dispatch, playing, frames, index]);
}
