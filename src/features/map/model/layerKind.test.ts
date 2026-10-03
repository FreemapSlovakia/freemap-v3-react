import { describe, expect, it } from 'vitest';
import { kindOverrides, withKind } from './layerKind.js';

describe('layer kind', () => {
  it("lets a link's kind win over the user's", () => {
    expect(
      kindOverrides(
        { A: { layer: 'overlay' }, B: { layer: 'base' }, C: { opacity: 1 } },
        { A: 'base' },
      ),
    ).toEqual({ A: 'base', B: 'base' });
  });

  it('switches WMS, shading and tiles, not a vector map', () => {
    const overrides = { W: 'overlay', V: 'overlay' } as const;

    expect(
      withKind({ type: 'W', layer: 'base', technology: 'wms' }, overrides),
    ).toEqual({ type: 'W', layer: 'overlay', technology: 'wms' });

    expect(
      withKind({ type: 'V', layer: 'base', technology: 'maplibre' }, overrides)
        .layer,
    ).toBe('base');
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
