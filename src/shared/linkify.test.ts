import { describe, expect, it } from 'vitest';
import { linkify } from './linkify.js';

const urls = (text: string) => linkify(text, (url) => `<${url}>`).join('');

describe('linkify', () => {
  it('leaves sentence punctuation out of the URL', () => {
    expect(urls('See https://example.com/a, then go.')).toBe(
      'See <https://example.com/a>, then go.',
    );
  });

  it("keeps a URL's own closing bracket", () => {
    expect(urls('(https://en.wikipedia.org/wiki/Foo_(bar))')).toBe(
      '(<https://en.wikipedia.org/wiki/Foo_(bar)>)',
    );
  });

  it('links only http(s)', () => {
    expect(urls('javascript:alert(1) ftp://x.org')).toBe(
      'javascript:alert(1) ftp://x.org',
    );
  });
});
