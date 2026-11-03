import { describe, expect, it } from 'vitest';
import {
  type TileGrid,
  tileAncestors,
  tileTemplateToRegExp,
} from './browseCache.js';

function grid(
  template: string,
  subdomains: string[] = [],
  tms = false,
): TileGrid {
  return { template, re: tileTemplateToRegExp(template), subdomains, tms };
}

describe('tile ancestors', () => {
  const abc = grid('https://{s}.t.invalid/{z}/{x}/{y}.png', ['a', 'b', 'c']);

  it('names the parent on every host, its own first', () => {
    const [first, second, third] = tileAncestors(
      'https://b.t.invalid/10/545/355.png',
      abc,
      1,
    );

    expect(first).toEqual({
      url: 'https://b.t.invalid/9/272/177.png',
      scale: 2,
      col: 1,
      row: 1,
    });

    expect(second.url).toBe('https://a.t.invalid/9/272/177.png');

    expect(third.url).toBe('https://c.t.invalid/9/272/177.png');
  });

  it('goes up as far as asked, and not past zoom 0', () => {
    const urls = tileAncestors(
      'https://a.t.invalid/2/3/1.png@2x?k=1',
      grid('https://a.t.invalid/{z}/{x}/{y}.png'),
      5,
    );

    expect(urls).toEqual([
      { url: 'https://a.t.invalid/1/1/0.png@2x?k=1', scale: 2, col: 1, row: 1 },
      { url: 'https://a.t.invalid/0/0/0.png@2x?k=1', scale: 4, col: 3, row: 1 },
    ]);
  });

  it('counts a TMS row from the bottom', () => {
    const [parent] = tileAncestors(
      'https://t.invalid/3/4/6',
      grid('https://t.invalid/{z}/{x}/{y}', [], true),
      1,
    );

    expect(parent).toEqual({
      url: 'https://t.invalid/2/2/3',
      scale: 2,
      col: 0,
      row: 1,
    });
  });

  it('rewrites every occurrence of a placeholder', () => {
    const repeated = grid('https://t.invalid/{z}/{x}/{y}.png?zoom={z}');

    expect(
      tileAncestors('https://t.invalid/4/8/8.png?zoom=4', repeated, 1)[0].url,
    ).toBe('https://t.invalid/3/4/4.png?zoom=3');

    expect(
      tileAncestors('https://t.invalid/4/8/8.png?zoom=5', repeated, 1),
    ).toEqual([]);
  });

  it('keeps the protocol of a protocol-relative template', () => {
    expect(
      tileAncestors(
        'https://t.invalid/1/1/1.png',
        grid('//t.invalid/{z}/{x}/{y}.png'),
        1,
      )[0].url,
    ).toBe('https://t.invalid/0/0/0.png');
  });

  it('has none for a template without coordinates', () => {
    expect(
      tileAncestors(
        'https://t.invalid/q/{q}',
        grid('https://t.invalid/q/{q}'),
        3,
      ),
    ).toEqual([]);
  });
});
