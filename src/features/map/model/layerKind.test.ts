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

    // A vector map's background would hide what is beneath, as tiles do.
    expect(
      withKind({ type: 'V', layer: 'base', technology: 'maplibre' }, overrides),
    ).toMatchObject({ layer: 'overlay', defaultOpacity: 0.5 });

    expect(
      withKind(
        { type: 'I', layer: 'overlay', technology: 'gallery' },
        overrides,
      ).layer,
    ).toBe('overlay');
  });

  it('starts tiles used as an overlay half transparent', () => {
    expect(
      withKind(
        { type: 'T', layer: 'base', technology: 'tile' },
        { T: 'overlay' },
      ),
    ).toMatchObject({ layer: 'overlay', defaultOpacity: 0.5 });
  });
});
