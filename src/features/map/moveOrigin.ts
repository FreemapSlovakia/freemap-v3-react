/**
 * Leaflet's `moveend` says the view settled, never who moved it, and the map's
 * center alone can't tell the cases apart — after a user gesture the map is
 * fresh and the store is stale, while mid-animation it is the other way round.
 * This marker gives the `moveend` handler the missing half.
 */

/**
 * Marks the window in which the app drives the view to catch up with the store.
 *
 * `Map.setView` starts with `_stop()`, which ends a running pan animation by
 * completing it in place — firing a synchronous `moveend` at the half-finished
 * center that the very same call is about to replace. Anything that refocuses
 * repeatedly (GPS following, following a tracked device) hits this constantly.
 *
 * The window covers only the synchronous part of the call. The animation's own
 * trailing `moveend` lands outside it, by which point the map center matches
 * the store anyway, and a drag that interrupts the animation still reports as
 * the user gesture it is.
 */
let programmaticDepth = 0;

export function duringProgrammaticMove<T>(fn: () => T): T {
  programmaticDepth++;

  try {
    return fn();
  } finally {
    programmaticDepth--;
  }
}

export function isProgrammaticMove(): boolean {
  return programmaticDepth > 0;
}
