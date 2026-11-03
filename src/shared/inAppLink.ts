import type { MouseEvent } from 'react';

/**
 * Props of a link the app follows itself on a plain click; a modified click is
 * left to the browser, to open `href` in a new tab or window. Without an
 * `href` there is nothing to leave it, so every click is followed.
 */
export function inAppLink(href: string | undefined, follow: () => void) {
  return {
    href,
    onClick: (e: MouseEvent) => {
      if (
        href !== undefined &&
        (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
      ) {
        return;
      }

      e.preventDefault();

      follow();
    },
  };
}
