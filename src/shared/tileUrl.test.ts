import { describe, expect, it } from 'vitest';
import { markDrawnTile, unmarkDrawnTile } from './tileUrl.js';

describe('the drawn-tile marker', () => {
  it('goes on whether or not the template already asks something', () => {
    expect(markDrawnTile('https://t.invalid/1/2/3')).toBe(
      'https://t.invalid/1/2/3?fm-draw=1',
    );

    expect(markDrawnTile('https://t.invalid/tile?z=1')).toBe(
      'https://t.invalid/tile?z=1&fm-draw=1',
    );
  });

  it('comes off again, leaving the key a download would use', () => {
    const bare = 'https://t.invalid/1/2/3@2x';

    expect(unmarkDrawnTile(markDrawnTile(bare))).toBe(bare);

    expect(unmarkDrawnTile(markDrawnTile('https://t.invalid/tile?z=1'))).toBe(
      'https://t.invalid/tile?z=1',
    );
  });

  it('comes off a protocol-relative template, and from among others', () => {
    expect(unmarkDrawnTile(markDrawnTile('//t.invalid/1/2/3'))).toBe(
      '//t.invalid/1/2/3',
    );

    expect(unmarkDrawnTile('https://t.invalid/t?fm-draw=1&z=1')).toBe(
      'https://t.invalid/t?z=1',
    );

    expect(unmarkDrawnTile('https://t.invalid/t?a=1&fm-draw=1&z=1')).toBe(
      'https://t.invalid/t?a=1&z=1',
    );
  });

  it('keeps clear of a fragment on either side', () => {
    expect(markDrawnTile('https://t.invalid/1/2/3#a')).toBe(
      'https://t.invalid/1/2/3?fm-draw=1#a',
    );

    expect(unmarkDrawnTile('https://t.invalid/1/2/3?fm-draw=1#a')).toBe(
      'https://t.invalid/1/2/3#a',
    );

    expect(unmarkDrawnTile(markDrawnTile('https://t.invalid/t?z=1#a'))).toBe(
      'https://t.invalid/t?z=1#a',
    );
  });

  it('leaves a URL that never carried it exactly as it was', () => {
    for (const url of [
      'https://t.invalid/1/2/3',
      'https://t.invalid/1/2/3?z=1',
      '//t.invalid/1/2/3',
    ]) {
      expect(unmarkDrawnTile(url)).toBe(url);
    }
  });
});
