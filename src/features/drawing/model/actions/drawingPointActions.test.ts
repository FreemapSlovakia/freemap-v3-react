import { describe, expect, it } from 'vitest';
import { pickDrawingProps } from './drawingPointActions.js';

describe('pickDrawingProps', () => {
  it('carries the tags worth carrying', () => {
    expect(
      pickDrawingProps({ name: 'Sitno', ele: '1009', building: 'yes' }),
    ).toEqual({ name: 'Sitno', ele: '1009' });
  });

  it('keeps only strings, whatever the file said', () => {
    // A GeoJSON writing `"ele": 1234` as a number would otherwise put one in
    // the store, and a map saved with it stops opening on reload.
    expect(pickDrawingProps({ name: 'Sitno', ele: 1234 })).toEqual({
      name: 'Sitno',
    });

    expect(
      pickDrawingProps({ ref: ['a', 'b'], operator: { x: 1 }, phone: null }),
    ).toBeUndefined();
  });

  it('reads nothing at all as nothing', () => {
    expect(pickDrawingProps(undefined)).toBeUndefined();

    expect(pickDrawingProps({ building: 'yes' })).toBeUndefined();
  });
});
