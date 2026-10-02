import { describe, expect, it } from 'vitest';
import {
  categoryGroup,
  coversView,
  nameMatches,
  passes,
  technologyGroup,
} from './filters.js';

describe('library filters', () => {
  it('groups the feature-layer technologies as special', () => {
    expect(technologyGroup('tile')).toBe('tile');

    expect(technologyGroup('color')).toBe('color');

    expect(technologyGroup('parametricShading')).toBe('parametricShading');

    expect(technologyGroup('gallery')).toBe('special');

    expect(technologyGroup(undefined)).toBeUndefined();
  });

  it('folds OSM-based maps into maps and unknowns into other', () => {
    expect(categoryGroup('osmbasedmap')).toBe('map');

    expect(categoryGroup('qa')).toBe('other');

    expect(categoryGroup(undefined)).toBe('other');
  });

  it('lets all through until a chip is on, then any of them', () => {
    expect(passes(new Set(), 'tile')).toBe(true);

    expect(passes(new Set(['tile']), 'wms')).toBe(false);

    expect(passes(new Set(['menu']), ['toolbar', 'menu'])).toBe(true);
  });

  it('matches a name without accents or case', () => {
    expect(nameMatches('Ortofotomapa Česko', 'cesko')).toBe(true);
  });

  it('tells a catalog map by its box, a built-in one by its countries', () => {
    const view = {
      bounds: [16.3, 48.1, 16.5, 48.3] as [number, number, number, number],
      countries: ['at'],
    };

    expect(
      coversView(
        { type: 'ABCDE', countries: ['us'], bbox: [9, 46, 17, 49] },
        view,
      ),
    ).toBe(true);

    expect(coversView({ type: 'ABCDE', bbox: [-80, 25, -79, 26] }, view)).toBe(
      false,
    );

    expect(coversView({ type: 'X', countries: ['sk'] }, view)).toBe(false);

    expect(coversView({ type: 'O' }, view)).toBe(true);
  });
});
