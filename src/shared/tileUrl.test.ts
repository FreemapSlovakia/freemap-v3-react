import { describe, expect, it } from 'vitest';
import { buildTileUrl, parseTileUrl } from './tileUrl.js';

describe('parseTileUrl', () => {
  const template = 'https://{s}.tile.example.com/{z}/{x}/{y}.png';

  it('reads back what buildTileUrl put in', () => {
    expect(
      parseTileUrl(template, buildTileUrl(template, 3, 5, 7, 'b')),
    ).toEqual({ x: 3, y: 5, z: 7, s: 'b' });
  });

  it('ignores the @Nx suffix, wherever the template ends', () => {
    expect(
      parseTileUrl(template, 'https://a.tile.example.com/7/3/5.png@2x'),
    ).toEqual({ x: 3, y: 5, z: 7, s: 'a' });

    const withQuery = '/tiles/{z}/{x}/{y}?key=abc';

    expect(parseTileUrl(withQuery, '/tiles/7/3/5?key=abc@3x')).toEqual({
      x: 3,
      y: 5,
      z: 7,
      s: 'a',
    });
  });

  it('takes the placeholders in whatever order the template has them', () => {
    expect(parseTileUrl('/wmts/{y}/{x}/{z}', '/wmts/5/3/7')).toEqual({
      x: 3,
      y: 5,
      z: 7,
      s: 'a',
    });
  });

  it('rejects a url the template cannot produce', () => {
    expect(parseTileUrl(template, 'https://a.tile.example.com/7/3/5.jpg')).toBe(
      null,
    );

    expect(parseTileUrl(template, 'https://a.other.com/7/3/5.png')).toBe(null);

    // a dot in `{s}` would let one host's tile pass as another's
    expect(parseTileUrl(template, 'https://a.evil.com.x/7/3/5.png')).toBe(null);
  });

  it('rejects a template that names no tile', () => {
    expect(parseTileUrl('/static/logo.png', '/static/logo.png')).toBe(null);
  });
});
