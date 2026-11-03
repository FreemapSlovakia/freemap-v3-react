import { useEffect } from 'react';

/**
 * Caps a map panel's height at the room left below it, so it reaches the
 * bottom of the screen and its `scrollArea` scrolls rather than the page.
 */
export function useFillToBottom(
  panel: HTMLElement | null,
  scrollAreaClass: string,
): void {
  useEffect(() => {
    if (!panel) {
      return;
    }

    const fit = () => {
      const { top } = panel.getBoundingClientRect();

      // The floor leaves the scrolling middle usable beside the pinned header
      // and footer, e.g. while an on-screen keyboard shrinks the viewport.
      const pinned =
        panel.offsetHeight -
        (panel.querySelector<HTMLElement>(`.${scrollAreaClass}`)
          ?.offsetHeight ?? 0);

      window.requestAnimationFrame(() => {
        panel.style.maxHeight = `${Math.max(window.innerHeight - top - 57, pinned + 100)}px`;
      });
    };

    const ro = new ResizeObserver(fit);

    // Its ancestors too: a panel mounting above moves this one without
    // resizing it, but grows the column they share.
    for (let el: HTMLElement | null = panel; el; el = el.parentElement) {
      ro.observe(el);
    }

    window.addEventListener('resize', fit);

    return () => {
      ro.disconnect();

      window.removeEventListener('resize', fit);
    };
  }, [panel, scrollAreaClass]);
}
