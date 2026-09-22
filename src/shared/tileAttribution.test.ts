import { describe, expect, it } from 'vitest';
import {
  expandCode,
  readTileCodes,
  resolveTileCodes,
} from './tileAttribution.js';

function jpeg(comment: string | null): Blob {
  if (comment === null) {
    return new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16])]);
  }

  const payload = new TextEncoder().encode(comment);

  const size = payload.length + 2;

  return new Blob([
    new Uint8Array([0xff, 0xd8, 0xff, 0xfe, size >> 8, size & 0xff]),
    payload,
  ]);
}

describe('readTileCodes', () => {
  it('reads the codes of the leading comment segment', async () => {
    await expect(readTileCodes(jpeg('o,ssk,csk'))).resolves.toEqual([
      'o',
      'ssk',
      'csk',
    ]);
  });

  it('reads a tile that credits nothing as crediting nothing', async () => {
    await expect(readTileCodes(jpeg(''))).resolves.toEqual([]);
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

const LICENSES = {
  osm: { title: 'OpenStreetMap contributors', url: 'https://osm.invalid/' },
  'shading:sk': { title: 'DMR 5.0: ÚGKK SR', url: 'https://ugkk.invalid/' },
  'contours:_': { title: 'GEDTM30' },
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

  it('gives up on a code the dictionary does not name', () => {
    expect(resolveTileCodes(['sxx'], LICENSES)).toBeNull();

    expect(resolveTileCodes(['x'], LICENSES)).toBeNull();
  });
});
