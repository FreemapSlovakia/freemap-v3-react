/**
 * Device-magnetometer heading, normalized across the two incompatible browser
 * APIs: iOS' `webkitCompassHeading` and the W3C absolute `deviceorientation`
 * Euler angles.
 *
 * All headings are degrees in `[0, 360)`, clockwise, and referenced to the
 * screen's "up" direction (so they stay correct in landscape). Note the north
 * they are referenced to differs by platform — see `readAbsolute`.
 */

export type CompassReading = {
  heading: number;
  /** Half-angle of the reported uncertainty in degrees; `null` when the platform reports none. */
  accuracy: number | null;
  /** `performance.now()` stamp, for staleness checks. */
  at: number;
};

type IosDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

type PermissionCapable = {
  requestPermission?: () => Promise<PermissionState>;
};

const DEG = Math.PI / 180;

/**
 * A relative alpha has an arbitrary origin and is useless as a compass — but
 * Chrome's DevTools sensor emulation only ever produces relative events, so dev
 * builds take them anyway to keep this testable without a phone. Keyed off
 * `DEPLOYMENT` (which `EnvironmentPlugin` always defines) the same way
 * `rspack.config.ts` decides on a production build.
 */
const ACCEPT_RELATIVE =
  !process.env['DEPLOYMENT'] || process.env['DEPLOYMENT'] === 'dev';

/**
 * Desktop Chrome exposes `DeviceOrientationEvent` while having no magnetometer
 * behind it, so the API check alone would offer the option everywhere. A touch
 * input being present is the closest proxy for a device that actually has one —
 * `any-pointer` rather than `pointer`, since an iPad with a trackpad attached
 * reports a fine *primary* pointer while still carrying a working compass.
 */
export function isCompassSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'DeviceOrientationEvent' in window &&
    // guarded because this runs at module load, where the host need not be a
    // full browser — jsdom, for one, ships no `matchMedia`
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(any-pointer: coarse)').matches
  );
}

/**
 * Whether the platform gates orientation events behind a prompt — true on
 * iOS 13+, false everywhere else. A capability test rather than UA sniffing,
 * and the reason the compass is opt-in at all.
 */
export function isCompassPermissionRequired(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window.DeviceOrientationEvent as unknown as PermissionCapable)
      ?.requestPermission === 'function'
  );
}

/**
 * iOS 13+ gates orientation events behind a permission that may only be
 * requested from a user gesture, so this must be called straight out of a click
 * handler (a promise chain from one is fine, a timeout is not). Everywhere else
 * it resolves `true` without prompting.
 */
export function requestCompassPermission(): Promise<boolean> {
  const request = (
    window.DeviceOrientationEvent as unknown as PermissionCapable | undefined
  )?.requestPermission;

  if (typeof request !== 'function') {
    return Promise.resolve(isCompassSupported());
  }

  return request
    .call(window.DeviceOrientationEvent)
    .then((state) => state === 'granted')
    .catch(() => false);
}

/** Screen rotation relative to the device chassis, in degrees. */
function screenAngle(): number {
  return screen.orientation?.angle ?? 0;
}

/**
 * Heading of the direction the user faces, from the W3C Euler angles.
 *
 * Two device axes can stand for "forward", each degenerate where the other
 * works: the screen's up vector (right when the phone lies flat, meaningless
 * when it is held upright) and the screen normal pointing out of the back
 * (right when upright, meaningless when flat). Summing their horizontal
 * projections blends between them by tilt for free — near either extreme the
 * degenerate term projects to roughly nothing, and in between both agree.
 */
function tiltCompensatedHeading(
  alpha: number,
  beta: number,
  gamma: number,
): number {
  const cA = Math.cos(alpha * DEG);
  const sA = Math.sin(alpha * DEG);
  const cB = Math.cos(beta * DEG);
  const sB = Math.sin(beta * DEG);
  const cG = Math.cos(gamma * DEG);
  const sG = Math.sin(gamma * DEG);

  // Columns of the device→Earth rotation matrix R = Rz(alpha)·Rx(beta)·Ry(gamma),
  // in the Earth frame where x points east, y north and z up.
  const xCol = [cA * cG - sA * sB * sG, cG * sA + cA * sB * sG];
  const yCol = [-cB * sA, cA * cB];
  const zCol = [cA * sG + cG * sA * sB, sA * sG - cA * cG * sB];

  // The screen's up vector in device coordinates, so landscape stays correct.
  const a = screenAngle() * DEG;
  const su = Math.sin(a);
  const cu = Math.cos(a);

  const east = su * xCol[0]! + cu * yCol[0]! - zCol[0]!;
  const north = su * xCol[1]! + cu * yCol[1]! - zCol[1]!;

  return (Math.atan2(east, north) / DEG + 360) % 360;
}

function readEvent(e: DeviceOrientationEvent): CompassReading | null {
  const { webkitCompassHeading: iosHeading, webkitCompassAccuracy } =
    e as IosDeviceOrientationEvent;

  if (typeof iosHeading === 'number' && !Number.isNaN(iosHeading)) {
    // iOS reports the heading ready-made, clockwise from north, referenced to
    // the device held in portrait — hence the screen-rotation term. Unlike the
    // Euler path below this is true north (it falls back to magnetic north when
    // location services are off).
    return {
      heading: (iosHeading + screenAngle() + 360) % 360,
      // documented as -1 when the magnetometer is not calibrated
      accuracy:
        typeof webkitCompassAccuracy === 'number' && webkitCompassAccuracy >= 0
          ? webkitCompassAccuracy
          : null,
      at: performance.now(),
    };
  }

  if (e.alpha === null || e.beta === null || e.gamma === null) {
    return null;
  }

  if (!e.absolute && !ACCEPT_RELATIVE) {
    return null;
  }

  // The absolute frame is magnetic-north referenced, so this path is off from
  // the GPS course by the local declination (~5° in Slovakia).

  return {
    heading: tiltCompensatedHeading(e.alpha, e.beta, e.gamma),
    accuracy: null,
    at: performance.now(),
  };
}

/**
 * Subscribes to compass readings. Listens to both event types rather than
 * picking one up front: `ondeviceorientationabsolute` being present is no
 * promise that it ever fires, and iOS only fires the plain event. Absolute
 * readings win once any have arrived.
 */
export function subscribeCompass(
  onReading: (reading: CompassReading) => void,
): () => void {
  let sawAbsolute = false;

  const handler = (fromAbsoluteEvent: boolean) => (e: Event) => {
    if (!fromAbsoluteEvent && sawAbsolute) {
      return;
    }

    const reading = readEvent(e as DeviceOrientationEvent);

    if (!reading) {
      return;
    }

    // Latch on a usable reading, never on the bare event: a device with no
    // magnetometer still fires `deviceorientationabsolute` once with null
    // angles, which would otherwise mute the fallback stream for good.
    if (fromAbsoluteEvent) {
      sawAbsolute = true;
    }

    onReading(reading);
  };

  const onAbsolute = handler(true);

  const onPlain = handler(false);

  window.addEventListener('deviceorientationabsolute', onAbsolute);

  window.addEventListener('deviceorientation', onPlain);

  return () => {
    window.removeEventListener('deviceorientationabsolute', onAbsolute);

    window.removeEventListener('deviceorientation', onPlain);
  };
}
