import { describe, expect, it } from 'vitest';
import { steppedZoom } from './zoomStep.js';

describe('steppedZoom', () => {
  it('steps by a whole level from a whole level', () => {
    expect(steppedZoom(13, 1)).toBe(14);
    expect(steppedZoom(13, -1)).toBe(12);
  });

  it('lands on the next whole level from between two', () => {
    // What the buttons are for once a wheel or pinch gesture has left the map
    // between two levels: they are the way back to a native tile zoom.
    expect(steppedZoom(12.4, 1)).toBe(13);
    expect(steppedZoom(12.4, -1)).toBe(12);

    expect(steppedZoom(12.9, 1)).toBe(13);
    expect(steppedZoom(12.9, -1)).toBe(12);
  });

  it('steps down through zero', () => {
    expect(steppedZoom(1, -1)).toBe(0);
    expect(steppedZoom(0.5, -1)).toBe(0);
  });
});
