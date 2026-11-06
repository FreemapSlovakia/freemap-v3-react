const HEADING = /^H([1-6])$/;

// Sister-project names are the same in every language edition, or start "Wiki".
const SISTER_PROJECT = /\bCommons\b|\bWiki\p{L}+/u;

/**
 * Tidies a TextExtracts extract: it strips links, tables, galleries and
 * reference lists but keeps the headings and sister-project lines around them.
 */
export function cleanExtract(html: string): string {
  const { body } = new DOMParser().parseFromString(html, 'text/html');

  // A sister-project item starts with the project's icon; its link is gone.
  for (const li of body.querySelectorAll('li')) {
    if (
      li.querySelector('[typeof="mw:File"]') &&
      SISTER_PROJECT.test(li.textContent)
    ) {
      li.remove();
    }
  }

  for (const list of body.querySelectorAll('ul, ol')) {
    if (!list.querySelector('li')) {
      list.remove();
    }
  }

  dropEmptySections(body);

  return body.innerHTML;
}

function dropEmptySections(body: HTMLElement) {
  // hasContent[l]: content follows, up to the next heading of level <= l.
  const hasContent = new Array<boolean>(7).fill(false);

  for (const node of [...body.childNodes].toReversed()) {
    const level = Number(
      node instanceof Element && HEADING.exec(node.tagName)?.[1],
    );

    if (level) {
      if (hasContent[level]) {
        hasContent.fill(true, 0, level);
      } else {
        node.remove();
      }

      hasContent.fill(false, level);
    } else if (
      node.textContent?.trim() ||
      (node instanceof Element && node.querySelector('img'))
    ) {
      hasContent.fill(true);
    }
  }
}
