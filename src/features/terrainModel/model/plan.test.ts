import type { Bbox } from '@features/mapArea/model/actions.js';
import { describe, expect, it } from 'vitest';
import {
  FREE_MAX_SAMPLES,
  fittingWidth,
  groundSize,
  MIN_STEP_MM,
  MIN_WIDTH_MM,
  normalizeBbox,
  PREMIUM_MAX_SAMPLES,
  planModel,
  tilePixelM,
} from './plan.js';

const tatras: Bbox = [20.09, 49.11, 20.29, 49.19];

describe('planModel', () => {
  it('measures ground at the centre latitude', () => {
    const { width, depth } = groundSize(tatras);

    expect(width).toBeCloseTo(14_570, -2);
    expect(depth / width).toBeCloseTo(0.61, 2);
  });

  it('fits the bed by its tighter side', () => {
    expect(fittingWidth(tatras, [256, 256, 256])).toBe(256);
    expect(fittingWidth(tatras, [256, 100, 256])).toBe(163);
  });

  it('brings a world copy back to −180…180, and refuses the antimeridian', () => {
    for (const shifted of [
      [380.09, 49.11, 380.29, 49.19],
      [-339.91, 49.11, -339.71, 49.19],
    ] as Bbox[]) {
      normalizeBbox(shifted)!.forEach((v, i) => {
        expect(v).toBeCloseTo(tatras[i]!);
      });
    }
    expect(normalizeBbox([170, 50, 190, 60])).toBeNull();
    expect(normalizeBbox([20, 49, 10, 50])).toBeNull();
  });

  it('never fits narrower than the form accepts', () => {
    // A strip 30 times deeper than wide.
    const strip: Bbox = [20.1, 49.0, 20.105, 49.1];

    expect(fittingWidth(strip, [256, 256, 256])).toBe(MIN_WIDTH_MM);
  });

  it('steps at the floor where the data is finer, read at two pixels per step', () => {
    const plan = planModel(tatras, 50, 18, PREMIUM_MAX_SAMPLES);

    expect(plan.limitedBy).toBe('floor');
    expect(plan.stepMm).toBe(MIN_STEP_MM);
    expect(plan.cols).toBe(1001);
    // 0.05 mm is 14.6 m here: z14 (6.2 m) fits it twice, z13 (12.5 m) does not.
    expect(plan.zoom).toBe(14);
  });

  it('steps by one pixel of the finest zoom the account may read', () => {
    // 1 km at 200 mm: z15's 3.1 m is 0.62 mm, coarser than the floor.
    const small: Bbox = [20.1, 49.15, 20.1137, 49.156];

    const free = planModel(small, 200, 15, FREE_MAX_SAMPLES);

    expect(free.limitedBy).toBe('zoom');
    expect(free.zoom).toBe(15);
    expect(free.stepMm).toBeCloseTo(tilePixelM(15, small) * free.mmPerM);

    // At z18 the 200 mm model would need 4.3 M points, so the cap holds it.
    const premium = planModel(small, 200, 18, PREMIUM_MAX_SAMPLES);

    expect(premium.limitedBy).toBe('samples');
    expect(premium.stepMm).toBeLessThan(free.stepMm / 4);
  });

  it('caps the samples', () => {
    const plan = planModel(tatras, 256, 18, PREMIUM_MAX_SAMPLES);

    expect(plan.limitedBy).toBe('samples');
    expect(plan.cols * plan.rows).toBeLessThanOrEqual(PREMIUM_MAX_SAMPLES);
  });

  it('never exceeds the cap by the outer row and column', () => {
    // Square: a step from the area alone gives 2001 × 2001.
    const square: Bbox = [20, 49, 20.2747, 49.18];

    const plan = planModel(square, 256, 18, PREMIUM_MAX_SAMPLES);

    expect(plan.cols * plan.rows).toBeLessThanOrEqual(PREMIUM_MAX_SAMPLES);
  });

  it('caps free accounts at a quarter of the samples, so twice the step', () => {
    const free = planModel(tatras, 256, 15, FREE_MAX_SAMPLES);

    const premium = planModel(tatras, 256, 18, PREMIUM_MAX_SAMPLES);

    expect(free.limitedBy).toBe('samples');
    expect(free.cols * free.rows).toBeLessThanOrEqual(FREE_MAX_SAMPLES);
    expect(free.stepMm / premium.stepMm).toBeCloseTo(2, 1);
  });
});
