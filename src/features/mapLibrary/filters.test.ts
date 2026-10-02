import { describe, expect, it } from 'vitest';
import {
  categoryGroup,
  coversView,
  nameMatches,
  passes,
  technologyGroup,
} from './filters.js';

describe('library filters', () => {
  it('groups the layers the app draws as data layers', () => {
    expect(technologyGroup('tile')).toBe('tile');

    expect(technologyGroup('color')).toBe('color');

    expect(technologyGroup('parametricShading')).toBe('parametricShading');

    expect(technologyGroup('gallery')).toBe('data');

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

  it('tells a catalog map by its box and countries, a built-in one by its countries', () => {
    const view = {
      bounds: [16.3, 48.1, 16.5, 48.3] as [number, number, number, number],
      countries: ['at'],
    };

    expect(
      coversView(
        { type: 'ABCDE', countries: ['at'], bbox: [9, 46, 17, 49] },
        view,
      ),
    ).toBe(true);

    // A box spanning the globe, as overseas territories give France's maps.
    expect(
      coversView(
        { type: 'ABCDE', countries: ['fr'], bbox: [-178, -23, 169, 51] },
        view,
      ),
    ).toBe(false);

    expect(coversView({ type: 'ABCDE', bbox: [-80, 25, -79, 26] }, view)).toBe(
      false,
    );

    expect(coversView({ type: 'X', countries: ['sk'] }, view)).toBe(false);

    expect(coversView({ type: 'O' }, view)).toBe(true);
  });

  it('needs a catalog map’s box even where its country is in view', () => {
    expect(
      coversView(
        { type: 'ABCDE', countries: ['at'], bbox: [9, 46, 10, 47] },
        { bounds: [16.3, 48.1, 16.5, 48.3], countries: ['at'] },
      ),
    ).toBe(false);
  });

  it('goes by the box alone where no country is known for the view', () => {
    // Outside Europe the countries service names none.
    expect(
      coversView(
        { type: 'ABCDE', countries: ['us'], bbox: [-109, 37, -102, 41] },
        { bounds: [-105.1, 39.6, -104.9, 39.8], countries: [] },
      ),
    ).toBe(true);
  });

  it('treats a built-in map with no countries as covering nowhere', () => {
    expect(
      coversView({ type: 'X', countries: [] }, { countries: ['sk'] }),
    ).toBe(false);
  });
});
