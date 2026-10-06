import { describe, expect, it } from 'vitest';
import { kindOverrides, withKind } from './layerKind.js';

describe('layer kind', () => {
  it('takes the kinds the setups set', () => {
    expect(
      kindOverrides({
        A: { kind: 'overlay' },
        B: { kind: 'base' },
        C: { opacity: 1 },
      }),
    ).toEqual({ A: 'overlay', B: 'base' });
  });

  it('switches maps, not a data layer', () => {
    const overrides = { W: 'base', V: 'overlay', I: 'base' } as const;

    expect(
      withKind({ type: 'W', layer: 'overlay', technology: 'wms' }, overrides),
    ).toEqual({ type: 'W', layer: 'base', technology: 'wms' });

    // Its opacity is the user's to set, whichever kind it is.
    expect(
      withKind({ type: 'V', layer: 'base', technology: 'maplibre' }, overrides),
    ).toEqual({ type: 'V', layer: 'overlay', technology: 'maplibre' });

    expect(
      withKind(
        { type: 'I', layer: 'overlay', technology: 'gallery' },
        overrides,
      ).layer,
    ).toBe('overlay');
  });
});
