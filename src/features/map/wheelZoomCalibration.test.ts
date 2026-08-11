import { describe, expect, it } from 'vitest';
import {
  calibratedWheelPxPerZoomLevel,
  initialWheelPxPerZoomLevel,
} from './wheelZoomCalibration.js';

/** What Leaflet's wheel handler asks for, given a gesture and a sensitivity. */
function levelsAsked(deltaPx: number, wheelPx: number): number {
  return (
    (4 * Math.log(2 / (1 + Math.exp(-Math.abs(deltaPx / (wheelPx * 4)))))) /
    Math.LN2
  );
}

/** …and where it lands once rounded up to the grid, as `_performZoom` does. */
function stepTaken(deltaPx: number, wheelPx: number, snap: number): number {
  const asked = levelsAsked(deltaPx, wheelPx);

  return snap ? Math.ceil(asked / snap) * snap : asked;
}

// Spans a mouse notch (~40–120 normalized px, varying with the display's pixel
// ratio), a trackpad's tiny increments, and a flick of a free-spinning wheel.
const GESTURES = [10, 20, 40, 53, 68, 100, 120, 200, 240, 400];

describe('initialWheelPxPerZoomLevel', () => {
  it('leaves the historical sensitivity alone for whole levels and halves', () => {
    // A gesture already asks for about half a level at 100, so neither grid
    // needs damping for a typical device — and the default must not shift.
    expect(initialWheelPxPerZoomLevel(1)).toBe(100);
    expect(initialWheelPxPerZoomLevel(0.5)).toBe(100);
    expect(initialWheelPxPerZoomLevel(0)).toBe(100);
  });

  it('damps the wheel for a quarter grid', () => {
    // Without this a gesture asking 0.47 rounds up to 0.5 — the very collapse
    // that made a quarter grid behave like a half one.
    expect(initialWheelPxPerZoomLevel(0.25)).toBeGreaterThan(150);

    expect(stepTaken(68, initialWheelPxPerZoomLevel(0.25), 0.25)).toBeCloseTo(
      0.25,
    );
  });
});

describe('wheel calibration — one gesture is one grid step', () => {
  for (const snap of [0.5, 0.25]) {
    it(`holds for a grid of ${snap} whatever the device reports`, () => {
      for (const deltaPx of GESTURES) {
        expect(
          stepTaken(
            deltaPx,
            calibratedWheelPxPerZoomLevel(deltaPx, snap),
            snap,
          ),
        ).toBeCloseTo(snap);
      }
    });
  }

  it('never sits on the rounding boundary, where one step would become two', () => {
    // Aiming a gesture exactly at the step is what a naive inverse does, and
    // `Math.ceil` then doubles it on the least floating-point excess.
    const exact = (deltaPx: number, snap: number) =>
      deltaPx / (4 * -Math.log(2 ** (1 - snap / 4) - 1));

    const onBoundary = GESTURES.some(
      (deltaPx) =>
        Math.abs(stepTaken(deltaPx, Math.max(100, exact(deltaPx, 0.5)), 0.5)) >
        0.5 + 1e-9,
    );

    expect(onBoundary).toBe(true);

    // The margin the module actually uses keeps every one of them at one step.
    for (const deltaPx of GESTURES) {
      expect(
        stepTaken(deltaPx, calibratedWheelPxPerZoomLevel(deltaPx, 0.5), 0.5),
      ).toBeCloseTo(0.5);
    }
  });
});
