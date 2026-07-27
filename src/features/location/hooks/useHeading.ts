import { toastsAdd } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  type CompassReading,
  isCompassPermissionRequired,
  isCompassSupported,
  subscribeCompass,
} from '../compass.js';

export type Heading = {
  /** Degrees clockwise from north. */
  value: number;
  /** Cone half-angle in degrees, widening as the source gets less certain. */
  spread: number;
};

type Source = 'compass' | 'gps';

/** How often the smoothed heading is pushed to React; readings arrive far faster. */
const TICK_MS = 100;

/**
 * A compass that went quiet (sensor wedged, permission revoked) must not freeze
 * the beam. Generous, because a live sensor streams continuously whether or not
 * the device moves — going quiet at all means the stream died, not that the
 * user stood still. (Chrome's DevTools emulation is the exception: it emits
 * only on change, so a static slider looks dead here.)
 */
const COMPASS_STALE_MS = 10_000;

const COMPASS_MAX_ACCURACY = 30;

/** Below this the GPS course is noise, whatever the fix claims. */
const GPS_MIN_SPEED = 1;

/**
 * The course needs ageing out for the same reason the compass does. On signal
 * loss `locateProcessor` deliberately keeps the watch running and the last fix
 * standing, so without this the beam would keep pointing confidently the way
 * the user was last heading while they turned around in a tunnel.
 */
const GPS_STALE_MS = 20_000;

/** Only above this is a compass/GPS disagreement more likely bad data than crabbing. */
const CROSS_CHECK_MIN_SPEED = 3;

const CROSS_CHECK_MAX_DIFF = 60;

const CROSS_CHECK_MS = 4000;

/**
 * A compass is only distrusted on evidence, which needs brisk movement to
 * gather. Expire the verdict so one bad stretch (a car door, a pylon) does not
 * suppress the compass for the rest of the session; a still-bad one is caught
 * again within `CROSS_CHECK_MS` of the next chance to look.
 */
const DISTRUST_TTL_MS = 60_000;

/** Hysteresis, so pausing at a junction does not flap the beam between sources. */
const SWITCH_DELAY_MS = 1000;

const SMOOTHING = 0.3;

const MIN_CHANGE_DEG = 1;

/**
 * Devices without a magnetometer stay silent; say so rather than look broken.
 *
 * Where a grant is prompted for, the subscription starts while the dialog is
 * still open, so the window has to outlast a human reading it — warning early
 * would both lie and burn `compassWarned` for the session. That costs nothing
 * there: a device offering the iOS permission has a magnetometer behind it, so
 * the warning is near-unreachable anyway. Elsewhere nothing blocks the first
 * reading, and the missing-sensor case is real, so answer quickly.
 */
const NO_READING_MS = isCompassPermissionRequired() ? 30_000 : 3000;

const SPREAD_GPS = 45;

const SPREAD_COMPASS_UNKNOWN = 30;

let compassWarned = false;

/** Signed difference `a - b` folded into `[-180, 180)`. */
function angleDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

/**
 * The heading to draw for the current position, fused from the two sources that
 * measure different things: the magnetometer (where the device points, works
 * standing still, magnetically fragile) and the GPS course over ground (where
 * the user moves, only while moving, rock solid). The compass wins when trusted
 * — it is smooth and works at a standstill — with the course as fallback.
 */
