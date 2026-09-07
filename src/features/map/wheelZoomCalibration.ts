import type { MyStore } from '@app/store/store.js';
import { onMap } from '@features/map/hooks/leafletElementHolder.js';
import { DomEvent } from 'leaflet';

/**
 * How far one wheel gesture zooms.
 *
 * Leaflet asks for `4·log₂(2 / (1 + e^(−d/(4·wheelPxPerZoomLevel))))` levels for
 * a gesture it normalized to `d` pixels, then rounds that request *up* to the
 * `zoomSnap` grid. A request larger than one grid step therefore collapses
 * several steps into one — at a fixed sensitivity a quarter grid steps by a
 * half, indistinguishable from the half grid.
 *
 * `wheelPxPerZoomLevel` is the only term that can fix it, and the right value
 * depends on the pointing device: Leaflet divides the raw `deltaY` by the
 * display's pixel ratio, and mice, trackpads and free-spinning wheels disagree
 * anyway. So it is measured rather than assumed — see
 * `attachWheelZoomCalibration`.
 */

// What a gesture is worth before anything has been measured. Also a floor on the
// calibrated value: it is the sensitivity the map has always had, and it can only
// ever make a gesture ask for *less* than one step, which still rounds up to
// exactly one. So calibration only damps the wheel, never enlivens it.
const BASELINE_WHEEL_PX = 100;

// A gesture is aimed just under one grid step rather than exactly at it: landing
// on the step is landing on `Math.ceil`'s boundary, where a float a hair over
// rounds to two steps instead of one.
const STEP_TARGET = 0.98;

/**
 * The `wheelPxPerZoomLevel` at which a gesture of `deltaPx` asks for just under
 * `snap` levels — the inverse of the curve above.
 *
 * Only for a grid finer than a whole level. A whole level is what a gesture has
 * always been worth, so there is nothing to correct there, and calibrating it
 * would quietly re-tune the default for coarse wheels.
 */
function wheelPxForStep(deltaPx: number, snap: number): number | undefined {
  if (snap <= 0 || snap >= 1 || deltaPx <= 0) {
    return undefined;
  }

  const target = snap * STEP_TARGET;

  // d = 4·log₂(2/(1+e^−u)) solved for u, where u = deltaPx / (4·wheelPx).
  const u = -Math.log(2 ** (1 - target / 4) - 1);

  return u > 0 ? deltaPx / (4 * u) : undefined;
}

// A guess at the normalized pixels a gesture carries, close enough that the
// usual mouse needs no correction at all. Measurement replaces it with the real
// figure on the first gesture.
const TYPICAL_GESTURE_PX = 68;

/**
 * The sensitivity at which a gesture Leaflet normalized to `deltaPx` steps one
 * `zoomSnap` grid step, never livelier than the baseline.
 */
export function calibratedWheelPxPerZoomLevel(
  deltaPx: number,
  zoomSnap: number,
): number {
  return Math.max(BASELINE_WHEEL_PX, wheelPxForStep(deltaPx, zoomSnap) ?? 0);
}

/** The estimate to open the map with, for a device that hasn't turned a wheel yet. */
export function initialWheelPxPerZoomLevel(zoomSnap: number): number {
  return calibratedWheelPxPerZoomLevel(TYPICAL_GESTURE_PX, zoomSnap);
}

/**
 * Keeps one wheel gesture worth one `zoomSnap` step on whatever device is
 * driving it, by measuring the gesture and setting `wheelPxPerZoomLevel` to
 * match. Leaflet reads that option inside its own wheel handler rather than at
 * construction, so this needs no remount and takes effect immediately.
 *
 * The gesture is accumulated the way Leaflet accumulates it — the same
 * normalization and the same `wheelDebounceTime` window — because that total,
 * not a single event, is what it divides. A trackpad delivers a flick as dozens
 * of tiny events; calibrating from one of those would overshoot by their count.
 * Listening in the capture phase is what makes this possible at all: Leaflet's
 * own handler calls `stopPropagation`, and it must not have run first.
 */
export function attachWheelZoomCalibration(store: MyStore) {
  onMap((map) => {
    let accumulated = 0;

    let startedAt: number | undefined;

    map.getContainer().addEventListener(
      'wheel',
      (event) => {
        const now = event.timeStamp;

        const debounce = map.options.wheelDebounceTime ?? 40;

        // A new gesture, or the continuation of the one being accumulated.
        if (startedAt === undefined || now - startedAt > debounce) {
          accumulated = 0;

          startedAt = now;
        }

        accumulated += Math.abs(DomEvent.getWheelDelta(event));

        // Set from the running total, so Leaflet's `_performZoom` — which runs on
        // a timer once this same window closes — already reads the figure
        // calibrated for the gesture it is about to act on.
        map.options.wheelPxPerZoomLevel = calibratedWheelPxPerZoomLevel(
          accumulated,
          store.getState().map.zoomSnap,
        );
      },
      { passive: true, capture: true },
    );
  });
}
