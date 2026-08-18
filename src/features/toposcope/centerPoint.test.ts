import type { RootState } from '@app/store/store.js';
import type { DrawingPoint } from '@features/drawing/model/actions/drawingPointActions.js';
import { describe, expect, it } from 'vitest';
import {
  CENTER_ICON,
  CENTER_PROP,
  CENTER_PROP_VALUE,
  toposcopeCenterSelector,
} from './centerPoint.js';

/**
 * The whole toposcope hangs off this rule — the property is the only record of
 * which point the dial stands on.
 */
function makeState(points: DrawingPoint[]): RootState {
  return { drawingPoints: { points } } as unknown as RootState;
}

const at = (lat: number, props?: Record<string, string>): DrawingPoint => ({
  coords: { lat, lon: 17 },
  ...(props ? { props } : {}),
});

const centered = (lat: number, extra?: Record<string, string>) =>
  at(lat, { [CENTER_PROP]: CENTER_PROP_VALUE, ...extra });

describe('toposcopeCenterSelector', () => {
  it('finds no centre with nothing drawn', () => {
    expect(toposcopeCenterSelector(makeState([]))).toBeUndefined();
  });

  it('finds the marked point wherever it sits', () => {
    const state = makeState([at(47), centered(48), at(49)]);

    expect(toposcopeCenterSelector(state)).toMatchObject({
      index: 1,
      point: { coords: { lat: 48 } },
    });
  });

  it('takes the first of several marked points', () => {
    const state = makeState([centered(48), centered(49)]);

    expect(toposcopeCenterSelector(state)?.index).toBe(0);
  });

  it('reads the value forgivingly', () => {
    const state = makeState([at(48, { [CENTER_PROP]: '  Center ' })]);

    expect(toposcopeCenterSelector(state)?.index).toBe(0);
  });

  it('ignores the property set to something else', () => {
    const state = makeState([at(48, { [CENTER_PROP]: 'ray' })]);

    expect(toposcopeCenterSelector(state)).toBeUndefined();
  });

  it('does not take the icon for the mark', () => {
    // The viewpoint symbol is what a fresh centre is given to look like; the
    // property is what makes it one, so restyling a marker can't take it apart.
    const state = makeState([
      { coords: { lat: 48, lon: 17 }, icon: CENTER_ICON },
    ]);

    expect(toposcopeCenterSelector(state)).toBeUndefined();
  });

  it('loses the centre when the property goes', () => {
    expect(toposcopeCenterSelector(makeState([at(48)]))).toBeUndefined();
  });
});
