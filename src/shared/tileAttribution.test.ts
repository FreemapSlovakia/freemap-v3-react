import { describe, expect, it } from 'vitest';
import {
  expandCode,
  licenseAttributions,
  readTileCodes,
  resolveTileCodes,
} from './tileAttribution.js';

// As the renderer writes them: SOI, the JFIF header, then the comment.
const JFIF = [
  0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x02, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x00, 0x00,
];

function jpeg(comment: string | null, lead = JFIF): Blob {
  if (comment === null) {
    return new Blob([new Uint8Array([0xff, 0xd8, ...lead, 0xff, 0xda, 0, 2])]);
  }

  const payload = new TextEncoder().encode(comment);

  const size = payload.length + 2;

  return new Blob([
    new Uint8Array([0xff, 0xd8, ...lead, 0xff, 0xfe, size >> 8, size & 0xff]),
    payload,
  ]);
}

describe('readTileCodes', () => {
  it('reads the codes past whatever segments precede the comment', async () => {
    await expect(readTileCodes(jpeg('o,ssk,csk'))).resolves.toEqual([
      'o',
      'ssk',
      'csk',
    ]);

    // straight after SOI, and behind a segment larger than the JFIF header
    await expect(readTileCodes(jpeg('o', []))).resolves.toEqual(['o']);

    await expect(
      readTileCodes(
        jpeg('o', [0xff, 0xe2, 0x01, 0x04, ...new Array(258).fill(0)]),
      ),
    ).resolves.toEqual(['o']);
  });

  it('reads a tile that credits nothing as crediting nothing', async () => {
    await expect(readTileCodes(jpeg(''))).resolves.toEqual([]);
  });

  it('reaches a comment past the head it reads first', async () => {
    // an APP2 bigger than the 4 KiB head, as an embedded colour profile is
    const icc = [0xff, 0xe2, 0x18, 0x00, ...new Array(0x17fe).fill(0)];

    await expect(readTileCodes(jpeg('ssk', icc))).resolves.toEqual(['ssk']);
  });

  it('refuses a segment whose length cannot even cover itself', async () => {
    // Not `[]`: a corrupt tile has to widen the credit, not narrow it.
    for (const length of [0, 1]) {
      await expect(
        readTileCodes(
          new Blob([
            new Uint8Array([0xff, 0xd8, ...JFIF, 0xff, 0xfe, 0, length]),
          ]),
        ),
      ).resolves.toBeNull();
    }
  });

  it('walks past fill bytes and markers that carry no length', async () => {
    await expect(
      readTileCodes(jpeg('o', [0xff, 0xff, 0xff, 0x01, ...JFIF])),
    ).resolves.toEqual(['o']);
  });

  it('leaves anything else unknown', async () => {
    await expect(readTileCodes(jpeg(null))).resolves.toBeNull();

    await expect(
      readTileCodes(new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])])),
    ).resolves.toBeNull();
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
// that name a region (`de_by`) or something that is not a country (`en`).
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

  it('leaves a key that is no country uncountried, so it always shows', () => {
    expect(countryOf('LIDAR Composite')).toBeUndefined();

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
