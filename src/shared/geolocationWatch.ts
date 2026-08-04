/**
 * One `watchPosition` for the whole app, shared by everything that wants fixes.
 *
 * Android merges concurrent location requests at the highest rate anyone asked
 * for, so a second watch is not a second stream of information — it is the same
 * stream, bought twice. With the locate button, browser track recording and live
 * tracking all wanting the same fixes, keeping the watch here is what stops
 * three subscribers becoming three requests.
 *
 * The options are fixed and not negotiable per subscriber, for the same reason:
 * a merged request runs at the strictest of them anyway, so letting a caller ask
 * for less would save nothing while making what actually runs unpredictable.
 * They are what `locateProcessor` has always asked for.
 */
const OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 30_000,
};

interface Subscriber {
  onFix: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
}

const subscribers = new Set<Subscriber>();

let watchId: number | undefined;

/**
 * The newest fix seen, so a subscriber joining an already-running watch has
 * something to show before the next one arrives — which on a sparse or
 * struggling receiver is a long time to look at nothing.
 */
let lastFix: GeolocationPosition | null = null;

export function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.geolocation;
}

/** The newest fix the shared watch has seen, or null before there is one. */
export function lastGeolocationFix(): GeolocationPosition | null {
  return lastFix;
}

/**
 * Adds a subscriber, starting the underlying watch if it is the first. The
 * returned function removes it, stopping the watch when the last one goes.
 *
 * Errors are delivered to every subscriber rather than ending the watch:
 * `POSITION_UNAVAILABLE` and `TIMEOUT` are transient signal loss, and the watch
 * recovers on its own once the receiver has something to say again. Only
 * `PERMISSION_DENIED` is final, and it is the subscriber's business what to do
 * about it.
 */
export function subscribeGeolocation(
  onFix: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void,
): () => void {
  const subscriber: Subscriber = { onFix, onError };

  subscribers.add(subscriber);

  if (watchId === undefined && isGeolocationSupported()) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        lastFix = position;

        // Copied before iterating: a subscriber may unsubscribe from inside its
        // own callback, which is exactly what the recorder does when it stops.
        for (const { onFix: fix } of [...subscribers]) {
          fix(position);
        }
      },
      (error) => {
        for (const { onError: fail } of [...subscribers]) {
          fail?.(error);
        }
      },
      OPTIONS,
    );
  }

  return () => {
    subscribers.delete(subscriber);

    if (subscribers.size === 0 && watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);

      watchId = undefined;

      // Dropped with the watch: the next subscriber is starting a fresh one, and
      // a fix from before it would be handed out as if it were current.
      lastFix = null;
    }
  };
}
