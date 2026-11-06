import { describe, expect, it } from 'vitest';
import { cleanExtract } from './cleanExtract.js';

const clean = (html: string) => cleanExtract(html).replace(/\s+/g, '');

describe('cleanExtract', () => {
  it('drops a heading followed by only whitespace', () => {
    expect(
      clean('<p>a</p><h2>Gallery</h2>\n\n<h2>Partners</h2><ul><li>b</li></ul>'),
    ).toBe('<p>a</p><h2>Partners</h2><ul><li>b</li></ul>');
  });

  it('drops a trailing empty heading', () => {
    expect(clean('<p>a</p><h2>References</h2>\n')).toBe('<p>a</p>');
  });

  it('keeps a section whose only content is a subsection', () => {
    expect(clean('<h2>A</h2><h3>B</h3><p>x</p>')).toBe(
      '<h2>A</h2><h3>B</h3><p>x</p>',
    );
  });

  it('drops a section whose subsections are all empty', () => {
    expect(clean('<h2>A</h2><h3>B</h3><h3>C</h3><h2>D</h2><p>x</p>')).toBe(
      '<h2>D</h2><p>x</p>',
    );
  });

  it('drops an empty subsection but keeps its non-empty parent', () => {
    expect(clean('<h2>A</h2><p>x</p><h3>Streets</h3><h2>B</h2><p>y</p>')).toBe(
      '<h2>A</h2><p>x</p><h2>B</h2><p>y</p>',
    );
  });

  it('counts an image as content', () => {
    expect(cleanExtract('<h2>A</h2><p><img src="x.png"></p>')).toBe(
      '<h2>A</h2><p><img src="x.png"></p>',
    );
  });

  it('drops sister-project lines and the section they leave empty', () => {
    expect(
      clean(
        '<p>a</p><h2>Iné projekty</h2><ul>' +
          '<li><span typeof="mw:File"><span title="Spolupracuj na Commons"></span></span> Commons ponúka multimediálne súbory na tému <b>X</b></li>' +
          '<li><span typeof="mw:File"></span> Wikicitáty ponúkajú citáty</li>' +
          '</ul><h2>Externé odkazy</h2><ul><li>Oficiálny web</li></ul>',
      ),
    ).toBe('<p>a</p><h2>Externéodkazy</h2><ul><li>Oficiálnyweb</li></ul>');
  });

  it('keeps an icon item that names no sister project', () => {
    expect(
      clean(
        '<h2>Partnerské obce</h2><ul><li><span typeof="mw:File"><span title="Maďarsko"></span></span> Alsózsolca, Maďarsko</li></ul>',
      ),
    ).toBe(
      '<h2>Partnerskéobce</h2><ul><li><spantypeof="mw:File"><spantitle="Maďarsko"></span></span>Alsózsolca,Maďarsko</li></ul>',
    );
  });
});
