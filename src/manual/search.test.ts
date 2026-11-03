import { describe, expect, it } from 'vitest';
import { searchSections, sectionsOf } from './search.js';

const html = `
<p>Intro about the map.</p>
<h2>Úvodná obrazovka</h2>
<p>Mapu posúvate ťahaním.</p>
<h2>Vyhľadávanie</h2>
<p>Do poľa napíšte názov miesta a stlačte <kbd>Enter</kbd>.</p>
`;

const sections = sectionsOf('getting-started', html);

describe('sectionsOf', () => {
  it('numbers the sections by the h2 that opens them', () => {
    expect(sections.map(({ section, heading }) => [section, heading])).toEqual([
      [0, undefined],
      [1, 'Úvodná obrazovka'],
      [2, 'Vyhľadávanie'],
    ]);
  });

  it('counts a heading opening the chapter as section 1', () => {
    expect(sectionsOf('x', '<h2>A</h2><p>b</p>')[0]?.section).toBe(1);
  });
});

describe('searchSections', () => {
  it('ignores case and accents', () => {
    expect(searchSections('posuvate', sections).map((h) => h.section)).toEqual([
      1,
    ]);
  });

  it('needs every word in the section', () => {
    expect(searchSections('mapu enter', sections)).toEqual([]);

    expect(searchSections('miesta enter', sections)[0]?.section).toBe(2);
  });

  it('finds a section by its heading alone', () => {
    expect(searchSections('vyhladavanie', sections)[0]?.section).toBe(2);
  });

  it('marks the words in the snippet as written', () => {
    const [hit] = searchSections('posuvate', sections);

    const [start, end] = hit!.marks[0]!;

    expect(hit!.snippet.slice(start, end)).toBe('posúvate');
  });
});
