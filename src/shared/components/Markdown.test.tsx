import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Markdown } from './Markdown.js';

const html = (text: string) => renderToStaticMarkup(<Markdown text={text} />);

describe('Markdown', () => {
  it('reads plain text as itself, line breaks kept', () => {
    expect(html('first line\nsecond')).toBe(
      '<div class="d-flex flex-column gap-1"><p class="mb-0">first line<br/>second</p></div>',
    );
  });

  it('escapes characters once, by React alone', () => {
    expect(html('A & B "q" it\'s Č')).toBe(
      '<div class="d-flex flex-column gap-1"><p class="mb-0">A &amp; B &quot;q&quot; it&#x27;s Č</p></div>',
    );
  });

  it('renders emphasis, lists and links', () => {
    const out = html(
      '**bold** and *it* [map](https://www.freemap.sk/)\n\n- one\n- two',
    );

    expect(out).toContain('<strong>bold</strong>');

    expect(out).toContain('<em>it</em>');

    expect(out).toContain(
      '<a href="https://www.freemap.sk/" target="_blank" rel="noopener noreferrer">map</a>',
    );

    expect(out).toContain('<li>one</li>');
  });

  it('links a bare URL', () => {
    expect(html('see https://example.com/a.')).toContain(
      '<a href="https://example.com/a"',
    );
  });

  it('links an email address', () => {
    expect(html('Píšte na info@kstdk.sk')).toContain(
      '<a href="mailto:info@kstdk.sk"',
    );
  });

  it('never emits markup or unsafe links', () => {
    const out = html(
      '<script>alert(1)</script> [x](javascript:alert(1)) ![i](https://e.com/i.png)',
    );

    expect(out).not.toContain('<script');

    expect(out).not.toContain('href="javascript');

    expect(out).not.toContain('<img');

    expect(out).toContain('&lt;script&gt;');
  });
});
