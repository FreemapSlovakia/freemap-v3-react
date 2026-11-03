import { describe, expect, it } from 'vitest';
import {
  pixelExactScale,
  snapZoom,
  tileDensity,
  zoomGridOffset,
} from './zoomGrid.js';

describe('pixelExactScale', () => {
  it('picks the whole density fewer zoom levels away', () => {
    expect(pixelExactScale(0.8)).toBe(1);
    expect(pixelExactScale(1)).toBe(1);
    expect(pixelExactScale(1.25)).toBe(1);
    expect(pixelExactScale(1.45)).toBe(2);
    expect(pixelExactScale(1.75)).toBe(2);
    expect(pixelExactScale(2.5)).toBe(3);
  });
});

describe('zoomGridOffset', () => {
  it('shows a tile pixel on one device pixel', () => {
    expect(2 ** zoomGridOffset(true, 1.75) * 1.75).toBeCloseTo(2);
    expect(2 ** zoomGridOffset(true, 1.25) * 1.25).toBeCloseTo(1);
  });

  it('is zero when off or on a whole density', () => {
    expect(zoomGridOffset(false, 1.75)).toBe(0);
    expect(zoomGridOffset(true, 2)).toBe(0);
  });

  it('gives up past half a level', () => {
    expect(zoomGridOffset(true, 0.6)).toBe(0);
  });
});

describe('tileDensity', () => {
  it('fetches a whole density when pixel-exact applies', () => {
    expect(tileDensity(true, 3, 1.75)).toBe(2);
  });

  it('keeps the resolution scale otherwise', () => {
    expect(tileDensity(false, 3, 1.75)).toBe(3);
    expect(tileDensity(true, 3, 0.6)).toBe(3);
    expect(tileDensity(true, null, 0.6)).toBe(0.6);
  });
});

describe('snapZoom', () => {
  it('snaps onto the shifted grid', () => {
    expect(snapZoom(13, 1, 0.2)).toBeCloseTo(13.2);
    expect(snapZoom(13.6, 1, 0.2)).toBeCloseTo(13.2);
    expect(snapZoom(13.8, 1, 0.2)).toBeCloseTo(14.2);
    expect(snapZoom(13.3, 0.5, -0.3)).toBeCloseTo(13.2);
  });

  it('leaves a zoom alone with no grid', () => {
    expect(snapZoom(13.37, 0, 0.2)).toBe(13.37);
  });
});
