import type { ReactNode } from 'react';

// Trailing punctuation belongs to the sentence, not the URL.
const URL_RE = /https?:\/\/[^\s<>"]+[^\s<>".,;:!?)'\]]/g;

/** The text with each http(s) URL in it replaced by what `renderUrl` makes of it. */
export function linkify(
  text: string,
  renderUrl: (url: string, key: number) => ReactNode,
): ReactNode[] {
  const parts: ReactNode[] = [];

  let last = 0;

  for (const match of text.matchAll(URL_RE)) {
    let url = match[0];

    // A `)` closing a `(` of the URL's own is part of it: `…/Foo_(bar)`.
    if (
      text[match.index + url.length] === ')' &&
      url.split('(').length > url.split(')').length
    ) {
      url += ')';
    }

    parts.push(text.slice(last, match.index));

    last = match.index + url.length;

    parts.push(renderUrl(url, match.index));
  }

  parts.push(text.slice(last));

  return parts;
}
