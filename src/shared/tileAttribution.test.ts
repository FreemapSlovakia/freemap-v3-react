import { describe, expect, it } from 'vitest';
import {
  ATTRIBUTION_HEADER,
  expandCode,
  licenseAttributions,
  readTileCodes,
  resolveTileCodes,
} from './tileAttribution.js';

const headers = (attribution?: string) =>
  new Headers(
    attribution === undefined ? {} : { [ATTRIBUTION_HEADER]: attribution },
  );

describe('readTileCodes', () => {
  it('reads the codes the tile reports', () => {
    expect(readTileCodes(headers('csk,o,ssk'))).toEqual(['csk', 'o', 'ssk']);
  });

  it('reads a tile that credits nothing as crediting nothing', () => {
    expect(readTileCodes(headers(''))).toEqual([]);
  });

  it('leaves a tile that reports nothing unknown', () => {
    expect(readTileCodes(headers())).toBeNull();
  });
});

describe('expandCode', () => {
  it('expands the namespace the wire abbreviates', () => {
    expect(expandCode('o')).toBe('osm');

    expect(expandCode('ssk')).toBe('shading:sk');

    expect(expandCode('c_')).toBe('contours:_');
  });

  it('rejects what is not a code', () => {
    expect(expandCode('x')).toBeNull();

    expect(expandCode('s')).toBeNull();

    expect(expandCode('')).toBeNull();
  });
});

// Shaped as the renderer serves it: a list per code, `url` optional, and keys
// that name a region (`de_by`) or a territory of one (`en`).
const LICENSES = {
  osm: [{ title: 'OpenStreetMap contributors', url: 'https://osm.invalid/' }],
  'shading:sk': [{ title: 'DMR 5.0: ÚGKK SR', url: 'https://ugkk.invalid/' }],
  'contours:_': [{ title: 'GEDTM30' }],
  'shading:be': [{ title: 'SPW, CC BY 4.0' }, { title: 'Digitaal Vlaanderen' }],
  'shading:de_by': [{ title: 'DGM1: Bayern' }],
  'shading:en': [{ title: 'LIDAR Composite DTM 1 m (England, OGL v3)' }],
};

const names = (codes: string[] | null | undefined) =>
  resolveTileCodes(codes, LICENSES)?.map((attr) => attr.name ?? attr.nameKey);

describe('resolveTileCodes', () => {
  it('leaves tiles whose codes are unknown to the layer list', () => {
    expect(resolveTileCodes(null, LICENSES)).toBeNull();

    expect(resolveTileCodes(undefined, LICENSES)).toBeNull();
  });

  it('resolves nothing without the renderer dictionary', () => {
    expect(resolveTileCodes(['ssk'], null)).toBeNull();
  });

  it('credits the renderer and OSM whatever a tile drew', () => {
    expect(names([])).toEqual(['©\xa0Freemap Slovakia', 'osmData']);
  });

  it('takes titles from the dictionary', () => {
    expect(names(['ssk', 'c_'])).toEqual([
      '©\xa0Freemap Slovakia',
      'osmData',
      'DMR 5.0: ÚGKK SR',
      'GEDTM30',
    ]);
  });

  it('keeps its own wording, and credits OSM once', () => {
    expect(names(['o'])).toEqual(['©\xa0Freemap Slovakia', 'osmData']);
  });

  it('credits every licence a code is held under', () => {
    expect(names(['sbe'])).toEqual([
      '©\xa0Freemap Slovakia',
      'osmData',
      'SPW, CC BY 4.0',
      'Digitaal Vlaanderen',
    ]);
  });

  it('gives up on a code the dictionary does not name', () => {
    expect(resolveTileCodes(['sxx'], LICENSES)).toBeNull();

    expect(resolveTileCodes(['x'], LICENSES)).toBeNull();
  });
});

describe('licenseAttributions', () => {
  const countryOf = (name: string) =>
    licenseAttributions(LICENSES).find((attr) => attr.name?.startsWith(name))
      ?.country;

  it('narrows a dataset to the country its key names', () => {
    expect(countryOf('DMR 5.0')).toBe('sk');
  });

  it('reads a region key as its country', () => {
    expect(countryOf('DGM1')).toBe('de');
  });

  it('reads a territory key as the country the coverage names', () => {
    expect(countryOf('LIDAR Composite')).toBe('gb');
  });

  it('leaves a global key uncountried, so it always shows', () => {
    expect(countryOf('GEDTM30')).toBeUndefined();
  });

  it('leaves the locally worded codes to the layer', () => {
    expect(countryOf('OpenStreetMap')).toBeUndefined();

    expect(
      licenseAttributions(LICENSES).some((attr) =>
        attr.name?.startsWith('OpenStreetMap'),
      ),
    ).toBe(false);
  });
});
