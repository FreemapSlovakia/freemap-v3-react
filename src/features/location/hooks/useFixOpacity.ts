import { useEffect, useState } from 'react';

/**
 * How long a fix reads as current. Matches the beam's `GPS_STALE_MS` so that
 * losing the beam and the marker starting to dim are one event, not two.
 */
export const FRESH_MS = 20_000;

/** Age at which the fade bottoms out. */
export const STALE_MS = 120_000;

/**
 * The display never disappears. After signal loss the last known position is
 * the most useful thing on the map — a person in a tunnel wants to see where
 * they went in — so it dims to a ghost and stays there.
 */
export const MIN_OPACITY = 0.3;

const TICK_MS = 1000;

/**
 * Opacity for a fix of the given age: full until {@link FRESH_MS}, then a
 * linear ramp to {@link MIN_OPACITY} at {@link STALE_MS}. Quantized, because
 * the ramp spans a hundred ticks and every distinct value costs a Leaflet
 * style write.
 */
export function fixOpacity(ageMs: number): number {
  if (ageMs <= FRESH_MS) {
    return 1;
  }

  if (ageMs >= STALE_MS) {
    return MIN_OPACITY;
  }

  const t = (ageMs - FRESH_MS) / (STALE_MS - FRESH_MS);

  return Math.round((1 - t * (1 - MIN_OPACITY)) * 100) / 100;
}

/**
 * Fades the located position as its fix ages, so a stale one stops passing
 * itself off as live. On signal loss `locateProcessor` deliberately keeps the
 * watch running and the last fix standing, which without this asserts just as
 * confidently as a fresh fix that the user is somewhere they may have left
 * minutes ago.
 *
 * Driven by a clock rather than by store updates: when the fixes stop arriving
 * there is nothing to re-render on, and that is exactly when the fade matters.
 *
 * The coarse phase-1 fix carries its own timestamp and `maximumAge` allows it
 * to be ten minutes old, so a cold start can legitimately open on a dimmed
 * marker until the accurate watch reports. That reads as odd but is true, and
 * the alternative — stamping it fresh — would be the lie this hook exists to
 * prevent.
 */
export function useFixOpacity(at: number | null): number {
  const [, tick] = useState(0);

  // Schedules re-renders only; the value itself is read from the clock below.
  // Holding it in state instead would hand the caller a value one commit out of
  // date whenever `at` changes, so a fix arriving already stale — the phase-1
  // case — would mount its marker at full opacity and only then snap to a
  // ghost, flashing exactly the confident reading this hook exists to suppress.
  useEffect(() => {
    if (at === null) {
      return;
    }

    let timeout: number | undefined;

    // The ramp is monotonic, so once it bottoms out there is nothing left to
    // animate until the next fix restarts the effect.
    const schedule = () => {
      if (fixOpacity(Date.now() - at) <= MIN_OPACITY) {
        return;
      }

      timeout = window.setTimeout(() => {
        tick((n) => n + 1);

        schedule();
      }, TICK_MS);
    };

    schedule();

    return () => {
      clearTimeout(timeout);
    };
  }, [at]);

  return at === null ? 1 : fixOpacity(Date.now() - at);
}
