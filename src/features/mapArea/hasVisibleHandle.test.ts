import { describe, expect, it } from 'vitest';
import { hasVisibleHandle } from './hasVisibleHandle.js';
import type { Bbox } from './model/actions.js';

const viewport: Bbox = [0, 0, 10, 10];

describe('hasVisibleHandle', () => {
  it('accepts a rectangle inside the viewport', () => {
    expect(hasVisibleHandle([2, 2, 4, 4], viewport)).toBe(true);
  });

  it('accepts a rectangle straddling an edge with a corner well inside', () => {
    expect(hasVisibleHandle([-5, -5, 5, 5], viewport)).toBe(true);
  });

  it('rejects a rectangle off the viewport', () => {
    expect(hasVisibleHandle([20, 20, 24, 24], viewport)).toBe(false);
  });

  it('rejects a rectangle reaching only into the edge buffer', () => {
    expect(hasVisibleHandle([-5, -5, 0.5, 0.5], viewport)).toBe(false);
  });

  it('rejects a rectangle swallowing the whole viewport', () => {
    expect(hasVisibleHandle([-100, -100, 100, 100], viewport)).toBe(false);
  });
});
