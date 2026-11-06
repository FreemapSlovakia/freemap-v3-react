import { describe, expect, it } from 'vitest';
import { parseWikipediaTag } from './wikipediaTag.js';

describe('parseWikipediaTag', () => {
  it('reads lang:Title', () => {
    expect(parseWikipediaTag('de:Zugspitze')).toEqual({
      lang: 'de',
      title: 'Zugspitze',
    });
  });

  it('reads no language from a capitalised prefix', () => {
    expect(parseWikipediaTag('Category:Castles')).toBe(undefined);
  });

  it('keeps a colon in the title', () => {
    expect(parseWikipediaTag('en:Star Wars: Episode IV')).toEqual({
      lang: 'en',
      title: 'Star Wars: Episode IV',
    });
  });

  it('reads an article URL', () => {
    expect(
      parseWikipediaTag('https://sk.m.wikipedia.org/wiki/Ple%C5%A1ivec_(obec)'),
    ).toEqual({ lang: 'sk', title: 'Plešivec (obec)' });
  });

  it('reads neither a malformed URL nor a bare title', () => {
    expect(parseWikipediaTag('https://sk.wikipedia.org/wiki/100%')).toBe(
      undefined,
    );

    expect(parseWikipediaTag('Bratislava')).toBe(undefined);

    expect(parseWikipediaTag('https://example.com/x')).toBe(undefined);
  });
});
