import { describe, expect, it } from 'vitest';
import { decodeTileCoverage } from './tileCoverage.js';

// From freemap-tileserver at zoom 12: a 5×5 block at x 2270–2274, y 1400–1404,
// full but for its right column; only the inner 3×3 stays full.
const bytes = Uint8Array.from(
  Buffer.from(
    '010c882822020808088aa4a648a802082aa6a2266a20aa0a0000000000',
    'hex',
  ),
);

describe('decodeTileCoverage', () => {
  const coverage = decodeTileCoverage(bytes);

  it('reads the tiles at its zoom', () => {
    expect(coverage(12, 2271, 1401)).toBe('full');
    expect(coverage(12, 2274, 1402)).toBe('partial');
    expect(coverage(12, 2270, 1400)).toBe('partial');
    expect(coverage(12, 2280, 1402)).toBe('none');
  });

  it('answers deeper tiles from their ancestor', () => {
    expect(coverage(20, 2272 * 256 + 17, 1402 * 256 + 200)).toBe('full');
    expect(coverage(20, 2274 * 256, 1402 * 256)).toBe('partial');
    expect(coverage(20, 2280 * 256, 1402 * 256)).toBe('none');
  });

  it('answers shallower tiles from the tree', () => {
    expect(coverage(10, 567, 350)).toBe('partial');
    expect(coverage(0, 0, 0)).toBe('partial');
    expect(coverage(10, 0, 0)).toBe('none');
  });

  it('rejects an unknown version', () => {
    expect(() => decodeTileCoverage(Uint8Array.of(2, 12, 0))).toThrow();
  });
});

// The same, plus a source stopping at zoom 6: full at x 39–41, y 19–21, partial
// at 42/20 and at 35/21, which spans the zoom-12 block.
const withShortSource = (hex: string) =>
  decodeTileCoverage(Uint8Array.from(Buffer.from(hex, 'hex')));

describe('decodeTileCoverage with a source stopping short', () => {
  // `--coverage-full-to 14`: the zoom-6 source, upscaled by 8, is served that deep
  const servedDeep = withShortSource(
    '010c88288080e202fbfbfbbaa7a67babfefbeaa6aee66aefaafaffff088cc2820f0a7fb0000000',
  );

  // served to 20: the zoom-12 source is, the zoom-6 one is not
  const servedShallow = withShortSource(
    '010c88288080e202fbfbfbbaa7a67babfefbeaa6aee66aefaafaffff088cc2820f0affb0000000',
  );

  // neither is upscaled at all
  const notUpscaled = withShortSource(
    '010c88288080e202fbfbfbbaabaabbabfefbeaaaaeeaaaefaafaffff088cc2820f0affb0000000',
  );

  it('keeps a full tile full only where its source is served that deep', () => {
    expect(servedDeep(6, 40, 20)).toBe('full');
    expect(servedDeep(12, 40 * 64 + 5, 20 * 64 + 9)).toBe('full');
    expect(servedShallow(6, 40, 20)).toBe('partial');
    expect(servedShallow(12, 40 * 64 + 5, 20 * 64 + 9)).toBe('partial');
    expect(notUpscaled(12, 2271, 1401)).toBe('partial');
  });

  it('knows nothing below a partial or unsurrounded tile', () => {
    expect(servedDeep(6, 39, 19)).toBe('partial');
    expect(servedDeep(14, 42 * 256, 20 * 256)).toBe('partial');
    expect(servedDeep(6, 10, 10)).toBe('none');
  });

  it('keeps finer data under an unknown tile and fills only its gaps', () => {
    expect(servedShallow(12, 2271, 1401)).toBe('full');
    expect(servedShallow(12, 2280, 1402)).toBe('partial');
    expect(servedShallow(12, 0, 0)).toBe('none');
  });
});
