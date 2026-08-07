import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { weatherRadarSetTime } from '../model/actions.js';
import {
  radarAllowedSelector,
  radarFramesSelector,
  radarIndexSelector,
} from '../model/selectors.js';

/** How long a frame stays on screen once it is actually on screen. */
const STEP_MS = 450;

/** The pause on the newest frame, so the loop reads as an end and a restart. */
const HOLD_MS = 1400;

/**
 * How long to wait for a frame that hasn't appeared before giving up on it.
 * Long enough to cover a slow tile fetch, short enough that one unreachable
 * frame doesn't read as the animation having stopped.
 */
const STALL_MS = 5_000;

/**
 * Advances the animation while it is playing, looping back to the oldest frame.
 *
 * `resolved` says the selected frame has finished trying — painted, or
 * answered for with nothing. A frame is revealed only once every one of its
 * tiles has settled, so it lags the selection while they arrive, and stepping
 * on a timer alone would let the index race ahead of the picture on a first
 * pass: every second or third frame appearing, which reads as a stutter. The
 * dwell therefore starts when the frame resolves, giving each the same STEP_MS
 * however long it took.
 *
 * Resolved rather than painted, because a frame whose every tile 404s is never
 * painted and its layer stays in the pool, so Leaflet never re-fires `load` —
 * waiting for *that* would stall the loop for STALL_MS on every pass instead of
 * once. STALL_MS still covers the frame that is merely slow.
 */
export function useRadarPlayback(resolved: boolean): void {
  const dispatch = useDispatch();

  const playing = useAppSelector((state) => state.weatherRadar.playing);

  const frames = useAppSelector(radarFramesSelector);

  const index = useAppSelector(radarIndexSelector);

  // Locked frames stay on the track for the sake of the offer, but the loop
  // runs only over what this user may actually watch.
  const { from, to } = useAppSelector(radarAllowedSelector);

  useEffect(() => {
    if (!playing || to - from < 1) {
      return;
    }

    const last = index >= to;

    const timer = window.setTimeout(
      () => {
        const next = frames[last ? from : index + 1];

        if (next) {
          dispatch(weatherRadarSetTime(next.time));
        }
      },
      resolved ? (last ? HOLD_MS : STEP_MS) : STALL_MS,
    );

    return () => window.clearTimeout(timer);
    // `resolved` going false mid-wait re-arms the timer, which is right: it
    // only does so when the frame's layer was dropped, and a dropped layer has
    // to fetch its tiles again.
  }, [dispatch, playing, frames, index, from, to, resolved]);
}
