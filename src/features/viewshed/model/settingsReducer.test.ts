import { describe, expect, it } from 'vitest';
import {
  nearestRadiusKm,
  VIEWSHED_RADIUS_STEPS_KM,
} from './settingsReducer.js';

describe('nearestRadiusKm', () => {
  it('leaves a stop where it is', () => {
    for (const km of VIEWSHED_RADIUS_STEPS_KM) {
      expect(nearestRadiusKm(km)).toBe(km);
    }
  });

  it('snaps a radius from a link written before the near stops went', () => {
    expect(nearestRadiusKm(1)).toBe(5);

    expect(nearestRadiusKm(3)).toBe(5);
  });

  it('takes the nearer of the two it falls between', () => {
    expect(nearestRadiusKm(8)).toBe(7);

    expect(nearestRadiusKm(9)).toBe(10);
  });

  it('holds one past the far end at the far end', () => {
    expect(nearestRadiusKm(1000)).toBe(300);
  });
});