export function useHeading(): Heading | null {
  const dispatch = useDispatch();

  const headingSource = useAppSelector(
    (state) => state.locationSettings.headingSource,
  );

  const location = useAppSelector((state) => state.location.location);

  const locate = useAppSelector((state) => state.location.locate);

  const [heading, setHeading] = useState<Heading | null>(null);

  const gpsRef = useRef(location);

  gpsRef.current = location;

  const compassRef = useRef<CompassReading | null>(null);

  // Tracked apart from `compassRef`, which `onVisibility` clears: backgrounding
  // the app near the deadline would otherwise read as "sensor never spoke" and
  // latch `compassWarned`, muting a genuine failure later in the session.
  const sawReadingRef = useRef(false);

  const distrustRef = useRef({ since: 0, at: 0, distrusted: false });

  // `pending` is nullable as a whole rather than carrying a nullable source in
  // flat fields: losing the heading is itself a `wanted` of `null`, which a
  // `pending: null` sentinel could not be told apart from "nothing pending".
  const sourceRef = useRef<{
    current: Source | null;
    pending: { source: Source | null; since: number } | null;
  }>({ current: null, pending: null });

  const smoothRef = useRef<{ sin: number; cos: number } | null>(null);

  const compassOn =
    locate && headingSource === 'compass' && isCompassSupported();

  const on = locate && headingSource !== 'none';

  useEffect(() => {
    if (!compassOn) {
      compassRef.current = null;

      return;
    }

    sawReadingRef.current = false;

    const unsubscribe = subscribeCompass((reading) => {
      compassRef.current = reading;

      sawReadingRef.current = true;
    });

    // Events legitimately stop while backgrounded, and the longer staleness
    // window would otherwise let a return show a heading minutes out of date.
    const onVisibility = () => {
      if (document.hidden) {
        compassRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    const timeout = setTimeout(() => {
      if (!sawReadingRef.current && !compassWarned) {
        compassWarned = true;

        dispatch(
          toastsAdd({
            id: 'main.compassUnavailable',
            messageKey: 'main.compassUnavailable',
            style: 'warning',
            timeout: 5000,
          }),
        );
      }
    }, NO_READING_MS);

    return () => {
      unsubscribe();

      clearTimeout(timeout);

      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [compassOn, dispatch]);

  useEffect(() => {
    if (!on) {
      setHeading(null);

      smoothRef.current = null;

      sourceRef.current = { current: null, pending: null };

      // A `since` surviving a stop would let the next session's first
      // disagreeing sample read as having already outlasted `CROSS_CHECK_MS`.
      distrustRef.current = { since: 0, at: 0, distrusted: false };

      return;
    }

    const interval = setInterval(() => {
      const now = performance.now();

      const compass =
        compassOn &&
        compassRef.current &&
        now - compassRef.current.at < COMPASS_STALE_MS
          ? compassRef.current
          : null;

      const gps =
        gpsRef.current && Date.now() - gpsRef.current.at < GPS_STALE_MS
          ? gpsRef.current
          : null;

      const gpsHeading =
        gps &&
        gps.heading !== null &&
        gps.speed !== null &&
        gps.speed > GPS_MIN_SPEED
          ? gps.heading
          : null;

      // The only way to catch a magnetometer thrown off by a car door or a
      // laptop: while moving briskly the two sources must roughly agree.
      const distrust = distrustRef.current;

      if (
        compass &&
        gpsHeading !== null &&
        gps &&
        gps.speed !== null &&
        gps.speed > CROSS_CHECK_MIN_SPEED
      ) {
        if (
          Math.abs(angleDiff(compass.heading, gpsHeading)) >
          CROSS_CHECK_MAX_DIFF
        ) {
          distrust.since ||= now;

          distrust.distrusted = now - distrust.since > CROSS_CHECK_MS;

          distrust.at = now;
        } else {
          distrust.since = 0;

          distrust.distrusted = false;
        }
      } else {
        // No way to compare right now, so part-gathered evidence goes stale:
        // keeping `since` would let one disagreeing sample minutes later read as
        // having already outlasted `CROSS_CHECK_MS` and distrust instantly.
        distrust.since = 0;

        if (distrust.distrusted && now - distrust.at > DISTRUST_TTL_MS) {
          distrust.distrusted = false;
        }
      }

      const compassOk =
        compass &&
        !distrust.distrusted &&
        (compass.accuracy === null || compass.accuracy <= COMPASS_MAX_ACCURACY);

      const wanted: Source | null = compassOk
        ? 'compass'
        : gpsHeading === null
          ? null
          : 'gps';

      const src = sourceRef.current;

      if (wanted === src.current) {
        src.pending = null;
      } else if (src.current === null) {
        // nothing on screen yet, so there is no flapping to damp
        src.current = wanted;

        src.pending = null;
      } else if (src.pending?.source !== wanted) {
        src.pending = { source: wanted, since: now };
      } else if (now - src.pending.since > SWITCH_DELAY_MS) {
        src.current = wanted;

        src.pending = null;
      }

      if (src.current === null) {
        smoothRef.current = null;

        setHeading((prev) => (prev === null ? prev : null));

        return;
      }

      const target =
        src.current === 'compass' ? (compass?.heading ?? null) : gpsHeading;

      if (target === null) {
        return;
      }

      const rad = (target * Math.PI) / 180;

      const smooth = smoothRef.current;

      // Interpolate on the circle; averaging degrees whips the beam around the
      // 359°→0° wrap.
      smoothRef.current = smooth
        ? {
            sin: smooth.sin + (Math.sin(rad) - smooth.sin) * SMOOTHING,
            cos: smooth.cos + (Math.cos(rad) - smooth.cos) * SMOOTHING,
          }
        : { sin: Math.sin(rad), cos: Math.cos(rad) };

      const value =
        (Math.atan2(smoothRef.current.sin, smoothRef.current.cos) * 180) /
        Math.PI;

      const spread =
        src.current === 'gps'
          ? SPREAD_GPS
          : (compass?.accuracy ?? SPREAD_COMPASS_UNKNOWN);

      setHeading((prev) =>
        prev &&
        Math.abs(angleDiff(prev.value, value)) < MIN_CHANGE_DEG &&
        prev.spread === spread
          ? prev
          : { value: (value + 360) % 360, spread },
      );
    }, TICK_MS);

    return () => {
      clearInterval(interval);
    };
  }, [on, compassOn]);

  return heading;
}
